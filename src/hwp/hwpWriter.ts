// src/hwp/hwpWriter.ts - DocumentModel → HWP 5.0 바이너리 라이터
// @hwp.js/parser 가 읽는 레코드 구조의 역순 구현. 버전 5.0.5.0, 압축 저장,
// CFB 컨테이너는 외부 의존 없이 최소 구현(FAT 전용, 전 스트림 4096B 패딩)으로 내장.
import { deflateRaw } from 'pako';
import { defaultAlign, defaultFontFamily, defaultIndent, defaultLineSpacing } from '../settings';
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

// CFB 요약 스트림명 (앞에 0x05 제어문자)
const SUMMARY_STREAM_NAME = String.fromCharCode(5) + 'HwpSummaryInformation';

// 구역 정의 컨트롤 (실파일 관용 바이트 그대로 복제, A4 기본값)
const SECD_CTRL_HEX = '64636573000000006f0400000000401f00000000000000000000000000000000000000000000000000000000000000';
const PAGE_DEF_HEX = '88e80000dc4801003821000038210000241600009c1000009c1000009c1000000000000000000000';
const FOOTNOTE_HEX_1 = '0000000000000000290001005f370000350235021d01010000000000';
const FOOTNOTE_HEX_2 = '0300000000000000290001005f370000350235020000010000000000';
const PAGE_BORDER_HEX = '0100000089058905890589050100';
const COLD_CTRL_HEX = '646c6f63041000000000000000000000';

const CTRL_ID_TABLE = (0x74 << 24) | (0x62 << 16) | (0x6c << 8) | 0x20;

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

  utf16Units(text: string): void {
    for (let i = 0; i < text.length; i++) this.u16le(text.charCodeAt(i));
  }

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

interface ShapeDef {
  key: string;
  fontFamily: string;
  fontSizePx: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  color: number;
  shadeColor: number;
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
  writeU32LE(dir, off + 116, startSector);
  writeU32LE(dir, off + 120, size);
  writeU32LE(dir, off + 124, 0);
}

interface CfbEntrySpec {
  name: string;
  type: number;
  data?: Uint8Array;
  left: number;
  right: number;
  child: number;
  color: number;
}

const MINI_CUTOFF = 4096;

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
  writeU16LE(out, 24, 0x3e);
  writeU16LE(out, 26, 0x03);
  writeU16LE(out, 28, 0xfffe);
  writeU16LE(out, 30, 9);
  writeU16LE(out, 32, 6);
  writeU32LE(out, 40, 0);
  writeU32LE(out, 44, fatSectors);
  writeU32LE(out, 48, dirStart);
  writeU32LE(out, 52, 0);
  writeU32LE(out, 56, MINI_CUTOFF);
  writeU32LE(out, 60, miniFatStart);
  writeU32LE(out, 64, miniFatSectors);
  writeU32LE(out, 68, FREESECT);
  writeU32LE(out, 72, 0);
  for (let i = 0; i < 109; i++) {
    writeU32LE(out, 76 + i * 4, i < fatSectors ? i : FREESECT);
  }
  for (let i = 0; i < fatSectors * 128; i++) writeU32LE(out, 512 + i * 4, fat[i]);

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
  private paraShapes: Array<{ align: number; indentPx: number; lineSpacing: number }> = [];
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

  private collectStyles(): void {
    const faceSet = new Set<string>();
    const addRun = (run: TextRun) => {
      const def = shapeOfRun(run);
      if (!this.shapeIndexByKey.has(def.key)) {
        this.shapeIndexByKey.set(def.key, this.shapes.length);
        this.shapes.push(def);
      }
      faceSet.add(def.fontFamily);
    };
    const addPara = (para: ParagraphNode) => {
      (para.children || []).forEach(addRun);
      this.ensureParaShape(
        ALIGN_TO_HWP[para.align ?? defaultAlign()],
        para.indent ?? defaultIndent(),
        para.lineSpacing ?? defaultLineSpacing(),
      );
    };
    this.docModel.forEach((item) => {
      if (item.type === 'paragraph') {
        addPara(item);
      } else {
        item.rows.forEach((row) => {
          row.cells.forEach((cell) => {
            (cell.children || []).forEach(addRun);
            if (cell.align) {
              const hwpAlign = ALIGN_TO_HWP[cell.align] ?? ALIGN_TO_HWP[defaultAlign()];
              this.ensureParaShape(hwpAlign, 0, defaultLineSpacing());
            }
          });
        });
        this.ensureDefaultShape();
      }
    });
    
    this.koFaces = Array.from(faceSet);
    if (this.koFaces.length === 0) {
      this.koFaces.push(defaultFontFamily());
    }

    if (this.shapes.length === 0) {
      const def = shapeOfRun({ text: '' });
      this.shapeIndexByKey.set(def.key, 0);
      this.shapes.push(def);
    }
  }

  private buildFileHeader(): Uint8Array {
    const out = new ByteBuilder();
    const sig = 'HWP Document File';
    for (let i = 0; i < 17; i++) out.u8(i < sig.length ? sig.charCodeAt(i) : 0);
    for (let i = 0; i < 15; i++) out.u8(0);
    out.u8(HWP_VERSION[0]);
    out.u8(HWP_VERSION[1]);
    out.u8(HWP_VERSION[2]);
    out.u8(HWP_VERSION[3]);
    out.u32le(1);
    out.u32le(0);
    out.i32le(4);
    out.u8(0);
    for (let i = 0; i < 207; i++) out.u8(0);
    return out.build();
  }

  private buildDocInfo(): Uint8Array {
    const parts: Uint8Array[] = [];
    const prop = new ByteBuilder();
    prop.u16le(1);
    for (let i = 0; i < 6; i++) prop.u16le(1);
    prop.u32le(0);
    prop.u32le(0);
    prop.u32le(0);
    parts.push(packRecord(TAG_DOCUMENT_PROPERTIES, 0, prop.build()));

    const fontCount = this.koFaces.length;
    const counts = [
      0,
      fontCount,
      fontCount,
      fontCount,
      fontCount,
      fontCount,
      fontCount,
      fontCount,
      1,
      this.shapes.length,
      1,
      0,
      0,
      this.paraShapes.length,
      1,
    ];
    const mapping = new ByteBuilder();
    counts.forEach((c) => mapping.i32le(c));
    mapping.i32le(0);
    parts.push(packRecord(TAG_ID_MAPPINGS, 0, mapping.build()));

    ['ko', 'en', 'hz', 'jp', 'etc', 'sym', 'user'].forEach(() => {
      this.koFaces.forEach((name) => parts.push(packRecord(TAG_FACE_NAME, 1, this.buildFace(name))));
    });

    parts.push(packRecord(TAG_BORDER_FILL, 1, this.buildBorderFill()));
    this.shapes.forEach((def) => {
      parts.push(packRecord(TAG_CHAR_SHAPE, 1, this.buildCharShape(def)));
    });
    parts.push(packRecord(TAG_TAB_DEF, 1, new Uint8Array(8)));
    this.paraShapes.forEach((def) => {
      parts.push(packRecord(TAG_PARA_SHAPE, 1, this.buildParaShape(def)));
    });
    parts.push(packRecord(TAG_STYLE, 1, this.buildStyle()));
    return concat(parts);
  }

  private buildFace(name: string): Uint8Array {
    const out = new ByteBuilder();
    out.u8(0);
    out.wstring(name);
    return out.build();
  }

  private buildBorderFill(): Uint8Array {
    const out = new ByteBuilder();
    out.u16le(0);
    for (let i = 0; i < 5; i++) {
      out.u8(0);
      out.u8(0);
      out.u32le(0);
    }
    out.u32le(0);
    out.u32le(0);
    return out.build();
  }

  private buildCharShape(def: ShapeDef): Uint8Array {
    const out = new ByteBuilder();
    const koIdx = this.koFaces.indexOf(def.fontFamily);
    const fontId = koIdx >= 0 ? koIdx : 0;
    for (let i = 0; i < 7; i++) out.u16le(i <= 1 ? fontId : 0);
    for (let i = 0; i < 7; i++) out.u8(100);
    for (let i = 0; i < 7; i++) out.u8(0);
    for (let i = 0; i < 7; i++) out.u8(100);
    for (let i = 0; i < 7; i++) out.u8(0);
    out.i32le(Math.round(def.fontSizePx * 75));
    let attr = 0;
    if (def.italic) attr |= 1;
    if (def.bold) attr |= 2;
    if (def.underline) attr |= 1 << 2;
    if (def.strike) attr |= 1 << 18;
    out.u32le(attr);
    out.u8(0);
    out.u8(0);
    out.u32le(def.color);
    out.u32le(0);
    out.u32le(def.shadeColor);
    out.u32le(0);
    out.u16le(0);
    out.u32le(0);
    return out.build();
  }

  private buildParaShape(def: { align: number; indentPx: number; lineSpacing: number }): Uint8Array {
    const out = new ByteBuilder();
    out.u32le(0x180 | ((def.align & 0x7) << 2));
    out.i32le(0);
    out.i32le(0);
    out.i32le(Math.round(def.indentPx * 75));
    out.i32le(0);
    out.i32le(0);
    out.i32le(160);
    out.u16le(0);
    out.u16le(0);
    out.u16le(0);
    out.i16le(0);
    out.i16le(0);
    out.i16le(0);
    out.i16le(0);
    out.u32le(0);
    out.u32le(0);
    out.u32le(Math.round(def.lineSpacing));
    return out.build();
  }

  private buildStyle(): Uint8Array {
    const out = new ByteBuilder();
    out.wstring('');
    out.wstring('');
    out.u8(0);
    out.u8(0);
    out.u16le(0x0412);
    out.u16le(0);
    out.u16le(0);
    out.u16le(0);
    return out.build();
  }

  private cleanText(text: string): string {
    return text.replace(/\t/g, ' ').replace(/[\r\n]+/g, ' ');
  }

  private paraText(para: ParagraphNode): string {
    return (para.children || []).map((r) => this.cleanText(r.text || '')).join('');
  }

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

  private controlChar(out: ByteBuilder, bufHex: string | null = null, code = 2): void {
    out.u16le(code);
    if (bufHex) out.raw(hexBytes(bufHex));
    else for (let i = 0; i < 12; i++) out.u8(0);
    out.u16le(code);
  }

  private tableCtrlBuf(): Uint8Array {
    // 12B extended-control payload for table: ctrl id " tbl" (LE) + zeros
    const b = new ByteBuilder();
    b.u32le(CTRL_ID_TABLE);
    for (let i = 0; i < 8; i++) b.u8(0);
    return b.build();
  }

  private leadingBuf(name: string): string | null {
    if (name === 'secd') return '646365730000000000000000';
    if (name === 'cold') return '646c6f630000000000000000';
    return null;
  }

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
      if (text.length > 0) textBuf.u16le(13);
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
    out.u32le(0);
    out.i32le(0);
    out.i32le(maxBase);
    out.i32le(maxBase);
    out.i32le(Math.round((maxBase * 85) / 100));
    out.i32le(useDefault ? 1600 : 600);
    out.i32le(0);
    out.i32le(CONTENT_WIDTH);
    out.u32le(0x60000);
    return out.build();
  }

  private shapeKey(align: number, indentPx: number, spacing: number): string {
    return `${align}|${indentPx}|${spacing}`;
  }

  private ensureParaShape(align: number, indentPx: number, spacing: number): number {
    const key = this.shapeKey(align, indentPx, spacing);
    let idx = this.paraShapeIndexByAlign.get(key);
    if (idx === undefined) {
      idx = this.paraShapes.length;
      this.paraShapeIndexByAlign.set(key, idx);
      this.paraShapes.push({ align, indentPx, lineSpacing: spacing });
    }
    return idx;
  }

  private defaultShapeKey(): string {
    return this.shapeKey(ALIGN_TO_HWP[defaultAlign()], defaultIndent(), defaultLineSpacing());
  }

  private ensureDefaultShape(): void {
    this.ensureParaShape(ALIGN_TO_HWP[defaultAlign()], defaultIndent(), defaultLineSpacing());
  }

  private paraShapeOf(para: ParagraphNode): number {
    const key = this.shapeKey(
      ALIGN_TO_HWP[para.align ?? defaultAlign()],
      para.indent ?? defaultIndent(),
      para.lineSpacing ?? defaultLineSpacing(),
    );
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
    out.u32le(mask);
    out.u16le(paraShapeId);
    out.u8(0);
    out.u8(breakOpts);
    out.u16le(shapeCount);
    out.u16le(0);
    out.u16le(aligns);
    out.u32le(0);
    out.u16le(0);
    return out.build();
  }

  private buildHostParagraphForTable(table: TableNode, leading: string[] = [], isLast = false): Uint8Array[] {
    const parts: Uint8Array[] = [];
    let hostChars = leading.length * 8 + 9;
    if (isLast) hostChars |= 0x80000000;
    const header = new ByteBuilder();
    header.u32le(hostChars);
    header.u32le(leading.includes('secd') ? 0x804 : 0); // orig-compatible ctrlMask
    header.u16le(this.paraShapeIndexByAlign.get(this.defaultShapeKey()) ?? 0);
    header.u8(0); // styleId
    header.u8(leading.length > 0 ? 3 : 0); // breakOptions
    header.u16le(1); // charShapeCount (host has PARA_CHAR_SHAPE)
    header.u16le(0); // rangeCount
    header.u16le(1); // alignCount (host has PARA_LINE_SEG)
    header.u32le(0); // instanceId
    header.u16le(0); // tracking
    parts.push(packRecord(TAG_PARA_HEADER, 0, header.build()));

    const text = new ByteBuilder();
    leading.forEach((name) => this.controlChar(text, this.leadingBuf(name)));
    // table extended control (code 11) with ctrl-id payload
    text.u16le(11);
    text.raw(this.tableCtrlBuf());
    text.u16le(11);
    text.u16le(13);
    parts.push(packRecord(TAG_PARA_TEXT, 1, text.build()));

    // host char shape + line seg (required by format; match orig shape)
    const cs = new ByteBuilder();
    cs.u32le(0);
    cs.u32le(this.shapeIndexByKey.size > 0 ? 0 : 0);
    parts.push(packRecord(TAG_PARA_CHAR_SHAPE, 1, cs.build()));
    parts.push(packRecord(TAG_PARA_LINE_SEG, 1, this.buildHostLineSeg()));

    if (leading.length > 0) parts.push(...this.buildSectionCtrls(0));
    parts.push(packRecord(TAG_CTRL_HEADER, 1, this.buildTableCtrlHeader(table)));
    parts.push(packRecord(TAG_TABLE, 2, this.buildTableRecord(table)));

    const rowCount = table.rows.length;
    const colCount = this.tableCols(table);
    const colW = Math.floor(CONTENT_WIDTH / colCount);
    const rowH = 282; // ~1cm, orig-like
    for (let r = 0; r < rowCount; r++) {
      const row = table.rows[r];
      for (let c = 0; c < colCount; c++) {
        const cellData = row && row.cells ? row.cells[c] : undefined;
        parts.push(...this.buildCell(cellData, r, c, colW, rowH));
      }
    }
    return parts;
  }

  private buildHostLineSeg(): Uint8Array {
    // 36B, orig-compatible for host paragraph
    const out = new ByteBuilder();
    out.u32le(0); // start
    out.i32le(0); // vert
    out.i32le(1000); // lineHeight
    out.i32le(1000); // textHeight
    out.i32le(850); // baseLineGap
    out.i32le(600); // lineSpacing
    out.i32le(0); // startInCol
    out.i32le(0); // width (orig host had 0)
    out.u32le(0x00060000); // tag
    return out.build();
  }

  private tableCols(table: TableNode): number {
    let cols = 0;
    table.rows.forEach((row) => {
      if (row.cells.length > cols) cols = row.cells.length;
    });
    return Math.max(1, cols);
  }

  private buildTableCtrlHeader(table: TableNode): Uint8Array {
    // 46B orig-compatible table control header (HWPTAG_CTRL_HEADER for 'tbl ')
    const cols = this.tableCols(table);
    const rows = Math.max(1, table.rows.length);
    const colW = Math.floor(CONTENT_WIDTH / cols);
    const rowH = 282;
    const out = new ByteBuilder();
    out.u32le(CTRL_ID_TABLE);
    out.u32le(0x082a2210); // property (orig-like)
    out.i32le(0); // vert offset
    out.i32le(0); // horz offset
    out.u32le(colW * cols); // width
    out.u32le(rowH * rows); // height
    out.i32le(0); // zOrder
    out.i16le(283); out.i16le(283); out.i16le(283); out.i16le(283); // margins l/r/t/b
    out.u32le(0); // instance id
    out.i32le(0); // prevent page break / overflow
    out.u16le(0); // extra (46B total)
    return out.build();
  }

  private buildTableRecord(table: TableNode): Uint8Array {
    // 26B+ for 2 rows (orig-compatible layout)
    const cols = this.tableCols(table);
    const rows = Math.max(1, table.rows.length);
    const out = new ByteBuilder();
    out.u32le(0x04000006); // property (orig-like)
    out.u16le(rows);
    out.u16le(cols);
    out.i16le(0); // cell spacing
    out.i16le(510); out.i16le(510); out.i16le(141); out.i16le(141); // in/out margins (orig-like)
    for (let r = 0; r < rows; r++) out.u16le(cols); // row cell counts
    out.u16le(0); // border fill
    out.u16le(0); // valid zones
    return out.build();
  }

  private buildCell(
    cell: { children?: TextRun[]; align?: TextAlign; rowSpan?: number; colSpan?: number } | undefined,
    row: number,
    col: number,
    colWidth: number,
    rowHeight: number,
  ): Uint8Array[] {
    const parts: Uint8Array[] = [];
    const children = (cell && cell.children) || [];
    const hasText = children.some((r) => (r.text || '').length > 0);

    // 47B LIST_HEADER (orig-compatible). paraCount=1.
    const list = new ByteBuilder();
    list.u32le(1); // paraCount
    list.u32le(0x20); // attribute (text direction/wrap, orig-like)
    list.u32le(0); // vert align / reserved
    list.u16le(col); // col index
    list.u16le(row); // row index
    list.u16le(Math.max(1, cell?.colSpan ?? 1));
    list.u16le(Math.max(1, cell?.rowSpan ?? 1));
    list.u32le(colWidth * Math.max(1, cell?.colSpan ?? 1)); // width
    list.u32le(rowHeight * Math.max(1, cell?.rowSpan ?? 1)); // height
    // margins l,r,t,b (u16) - orig-like
    list.u16le(510); list.u16le(510); list.u16le(141); list.u16le(141);
    list.u16le(0); // borderFill
    list.u32le(colWidth * Math.max(1, cell?.colSpan ?? 1)); // textWidth
    // field name / tail (5B) to reach 47B total
    list.u16le(0); list.u16le(0); list.u8(0);
    parts.push(packRecord(TAG_LIST_HEADER, 2, list.build()));

    // cell paragraph (level 2, children 3) - use buildParagraph for consistent structure
    const para: ParagraphNode = {
      type: 'paragraph',
      children: hasText ? (children as TextRun[]) : [{ text: '' }],
      ...(cell?.align ? { align: cell.align } : {}),
    };
    parts.push(...this.buildParagraph(para, 2));
    return parts;
  }
}