// src/hwp/hwpWriter.ts - DocumentModel → HWP 5.0 바이너리 라이터
// @hwp.js/parser 가 읽는 레코드 구조의 역순 구현. 버전 5.0.5.0, 압축 저장,
// CFB 컨테이너는 외부 의존 없이 최소 구현(FAT 전용, 전 스트림 4096B 패딩)으로 내장.
import { deflateRaw } from 'pako';
import { defaultAlign, defaultFontFamily, defaultIndent } from '../settings';
import {
  BLOB_DEFAULTJSCRIPT,
  BLOB_JSCRIPTVERSION,
  BLOB_LINKDOC,
  BLOB_PRVIMAGE,
  BLOB_SUMMARY,
} from './origBlobs';
import type {
  DocumentModel,
  ParagraphNode,
  TableNode,
  TextAlign,
  TextRun,
} from '../types';

// ---- 레코드 태그 (HWPTAG_BEGIN = 16) ----
const TAG_DOCUMENT_PROPERTIES = 16;
const TAG_ID_MAPPINGS = 17;
const TAG_FACE_NAME = 19;
const TAG_BORDER_FILL = 20;
const TAG_CHAR_SHAPE = 21;
const TAG_PARA_SHAPE = 25;
const TAG_STYLE = 26;
const TAG_PARA_HEADER = 66;
const TAG_PARA_TEXT = 67;
const TAG_PARA_CHAR_SHAPE = 68;
const TAG_PARA_LINE_SEG = 69;
const TAG_CTRL_HEADER = 71;
const TAG_LIST_HEADER = 72;
const TAG_TABLE = 77;
const TAG_TAB_DEF = 22;

// 실파일 규격: 버전 5.0.5.0 (rev, build, minor, major)
const HWP_VERSION = [0, 5, 0, 5];

// 본문 너비 (HWPUNIT, 실파일 A4 기준값)
const CONTENT_WIDTH = 42520;


function hexBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

// CFB 요약 스트림명 (앞에 0x05 제어문자, 코드로 생성해 소스 오염 방지)
const SUMMARY_STREAM_NAME = String.fromCharCode(5) + 'HwpSummaryInformation';

// 구역 정의 컨트롤 (실파일 관용 바이트 그대로 복제, A4 기본값)
// SECD CTRL_HEADER 페이로드 (47B)
const SECD_CTRL_HEX = '64636573000000006f0400000000401f00000000000000000000000000000000000000000000000000000000000000';
// PAGE_DEF (73, 40B)
const PAGE_DEF_HEX = '88e80000dc4801003821000038210000241600009c1000009c1000009c1000000000000000000000';
// 각주/미주 모양 (74, 28B) ×2
const FOOTNOTE_HEX_1 = '0000000000000000290001005f370000350235021d01010000000000';
const FOOTNOTE_HEX_2 = '0300000000000000290001005f370000350235020000010000000000';
// 쪽 테두리/배경 (75, 14B) ×3
const PAGE_BORDER_HEX = '0100000089058905890589050100';
// COLD(단 정의) CTRL_HEADER 페이로드 (71, 16B)
const COLD_CTRL_HEX = '646c6f63041000000000000000000000';

// 컨트롤 ID "tbl " (makeCtrlID와 동일 연산: LE U32 값으로 파일에 기록)
const CTRL_ID_TABLE = (0x74 << 24) | (0x62 << 16) | (0x6c << 8) | 0x20;

// HWP 문단 정렬값: 0 양쪽, 1 왼쪽, 2 오른쪽, 3 가운데
const ALIGN_TO_HWP: Record<TextAlign, number> = {
  justify: 0,
  left: 1,
  right: 2,
  center: 3,
};

class ByteBuilder {
  private bytes: number[] = [];

  u8(v: number): void {
    this.bytes.push(v & 0xff);
  }

  u16le(v: number): void {
    this.bytes.push(v & 0xff, (v >>> 8) & 0xff);
  }

  i16le(v: number): void {
    this.u16le(v);
  }

  u32le(v: number): void {
    this.bytes.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  }

  i32le(v: number): void {
    this.u32le(v);
  }

  raw(data: Uint8Array): void {
    for (let i = 0; i < data.length; i++) this.bytes.push(data[i]);
  }

  // UTF-16 코드 유닛 나열 (서로게이트 쌍 유지)
  utf16Units(text: string): void {
    for (let i = 0; i < text.length; i++) this.u16le(text.charCodeAt(i));
  }

  // HWP 문자열: U16 길이(코드 유닛 수) + UTF-16LE
  wstring(text: string): void {
    this.u16le(text.length);
    this.utf16Units(text);
  }

  build(): Uint8Array {
    return new Uint8Array(this.bytes);
  }
}

function packRecord(tag: number, level: number, data: Uint8Array): Uint8Array {
  const size = data.length;
  const out = new ByteBuilder();
  let header = (tag & 0x3ff) | ((level & 0x3ff) << 10);
  if (size > 4094) {
    header |= 0xfff << 20;
    out.u32le(header);
    out.u32le(size);
  } else {
    header |= size << 20;
    out.u32le(header);
  }
  out.raw(data);
  return out.build();
}

function concat(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  parts.forEach((p) => {
    total += p.length;
  });
  const out = new Uint8Array(total);
  let off = 0;
  parts.forEach((p) => {
    out.set(p, off);
    off += p.length;
  });
  return out;
}

// ---- 글자 모양 수집 ----
interface ShapeDef {
  key: string;
  fontFamily: string;
  fontSizePx: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  color: number; // ColorRef (R | G<<8 | B<<16)
  shadeColor: number; // 배경색 (없으면 0)
}

function parseColor(color: string | undefined): number {
  if (!color) return 0;
  const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (m) return (+m[1] & 0xff) | ((+m[2] & 0xff) << 8) | ((+m[3] & 0xff) << 16);
  const h = color.match(/^#([0-9a-fA-F]{6})$/);
  if (h) {
    const v = parseInt(h[1], 16);
    return ((v >>> 16) & 0xff) | (v & 0xff00) | ((v & 0xff) << 16);
  }
  return 0;
}

function shapeOfRun(run: TextRun): ShapeDef {
  const fontSizePx = run.fontSize ?? 16;
  const bold = !!run.bold;
  const italic = !!run.italic;
  const underline = !!run.underline;
  const strike = !!run.strike;
  const fontFamily = run.fontFamily || defaultFontFamily();
  const color = parseColor(run.color);
  // 배경 없음 = 0xFFFFFFFF (0은 검정으로 렌더링됨)
  const shadeColor = run.backgroundColor ? parseColor(run.backgroundColor) : 0xffffffff;
  return {
    key: [fontFamily, fontSizePx, bold ? 1 : 0, italic ? 1 : 0, underline ? 1 : 0, strike ? 1 : 0, color, shadeColor].join('|'),
    fontFamily,
    fontSizePx,
    bold,
    italic,
    underline,
    strike,
    color,
    shadeColor,
  };
}

// ---- 최소 CFB 라이터 (512B 섹터, FAT 전용) ----
const SECTOR_SIZE = 512;
const FREESECT = 0xffffffff;
const ENDOFCHAIN = 0xfffffffe;
const FATSECT = 0xfffffffd;
const NOSTREAM = 0xffffffff;

function writeU16LE(buf: Uint8Array, off: number, v: number): void {
  buf[off] = v & 0xff;
  buf[off + 1] = (v >>> 8) & 0xff;
}

function writeU32LE(buf: Uint8Array, off: number, v: number): void {
  buf[off] = v & 0xff;
  buf[off + 1] = (v >>> 8) & 0xff;
  buf[off + 2] = (v >>> 16) & 0xff;
  buf[off + 3] = (v >>> 24) & 0xff;
}

function writeDirEntry(
  dir: Uint8Array,
  index: number,
  name: string,
  type: number,
  left: number,
  right: number,
  child: number,
  color: number,
  startSector: number,
  size: number,
): void {
  const off = index * 128;
  const nameLen = Math.min(name.length, 31);
  for (let i = 0; i < nameLen; i++) writeU16LE(dir, off + i * 2, name.charCodeAt(i));
  writeU16LE(dir, off + nameLen * 2, 0);
  writeU16LE(dir, off + 64, (nameLen + 1) * 2);
  dir[off + 66] = type;
  dir[off + 67] = color;
  writeU32LE(dir, off + 68, left);
  writeU32LE(dir, off + 72, right);
  writeU32LE(dir, off + 76, child);
  // CLSID(16) + state(4) + creation(8) + modified(8) = 0
  writeU32LE(dir, off + 116, startSector);
  writeU32LE(dir, off + 120, size);
  writeU32LE(dir, off + 124, 0);
}

interface CfbEntrySpec {
  name: string;
  type: number; // 1: 스토리지, 2: 스트림, 5: 루트
  data?: Uint8Array; // 스트림 바이트 (스토리지·루트는 없음)
  left: number;
  right: number;
  child: number;
  color: number; // 0: 빨강, 1: 검정
}

const MINI_CUTOFF = 4096;

// 원본과 동일한 디렉터리 트리·색상을 재현하는 CFB 라이터.
// 4096B 미만 스트림은 미니스트림, 이상은 일반 FAT 체인에 저장.
function buildCfbFile(specs: CfbEntrySpec[]): Uint8Array {
  const MINI = 64;
  const miniStartBySpec = new Map<number, number>();
  const miniCountBySpec = new Map<number, number>();
  const miniChunks: Uint8Array[] = [];
  specs.forEach((s, i) => {
    if (s.type !== 2 || !s.data || s.data.length >= MINI_CUTOFF) return;
    miniStartBySpec.set(i, miniChunks.length);
    const data = s.data.length > 0 ? s.data : new Uint8Array(0);
    const n = Math.max(1, Math.ceil(data.length / MINI));
    miniCountBySpec.set(i, n);
    for (let k = 0; k < n; k++) {
      const chunk = new Uint8Array(MINI);
      chunk.set(data.subarray(k * MINI, Math.min(data.length, (k + 1) * MINI)), 0);
      miniChunks.push(chunk);
    }
  });
  const ministream = new Uint8Array(miniChunks.length * MINI);
  miniChunks.forEach((c, i) => ministream.set(c, i * MINI));
  const miniFat = new Uint32Array(miniChunks.length).fill(ENDOFCHAIN);
  miniStartBySpec.forEach((start, i) => {
    const n = miniCountBySpec.get(i) || 1;
    for (let k = 0; k < n - 1; k++) miniFat[start + k] = start + k + 1;
  });

  const bigIdx: number[] = [];
  specs.forEach((s, i) => {
    if (s.type === 2 && s.data && s.data.length >= MINI_CUTOFF) bigIdx.push(i);
  });
  const bigSectorsBySpec = new Map<number, number>();
  bigIdx.forEach((i) => {
    const len = (specs[i].data as Uint8Array).length;
    bigSectorsBySpec.set(i, Math.max(1, Math.ceil(len / SECTOR_SIZE)));
  });

  const dirSectors = Math.max(1, Math.ceil((specs.length * 128) / SECTOR_SIZE));
  const ministreamSectors = Math.max(1, Math.ceil(ministream.length / SECTOR_SIZE));
  const miniFatSectors = Math.max(1, Math.ceil((miniFat.length * 4) / SECTOR_SIZE));
  let bigTotal = 0;
  bigSectorsBySpec.forEach((n) => {
    bigTotal += n;
  });
  // FAT 섹터 수 고정점 (FAT 자체가 차지하는 섹터 포함)
  let fatSectors = 1;
  for (let iter = 0; iter < 4; iter++) {
    const total = fatSectors + dirSectors + ministreamSectors + bigTotal + miniFatSectors;
    fatSectors = Math.max(1, Math.ceil(total / 128));
  }
  const totalSectors = fatSectors + dirSectors + ministreamSectors + bigTotal + miniFatSectors;
  const fat = new Uint32Array(fatSectors * 128).fill(FREESECT);
  for (let i = 0; i < fatSectors; i++) fat[i] = FATSECT;
  let sec = fatSectors;
  const chainSectors = (n: number): number => {
    const start = sec;
    for (let k = 0; k < n; k++) fat[sec + k] = k + 1 < n ? sec + k + 1 : ENDOFCHAIN;
    sec += n;
    return start;
  };
  const dirStart = chainSectors(dirSectors);
  const ministreamStart = chainSectors(ministreamSectors);
  const bigStartBySpec = new Map<number, number>();
  bigIdx.forEach((i) => {
    const n = bigSectorsBySpec.get(i) || 1;
    bigStartBySpec.set(i, chainSectors(n));
  });
  const miniFatStart = chainSectors(miniFatSectors);

  const total = 512 + totalSectors * SECTOR_SIZE;
  const out = new Uint8Array(total);
  const sig = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  sig.forEach((b, i) => {
    out[i] = b;
  });
  writeU16LE(out, 24, 0x3e); // minor
  writeU16LE(out, 26, 0x03); // major (512B 섹터)
  writeU16LE(out, 28, 0xfffe); // byte order
  writeU16LE(out, 30, 9); // sector shift
  writeU16LE(out, 32, 6); // mini sector shift
  writeU32LE(out, 40, 0); // 디렉터리 섹터 수 (v3에서는 0)
  writeU32LE(out, 44, fatSectors); // FAT 섹터 수
  writeU32LE(out, 48, dirStart); // 첫 디렉터리 섹터
  writeU32LE(out, 52, 0); // transaction
  writeU32LE(out, 56, MINI_CUTOFF); // mini cutoff
  writeU32LE(out, 60, miniFatStart); // 첫 MiniFAT
  writeU32LE(out, 64, miniFatSectors); // MiniFAT 수
  writeU32LE(out, 68, FREESECT); // 첫 DIFAT
  writeU32LE(out, 72, 0); // DIFAT 수
  for (let i = 0; i < 109; i++) {
    writeU32LE(out, 76 + i * 4, i < fatSectors ? i : FREESECT);
  }
  for (let i = 0; i < fatSectors * 128; i++) writeU32LE(out, 512 + i * 4, fat[i]);

  // 디렉터리
  const dir = new Uint8Array(dirSectors * SECTOR_SIZE);
  specs.forEach((s, i) => {
    let start = ENDOFCHAIN;
    let size = 0;
    if (i === 0) {
      start = ministreamStart;
      size = ministream.length;
    } else if (s.type === 2 && s.data) {
      size = s.data.length;
      if (s.data.length >= MINI_CUTOFF) {
        const st = bigStartBySpec.get(i);
        start = st === undefined ? ENDOFCHAIN : st;
      } else {
        const st = miniStartBySpec.get(i);
        start = st === undefined ? ENDOFCHAIN : st;
      }
    }
    writeDirEntry(dir, i, s.name, s.type, s.left, s.right, s.child, s.color, start, size);
  });
  out.set(dir, 512 + dirStart * SECTOR_SIZE);

  // 데이터
  let doff = 512 + (dirStart + dirSectors) * SECTOR_SIZE;
  const msPad = new Uint8Array(ministreamSectors * SECTOR_SIZE);
  msPad.set(ministream, 0);
  out.set(msPad, doff);
  doff += msPad.length;
  bigIdx.forEach((i) => {
    const data = specs[i].data as Uint8Array;
    const n = bigSectorsBySpec.get(i) || 1;
    const pad = new Uint8Array(n * SECTOR_SIZE);
    pad.set(data, 0);
    out.set(pad, doff);
    doff += pad.length;
  });
  const mfPad = new Uint8Array(miniFatSectors * SECTOR_SIZE);
  for (let i = 0; i < miniFat.length; i++) {
    const v = miniFat[i];
    mfPad[i * 4] = v & 0xff;
    mfPad[i * 4 + 1] = (v >>> 8) & 0xff;
    mfPad[i * 4 + 2] = (v >>> 16) & 0xff;
    mfPad[i * 4 + 3] = (v >>> 24) & 0xff;
  }
  out.set(mfPad, doff);
  return out;
}

export class HwpWriter {
  private shapes: ShapeDef[] = [];
  private shapeIndexByKey = new Map<string, number>();
  private paraShapes: Array<{ align: number; indentPx: number }> = []; // 사용 순서대로 문단 모양
  private paraShapeIndexByAlign = new Map<string, number>();
  private koFaces: string[] = [];

  private docModel: DocumentModel;

  constructor(docModel: DocumentModel) {
    this.docModel = docModel;
  }

  public write(): Uint8Array {
    this.collectStyles();
    const spec = (
      name: string,
      type: number,
      data: Uint8Array | undefined,
      left: number,
      right: number,
      child: number,
      color: number,
    ): CfbEntrySpec => ({ name, type, data, left, right, child, color });
    const N = NOSTREAM;
    // 원본과 동일한 13엔트리 트리 (링크·색상 그대로)
    return buildCfbFile([
      spec('Root Entry', 5, undefined, N, N, 1, 0),
      spec('FileHeader', 2, this.buildFileHeader(), 4, 2, N, 1),
      spec(SUMMARY_STREAM_NAME, 2, hexBytes(BLOB_SUMMARY), N, N, N, 1),
      spec('DocInfo', 2, deflateRaw(this.buildDocInfo()), N, N, N, 0),
      spec('BodyText', 1, undefined, 6, 5, 12, 1),
      spec('PrvImage', 2, hexBytes(BLOB_PRVIMAGE), N, 7, N, 1),
      spec('PrvText', 2, this.buildPrvText(), 3, 8, N, 1),
      spec('DocOptions', 1, undefined, N, N, 11, 0),
      spec('Scripts', 1, undefined, N, N, 9, 0),
      spec('JScriptVersion', 2, hexBytes(BLOB_JSCRIPTVERSION), 10, N, N, 1),
      spec('DefaultJScript', 2, hexBytes(BLOB_DEFAULTJSCRIPT), N, N, N, 0),
      spec('_LinkDoc', 2, hexBytes(BLOB_LINKDOC), N, N, N, 1),
      spec('Section0', 2, deflateRaw(this.buildSection()), N, N, N, 1),
    ]);
  }

  // 미리보기 텍스트 (첫 비어있지 않은 문단 + CRLF, UTF-16LE)
  private buildPrvText(): Uint8Array {
    let first = '';
    for (const item of this.docModel) {
      if (item.type === 'paragraph') {
        const t = this.paraText(item);
        if (t.length > 0) {
          first = t;
          break;
        }
      }
    }
    const out = new ByteBuilder();
    out.utf16Units((first + '\r\n').slice(0, 512));
    return out.build();
  }

  // ---- 1단계: 스타일 수집 ----
  private collectStyles(): void {
    const faceSet = new Map<string, number>();
    const addRun = (run: TextRun) => {
      const def = shapeOfRun(run);
      if (!this.shapeIndexByKey.has(def.key)) {
        this.shapeIndexByKey.set(def.key, this.shapes.length);
        this.shapes.push(def);
      }
      if (!faceSet.has(def.fontFamily)) {
        faceSet.set(def.fontFamily, this.koFaces.length);
        this.koFaces.push(def.fontFamily);
      }
    };
    const addPara = (para: ParagraphNode) => {
      (para.children || []).forEach(addRun);
      const hwpAlign = ALIGN_TO_HWP[para.align ?? defaultAlign()];
      const indentPx = para.indent ?? defaultIndent();
      const key = `${hwpAlign}|${indentPx}`;
      if (!this.paraShapeIndexByAlign.has(key)) {
        this.paraShapeIndexByAlign.set(key, this.paraShapes.length);
        this.paraShapes.push({ align: hwpAlign, indentPx });
      }
    };
    this.docModel.forEach((item) => {
      if (item.type === 'paragraph') {
        addPara(item);
      } else {
        item.rows.forEach((row) => {
          row.cells.forEach((cell) => {
            (cell.children || []).forEach(addRun);
          });
        });
        // 셀 문단은 기본 모양 사용 (DocInfo 기록 전 보장)
        this.ensureDefaultShape();
      }
    });
    if (this.koFaces.length === 0) this.koFaces.push(defaultFontFamily());
    if (this.shapes.length === 0) {
      const def = shapeOfRun({ text: '' });
      this.shapeIndexByKey.set(def.key, 0);
      this.shapes.push(def);
    }
  }

  // ---- 2단계: FileHeader 256B ----
  private buildFileHeader(): Uint8Array {
    const out = new ByteBuilder();
    const sig = 'HWP Document File';
    for (let i = 0; i < 17; i++) out.u8(i < sig.length ? sig.charCodeAt(i) : 0);
    for (let i = 0; i < 15; i++) out.u8(0);
    out.u8(HWP_VERSION[0]); // revision
    out.u8(HWP_VERSION[1]); // build
    out.u8(HWP_VERSION[2]); // minor
    out.u8(HWP_VERSION[3]); // major → 5.0.5.0
    out.u32le(1); // flags (bit0 = 압축)
    out.u32le(0); // license
    out.i32le(4); // encryptVersion (실파일 관용값, 내용은 평문)
    out.u8(0); // kogl = None
    for (let i = 0; i < 207; i++) out.u8(0); // reserved
    return out.build();
  }

  // ---- 3단계: DocInfo ----
  private buildDocInfo(): Uint8Array {
    const parts: Uint8Array[] = [];
    // 문서 속성 (26B, sections=1)
    const prop = new ByteBuilder();
    prop.u16le(1);
    for (let i = 0; i < 6; i++) prop.u16le(1); // 시작 번호 (실파일 관용값)
    prop.u32le(0);
    prop.u32le(0);
    prop.u32le(0);
    parts.push(packRecord(TAG_DOCUMENT_PROPERTIES, 0, prop.build()));
    // ID 매핑 (60B)
    const single = (name: string): string[] => (name === 'ko' ? this.koFaces : ['Arial']);
    const counts = [
      0, // binaryData
      single('ko').length,
      single('en').length,
      single('hz').length,
      single('jp').length,
      single('etc').length,
      single('sym').length,
      single('user').length,
      1, // borderFills
      this.shapes.length, // charShapes
      1, // tabDefinitions (기본 1개, dangling 참조 방지)
      0, // numberings
      0, // bullets
      this.paraShapes.length, // paragraphShapes
      1, // styles
    ];
    const mapping = new ByteBuilder();
    counts.forEach((c) => mapping.i32le(c));
    mapping.i32le(0); // memoShapes (5.0.2.1+)
    // 주의: 실파일 관용상 64B에서 종료 (hwp.js의 5.0.3.2+ 72B 게이팅은 실파일과 불일치)
    parts.push(packRecord(TAG_ID_MAPPINGS, 0, mapping.build()));
    // 글꼴 (7그룹 순서 고정)
    ['ko', 'en', 'hz', 'jp', 'etc', 'sym', 'user'].forEach((g) => {
      single(g).forEach((name) => parts.push(packRecord(TAG_FACE_NAME, 1, this.buildFace(name))));
    });
    // 테두리/배경 1개 (없음)
    parts.push(packRecord(TAG_BORDER_FILL, 1, this.buildBorderFill()));
    // 글자 모양
    this.shapes.forEach((def) => {
      parts.push(packRecord(TAG_CHAR_SHAPE, 1, this.buildCharShape(def)));
    });
    // 탭 정의 1개 (기본값 8B, 글자 모양 뒤)
    parts.push(packRecord(TAG_TAB_DEF, 1, new Uint8Array(8)));
    // 문단 모양
    this.paraShapes.forEach((def) => {
      parts.push(packRecord(TAG_PARA_SHAPE, 1, this.buildParaShape(def)));
    });
    // 스타일 1개
    parts.push(packRecord(TAG_STYLE, 1, this.buildStyle()));
    return concat(parts);
  }

  private buildFace(name: string): Uint8Array {
    const out = new ByteBuilder();
    out.u8(0); // properties (대체·PANose·기본 글꼴 없음)
    out.wstring(name);
    return out.build();
  }

  private buildBorderFill(): Uint8Array {
    const out = new ByteBuilder();
    out.u16le(0); // attributes
    for (let i = 0; i < 5; i++) {
      out.u8(0); // width
      out.u8(0); // kind
      out.u32le(0); // color
    }
    out.u32le(0); // fill kind = None
    out.u32le(0);
    return out.build();
  }

  private buildCharShape(def: ShapeDef): Uint8Array {
    const out = new ByteBuilder();
    const koIdx = this.koFaces.indexOf(def.fontFamily);
    const fontId = koIdx >= 0 ? koIdx : 0;
    for (let i = 0; i < 7; i++) out.u16le(i <= 1 ? fontId : 0);
    for (let i = 0; i < 7; i++) out.u8(100); // fontScales
    for (let i = 0; i < 7; i++) out.u8(0); // fontSpacings (I8 0)
    for (let i = 0; i < 7; i++) out.u8(100); // fontSizes
    for (let i = 0; i < 7; i++) out.u8(0); // fontPositions (I8 0)
    out.i32le(Math.round(def.fontSizePx * 75)); // px → 0.01pt
    let attr = 0;
    if (def.italic) attr |= 1;
    if (def.bold) attr |= 2;
    if (def.underline) attr |= 1 << 2;
    if (def.strike) attr |= 1 << 18;
    out.u32le(attr);
    out.u8(0);
    out.u8(0); // shadow offsets
    out.u32le(def.color);
    out.u32le(0); // underlineColor
    out.u32le(def.shadeColor); // shadeColor (배경색)
    out.u32le(0); // shadowColor
    out.u16le(0); // borderFillId (5.0.2.1+)
    out.u32le(0); // strikeColor (5.0.3.0+)
    return out.build();
  }

  private buildParaShape(def: { align: number; indentPx: number }): Uint8Array {
    const out = new ByteBuilder();
    out.u32le(0x180 | ((def.align & 0x7) << 2)); // attribute (실파일 관용값 + 정렬 비트)
    out.i32le(0); // paddingLeft
    out.i32le(0); // paddingRight
    out.i32le(Math.round(def.indentPx * 75)); // indent (px → HWPUNIT, 음수=내어쓰기)
    out.i32le(0); // marginTop
    out.i32le(0); // marginBottom
    out.i32le(160); // lineSpaceOld
    out.u16le(0); // tabDefinitionId
    out.u16le(0); // numberingBulletId
    out.u16le(0); // borderFillId
    out.i16le(0); // border offsets ×4
    out.i16le(0);
    out.i16le(0);
    out.i16le(0);
    out.u32le(0); // attrV2 (5.0.1.7+)
    out.u32le(0); // attrV3 (5.0.2.5+)
    out.u32le(160); // lineSpacing (5.0.2.5+)
    return out.build();
  }

  private buildStyle(): Uint8Array {
    const out = new ByteBuilder();
    out.wstring('');
    out.wstring('');
    out.u8(0); // kind = Para
    out.u8(0); // nextStyleId
    out.u16le(0x0412); // langId (한글)
    out.u16le(0); // paragraphShapeId
    out.u16le(0); // charShapeId
    out.u16le(0); // lockForm
    return out.build();
  }

  // 제어 문자 정리: 탭→공백, 개행→공백 (한 문단=한 HWP 문단)
  private cleanText(text: string): string {
    return text.replace(/\t/g, ' ').replace(/[\r\n]+/g, ' ');
  }

  private paraText(para: ParagraphNode): string {
    return (para.children || []).map((r) => this.cleanText(r.text || '')).join('');
  }

  // ---- 4단계: BodyText Section0 ----
  // 실파일 관용 규칙:
  // - 존재하는 TEXT는 항상 [13] 단락 끝 문자로 종결, chars = 전체 U16 유닛 수
  // - 빈 문단(텍스트·컨트롤 없음)은 TEXT 생략 + chars=1 + 모양/줄정보 유지
  // - bit31 = 섹션 마지막 문단
  // - 섹션 첫 문단에 구역 정의 컨트롤(SECD + COLD) 부여
  private buildSection(): Uint8Array {
    const parts: Uint8Array[] = [];
    const lastIdx = this.docModel.length - 1;
    this.docModel.forEach((item, idx) => {
      const leading = idx === 0 ? ['secd', 'cold'] : [];
      const isLast = idx === lastIdx;
      if (item.type === 'paragraph') {
        parts.push(...this.buildParagraph(item, 0, leading, isLast));
      } else {
        parts.push(...this.buildHostParagraphForTable(item, leading, isLast));
      }
    });
    return concat(parts);
  }

  // 선행 컨트롤 확장 문자 (코드 2 + 12B 버퍼 + 에코)
  // 버퍼는 원본과 동일 바이트 (0 채움 시 한컴이 공백으로 렌더링할 수 있음)
  private controlChar(out: ByteBuilder, bufHex: string | null = null): void {
    out.u16le(2);
    if (bufHex) out.raw(hexBytes(bufHex));
    else for (let i = 0; i < 12; i++) out.u8(0);
    out.u16le(2);
  }

  private leadingBuf(name: string): string | null {
    if (name === 'secd') return '646365730000000000000000';
    if (name === 'cold') return '646c6f630000000000000000';
    return null;
  }

  // 구역 정의 레코드 묶음 (SECD + 하위 + COLD)
  private buildSectionCtrls(base: number): Uint8Array[] {
    return [
      packRecord(TAG_CTRL_HEADER, base + 1, hexBytes(SECD_CTRL_HEX)),
      packRecord(73, base + 2, hexBytes(PAGE_DEF_HEX)),
      packRecord(74, base + 2, hexBytes(FOOTNOTE_HEX_1)),
      packRecord(74, base + 2, hexBytes(FOOTNOTE_HEX_2)),
      packRecord(75, base + 2, hexBytes(PAGE_BORDER_HEX)),
      packRecord(75, base + 2, hexBytes(PAGE_BORDER_HEX)),
      packRecord(75, base + 2, hexBytes(PAGE_BORDER_HEX)),
      packRecord(TAG_CTRL_HEADER, base + 1, hexBytes(COLD_CTRL_HEX)),
    ];
  }

  // 일반 문단 (레벨 base: 셀 내부는 base=2)
  // 실파일 규칙: TEXT는 [13]으로 종결, chars = 전체 유닛, 완전 빈 문단은 TEXT 생략+chars=1
  private buildParagraph(para: ParagraphNode, base: number, leading: string[] = [], isLast = false): Uint8Array[] {
    const text = this.paraText(para);
    const runs = this.runsWithShape(para);
    const hasBody = text.length > 0 || leading.length > 0;
    const parts: Uint8Array[] = [];
    const mask = leading.includes('secd') ? 0x4 : 0;
    const breakOpts = leading.length > 0 ? 3 : 0;
    let chars = 1;
    if (hasBody) chars = text.length + (text.length > 0 ? 1 : 0) + leading.length * 8;
    if (isLast) chars |= 0x80000000;
    const shapeEntries = runs.length > 0 ? runs : [{ start: 0, shapeId: 0 }];
    parts.push(
      packRecord(
        TAG_PARA_HEADER,
        base,
        this.buildParaHeader(chars, this.paraShapeOf(para), shapeEntries.length, 1, mask, breakOpts),
      ),
    );
    if (hasBody) {
      const textBuf = new ByteBuilder();
      leading.forEach((name) => this.controlChar(textBuf, this.leadingBuf(name)));
      textBuf.utf16Units(text);
      if (text.length > 0) textBuf.u16le(13); // 단락 끝 문자
      parts.push(packRecord(TAG_PARA_TEXT, base + 1, textBuf.build()));
    }
    const shapeBuf = new ByteBuilder();
    shapeEntries.forEach((r) => {
      shapeBuf.u32le(r.start);
      shapeBuf.u32le(r.shapeId);
    });
    parts.push(packRecord(TAG_PARA_CHAR_SHAPE, base + 1, shapeBuf.build()));
    parts.push(packRecord(TAG_PARA_LINE_SEG, base + 1, this.buildLineSeg(para, text.length === 0)));
    if (leading.length > 0) parts.push(...this.buildSectionCtrls(base));
    return parts;
  }

  // 줄 정보 캐시 (단일 세그먼트, 실파일 관용값)
  private buildLineSeg(para: ParagraphNode, useDefault = false): Uint8Array {
    let maxBase = 2000;
    if (!useDefault) {
      maxBase = 1000;
      (para.children || []).forEach((run) => {
        const def = shapeOfRun(run);
        const base = Math.round(def.fontSizePx * 75);
        if (base > maxBase) maxBase = base;
      });
    }
    const out = new ByteBuilder();
    out.u32le(0); // startPosition
    out.i32le(0); // verticalPosition
    out.i32le(maxBase); // lineHeight
    out.i32le(maxBase); // textHeight
    out.i32le(Math.round((maxBase * 85) / 100)); // baseLineGap
    out.i32le(useDefault ? 1600 : 600); // lineSpacing (실파일 관용값)
    out.i32le(0); // startPositionInColumn
    out.i32le(CONTENT_WIDTH); // width
    out.u32le(0x60000); // tag (first + last)
    return out.build();
  }

  private defaultShapeKey(): string {
    return `${ALIGN_TO_HWP[defaultAlign()]}|${defaultIndent()}`;
  }

  private ensureDefaultShape(): void {
    const key = this.defaultShapeKey();
    if (!this.paraShapeIndexByAlign.has(key)) {
      this.paraShapeIndexByAlign.set(key, this.paraShapes.length);
      this.paraShapes.push({ align: ALIGN_TO_HWP[defaultAlign()], indentPx: defaultIndent() });
    }
  }

  private paraShapeOf(para: ParagraphNode): number {
    const key = `${ALIGN_TO_HWP[para.align ?? defaultAlign()]}|${para.indent ?? defaultIndent()}`;
    return this.paraShapeIndexByAlign.get(key) ?? 0;
  }

  private runsWithShape(para: ParagraphNode): Array<{ start: number; shapeId: number }> {
    const entries: Array<{ start: number; shapeId: number }> = [];
    let pos = 0;
    let pendingId = -1;
    let pendingStart = 0;
    const flush = () => {
      if (pendingId >= 0) entries.push({ start: pendingStart, shapeId: pendingId });
      pendingId = -1;
    };
    (para.children || []).forEach((run) => {
      const text = this.cleanText(run.text || '');
      if (text.length === 0) return;
      const id = this.shapeIndexByKey.get(shapeOfRun(run).key) ?? 0;
      if (id !== pendingId) {
        flush();
        pendingId = id;
        pendingStart = pos;
      }
      pos += text.length;
    });
    flush();
    return entries;
  }

  private buildParaHeader(chars: number, paraShapeId: number, shapeCount: number, aligns = 0, mask = 0, breakOpts = 0): Uint8Array {
    const out = new ByteBuilder();
    out.u32le(chars);
    out.u32le(mask); // ctrlMask
    out.u16le(paraShapeId);
    out.u8(0); // styleId
    out.u8(breakOpts); // breakOptions
    out.u16le(shapeCount);
    out.u16le(0); // ranges
    out.u16le(aligns); // aligns
    out.u32le(0); // instanceId
    out.u16le(0); // trackingChangeMerged (5.0.3.2+)
    return out.build();
  }

  // 표 호스트 문단: 확장 컨트롤 + [13] + CTRL_HEADER + TABLE + 셀
  private buildHostParagraphForTable(table: TableNode, leading: string[] = [], isLast = false): Uint8Array[] {
    const parts: Uint8Array[] = [];
    const header = new ByteBuilder();
    let hostChars = leading.length * 8 + 9; // 선행 컨트롤 + 표 컨트롤(8) + [13](1)
    if (isLast) hostChars |= 0x80000000;
    header.u32le(hostChars);
    header.u32le(leading.includes('secd') ? 0x4 : 0); // ctrlMask
    header.u16le(this.paraShapeIndexByAlign.get(this.defaultShapeKey()) ?? 0); // 기본 문단 모양
    header.u8(0);
    header.u8(leading.length > 0 ? 3 : 0); // breakOptions
    header.u16le(0); // charShapes (호스트 텍스트 모양 없음)
    header.u16le(0);
    header.u16le(0);
    header.u32le(0);
    header.u16le(0); // trackingChangeMerged (5.0.3.2+)
    parts.push(packRecord(TAG_PARA_HEADER, 0, header.build()));
    const text = new ByteBuilder();
    leading.forEach((name) => this.controlChar(text, this.leadingBuf(name)));
    this.controlChar(text); // 표 컨트롤
    text.u16le(13); // 단락 끝 문자
    parts.push(packRecord(TAG_PARA_TEXT, 1, text.build()));
    if (leading.length > 0) parts.push(...this.buildSectionCtrls(0));
    parts.push(packRecord(TAG_CTRL_HEADER, 1, this.buildCtrlHeader()));
    parts.push(packRecord(TAG_TABLE, 1, this.buildTableRecord(table)));
    const cols = this.tableCols(table);
    table.rows.forEach((row, r) => {
      for (let c = 0; c < cols; c++) {
        parts.push(...this.buildCell(row.cells[c], r, c));
      }
    });
    return parts;
  }

  private tableCols(table: TableNode): number {
    let cols = 0;
    table.rows.forEach((row) => {
      if (row.cells.length > cols) cols = row.cells.length;
    });
    return Math.max(1, cols);
  }

  private buildCtrlHeader(): Uint8Array {
    const out = new ByteBuilder();
    out.u32le(CTRL_ID_TABLE);
    out.u32le(0); // attribute
    out.i32le(0); // offsetVert
    out.i32le(0); // offsetHorz
    out.u32le(0); // width
    out.u32le(0); // height
    out.i32le(0); // zOrder
    out.i16le(0);
    out.i16le(0);
    out.i16le(0);
    out.i16le(0); // margin ×4
    out.u32le(0); // instanceId
    out.i32le(0); // preventPageBreak
    return out.build();
  }

  private buildTableRecord(table: TableNode): Uint8Array {
    const cols = this.tableCols(table);
    const out = new ByteBuilder();
    out.u32le(0); // properties
    out.u16le(table.rows.length);
    out.u16le(cols);
    out.i16le(0); // cellSpacing
    out.i16le(0);
    out.i16le(0);
    out.i16le(0);
    out.i16le(0); // padding ×4
    table.rows.forEach(() => out.u16le(cols)); // rowCounts
    out.u16le(0); // borderFillId
    out.u16le(0); // zoneCount (5.0.1.0+)
    return out.build();
  }

  private buildCell(
    cell: { children?: TextRun[] } | undefined,
    row: number,
    col: number,
  ): Uint8Array[] {
    const parts: Uint8Array[] = [];
    const children = (cell && cell.children) || [];
    const text = children.map((r) => this.cleanText(r.text || '')).join('');
    const hasText = text.length > 0;
    const list = new ByteBuilder();
    list.u32le(hasText ? 1 : 0); // count
    list.u32le(0); // attribute
    // 트레일러는 LIST_HEADER 레코드 데이터 내부에 포함
    list.u16le(col);
    list.u16le(row);
    list.u16le(1); // colSpan
    list.u16le(1); // rowSpan
    list.u32le(0); // width
    list.u32le(0); // height
    list.u16le(0);
    list.u16le(0);
    list.u16le(0);
    list.u16le(0); // padding ×4
    list.u16le(1); // borderFillId (저장값 +1)
    parts.push(packRecord(TAG_LIST_HEADER, 1, list.build()));
    if (hasText) {
      const para: ParagraphNode = { type: 'paragraph', children: children as TextRun[] };
      parts.push(...this.buildParagraph(para, 2));
    }
    return parts;
  }
}