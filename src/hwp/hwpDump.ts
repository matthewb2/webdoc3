// src/hwp/hwpDump.ts - HWP 바이너리 덤프 유틸리티
// OLE(CFB) → (필요시) 디플레이트 → 레코드 워크 → 텍스트 추출.
// 파서(@hwp.js/parser)가 실파일에서 실패해도 동작하는 관대한 리더.
import { inflateRaw } from 'pako';
import { readCfb } from './cfbReader';

export interface DumpRecord {
  tag: number;
  tagName: string;
  level: number;
  size: number;
}

export interface DumpParagraph {
  index: string;
  chars: number;
  shapeId: number;
  styleId: number;
  aligns: number;
  text: string;
  inlineControls: number[];
  extendedControls: number[];
  ctrls: string[];
  empty: boolean;
}

export interface DumpCell {
  row: number;
  col: number;
  paragraphs: DumpParagraph[];
}

export interface DumpTable {
  rows: number;
  cols: number;
  cells: DumpCell[];
}

export interface DumpSection {
  index: number;
  paragraphs: DumpParagraph[];
  tables: DumpTable[];
  records: DumpRecord[];
}

export interface HwpDump {
  fileName: string;
  totalBytes: number;
  signature: string;
  version: string;
  compressed: boolean;
  encryptVersion: number;
  kogl: number;
  streams: Array<{ name: string; rawSize: number; inflatedSize: number; inflated: boolean }>;
  docRecords: DumpRecord[];
  idMap: Record<string, number>;
  fonts: string[];
  paraShapeAligns: number[];
  charShapeCount: number;
  styleCount: number;
  sections: DumpSection[];
  warnings: string[];
}

const DOC_TAG_NAMES: Record<number, string> = {
  16: 'DOCUMENT_PROPERTIES',
  17: 'ID_MAPPINGS',
  18: 'BIN_DATA',
  19: 'FACE_NAME',
  20: 'BORDER_FILL',
  21: 'CHAR_SHAPE',
  22: 'TAB_DEF',
  23: 'NUMBERING',
  24: 'BULLET',
  25: 'PARA_SHAPE',
  26: 'STYLE',
};
const SEC_TAG_NAMES: Record<number, string> = {
  66: 'PARA_HEADER',
  67: 'PARA_TEXT',
  68: 'PARA_CHAR_SHAPE',
  69: 'PARA_LINE_SEG',
  70: 'PARA_RANGE_TAG',
  71: 'CTRL_HEADER',
  72: 'LIST_HEADER',
  77: 'TABLE',
};

const CHAR_CONTROLS = new Set([0, 10, 13, 24, 25, 26, 27, 28, 29, 30, 31]);
const EXTENDED_CODES = new Set([1, 2, 3, 11, 12, 14, 15, 16, 17, 18, 21, 22, 23]);

function fourCC(v: number): string {
  return String.fromCharCode((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
}

function readWString(view: DataView, base: number, off: number): { text: string; next: number } {
  const len = view.getUint16(base + off, true);
  let text = '';
  for (let i = 0; i < len; i++) text += String.fromCharCode(view.getUint16(base + off + 2 + i * 2, true));
  return { text, next: off + 2 + len * 2 };
}

interface RawRecord {
  id: number;
  level: number;
  size: number;
  data: Uint8Array;
}

function splitRecords(data: Uint8Array): RawRecord[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const recs: RawRecord[] = [];
  let off = 0;
  while (off + 4 <= data.length) {
    const v = view.getUint32(off, true);
    const id = v & 1023;
    const level = (v >> 10) & 1023;
    let size = (v >> 20) & 4095;
    let hlen = 4;
    if (size === 4095) {
      if (off + 8 > data.length) throw new Error(`record at ${off}: extended size truncated`);
      size = view.getUint32(off + 4, true);
      hlen = 8;
    }
    if (off + hlen + size > data.length) {
      throw new Error(`record id=${id} at ${off}: declared size ${size} exceeds stream (${data.length - off - hlen}B left)`);
    }
    recs.push({ id, level, size, data: data.subarray(off + hlen, off + hlen + size) });
    off += hlen + size;
  }
  if (off !== data.length) throw new Error(`stream has ${data.length - off} trailing bytes after records`);
  return recs;
}

function inflateIfNeeded(data: Uint8Array, compressed: boolean, expectTag: number, warnings: string[], label: string): Uint8Array {
  if (data.length >= 4) {
    const first = new DataView(data.buffer, data.byteOffset, 4).getUint32(0, true) & 1023;
    if (first === expectTag) return data;
  }
  if (!compressed) {
    warnings.push(`${label}: first tag mismatch and flags.compressed=false (raw walk attempted)`);
    return data;
  }
  try {
    return inflateRaw(data);
  } catch (e) {
    throw new Error(`${label} inflate failed: ${(e as Error).message}`);
  }
}

export function dumpHwp(fileName: string, bytes: Uint8Array): HwpDump {
  const warnings: string[] = [];
  const { streams } = readCfb(bytes);

  const fh = streams.get('FileHeader');
  if (!fh || fh.length !== 256) throw new Error(`FileHeader missing or size!=256 (got ${fh?.length ?? 'none'})`);
  const sig = String.fromCharCode(...fh.subarray(0, 17));
  if (sig !== 'HWP Document File\0'.slice(0, 17)) throw new Error(`bad signature: ${JSON.stringify(sig)}`);
  const version = [fh[35], fh[34], fh[33], fh[32]]; // major, minor, build, rev
  const flags = new DataView(fh.buffer, fh.byteOffset + 36, 4).getUint32(0, true);
  const compressed = (flags & 1) !== 0;
  const encryptVersion = new DataView(fh.buffer, fh.byteOffset + 44, 4).getInt32(0, true);
  const kogl = fh[48];

  const streamInfos: HwpDump['streams'] = [];
  const getStream = (name: string, expectTag: number): Uint8Array => {
    const raw = streams.get(name);
    if (!raw) throw new Error(`stream missing: ${name}`);
    const out = inflateIfNeeded(raw, compressed, expectTag, warnings, name);
    streamInfos.push({ name, rawSize: raw.length, inflatedSize: out.length, inflated: out !== raw });
    return out;
  };

  // ---- DocInfo ----
  const di = getStream('DocInfo', 16);
  const diRecs = splitRecords(di);
  const docRecords: DumpRecord[] = diRecs.map((r) => ({
    tag: r.id,
    tagName: DOC_TAG_NAMES[r.id] ?? `UNKNOWN(${r.id})`,
    level: r.level,
    size: r.size,
  }));
  if (diRecs[0]?.id !== 16) warnings.push('DocInfo first record is not DOCUMENT_PROPERTIES');
  const idMap: Record<string, number> = {};
  const fonts: string[] = [];
  const paraShapeAligns: number[] = [];
  let charShapeCount = 0;
  let styleCount = 0;
  if (diRecs[1]?.id === 17) {
    const mv = new DataView(diRecs[1].data.buffer, diRecs[1].data.byteOffset, diRecs[1].data.byteLength);
    const keys = ['bin', 'ko', 'en', 'hz', 'jp', 'etc', 'sym', 'user', 'border', 'char', 'tab', 'num', 'bul', 'para', 'style'];
    keys.forEach((k, i) => {
      idMap[k] = mv.getInt32(i * 4, true);
    });
    if (diRecs[1].size >= 64) idMap['memo'] = mv.getInt32(60, true);
    if (diRecs[1].size >= 72) {
      idMap['trackings'] = mv.getInt32(64, true);
      idMap['trackingAuthors'] = mv.getInt32(68, true);
    }
  } else {
    warnings.push('DocInfo second record is not ID_MAPPINGS');
  }
  diRecs.forEach((r) => {
    if (r.id === 19) {
      try {
        const v = new DataView(r.data.buffer, r.data.byteOffset, r.data.byteLength);
        const props = v.getUint8(0);
        let off = 1;
        const n = readWString(v, 0, off);
        fonts.push(n.text);
        off = n.next;
        if (props & 0x80) {
          off += 1;
          const a = readWString(v, 0, off);
          off = a.next;
        }
        if (props & 0x40) off += 10;
        if (props & 0x20) {
          const d = readWString(v, 0, off);
          off = d.next;
        }
      } catch {
        warnings.push('FACE_NAME parse failed (size ' + r.size + ')');
      }
    } else if (r.id === 21) {
      charShapeCount++;
    } else if (r.id === 25) {
      const v = new DataView(r.data.buffer, r.data.byteOffset, r.data.byteLength);
      paraShapeAligns.push((v.getUint32(0, true) >> 2) & 0x7);
    } else if (r.id === 26) {
      styleCount++;
    }
  });

  // ---- Sections ----
  const sections: DumpSection[] = [];
  const secNames = [...streams.keys()].filter((k) => /section\d+/i.test(k)).sort();
  if (secNames.length === 0) warnings.push('no Section streams found');
  secNames.forEach((name, si) => {
    const sec = getStream(name, 66);
    const recs = splitRecords(sec);
    const records: DumpRecord[] = recs.map((r) => ({
      tag: r.id,
      tagName: SEC_TAG_NAMES[r.id] ?? `UNKNOWN(${r.id})`,
      level: r.level,
      size: r.size,
    }));
    const paragraphs: DumpParagraph[] = [];
    const tables: DumpTable[] = [];
    let pos = 0;
    let pIdx = 0;

    const parseParagraph = (label: string): DumpParagraph => {
      const h = recs[pos++];
      if (!h || h.id !== 66) throw new Error(`${label}: expected PARA_HEADER, got ${h ? h.id : 'EOF'}`);
      const hv = new DataView(h.data.buffer, h.data.byteOffset, h.data.byteLength);
      let chars = hv.getUint32(0, true);
      if (chars & 0x80000000) chars &= 0x7fffffff;
      const shapeId = hv.getUint16(8, true);
      const styleId = hv.getUint8(10);
      const charShapeCount = hv.getUint16(12, true);
      const rangeCount = hv.getUint16(14, true);
      const alignCount = hv.getUint16(16, true);
      const para: DumpParagraph = {
        index: label,
        chars,
        shapeId,
        styleId,
        aligns: alignCount,
        text: '',
        inlineControls: [],
        extendedControls: [],
        ctrls: [],
        empty: chars === 0,
      };
      // PARA_TEXT (없을 수 있음)
      if (pos < recs.length && recs[pos].id === 67) {
        const t = recs[pos++];
        const tv = new DataView(t.data.buffer, t.data.byteOffset, t.data.byteLength);
        let u = 0; // U16 유닛 오프셋
        let logical = 0;
        const parts: string[] = [];
        while (logical < chars && u * 2 + 2 <= t.size) {
          const code = tv.getUint16(u * 2, true);
          u++;
          logical++;
          if (code > 31) {
            parts.push(String.fromCharCode(code));
          } else if (CHAR_CONTROLS.has(code)) {
            if (code === 10) parts.push('\n');
          } else if (EXTENDED_CODES.has(code)) {
            para.extendedControls.push(code);
            u += 6; // 12B 버퍼
            if (u * 2 + 2 > t.size) {
              warnings.push(`${label}: extended control echo truncated`);
              break;
            }
            const echo = tv.getUint16(u * 2, true);
            u++;
            if (echo !== code) warnings.push(`${label}: extended control echo mismatch (${code}!=${echo})`);
            logical += 7; // 파서와 동일한 logical 카운트
          } else {
            para.inlineControls.push(code);
            u += 6;
            if (u * 2 + 2 > t.size) {
              warnings.push(`${label}: inline control echo truncated`);
              break;
            }
            u++;
            logical += 7;
          }
        }
        para.text = parts.join('');
      }
      if (charShapeCount > 0) {
        if (pos < recs.length && recs[pos].id === 68) pos++;
        else warnings.push(`${label}: missing PARA_CHAR_SHAPE (count=${charShapeCount})`);
      }
      if (alignCount > 0) {
        if (pos < recs.length && recs[pos].id === 69) pos++;
        else warnings.push(`${label}: missing PARA_LINE_SEG (count=${alignCount})`);
      }
      for (let i = 0; i < rangeCount; i++) {
        if (pos < recs.length && recs[pos].id === 70) {
          if (i === 0) pos++;
        } else {
          warnings.push(`${label}: missing PARA_RANGE_TAG`);
          break;
        }
      }
      // 컨트롤 (확장 컨트롤 수만큼)
      para.extendedControls.forEach(() => {
        if (pos < recs.length && recs[pos].id === 71) {
          const c = recs[pos++];
          const cv = new DataView(c.data.buffer, c.data.byteOffset, Math.min(4, c.size));
          const id = c.size >= 4 ? fourCC(cv.getUint32(0, true)) : '?';
          // 테이블이 아닌 컨트롤의 하위 레코드(level이 더 깊은)를 함께 소비
          const kids: number[] = [];
          while (id !== 'tbl ' && pos < recs.length && recs[pos].level > c.level) {
            kids.push(recs[pos].id);
            pos++;
          }
          para.ctrls.push(kids.length > 0 ? `${id}[${kids.join(',')}]` : id);
          if (id === 'tbl ') {
            if (pos < recs.length && recs[pos].id === 77) {
              const tb = recs[pos++];
              const bv = new DataView(tb.data.buffer, tb.data.byteOffset, tb.data.byteLength);
              const rows = bv.getUint16(4, true);
              const cols = bv.getUint16(6, true);
              const table: DumpTable = { rows, cols, cells: [] };
              const rowCounts: number[] = [];
              for (let i = 0; i < rows; i++) rowCounts.push(bv.getUint16(18 + i * 2, true));
              const total = rowCounts.reduce((a, b) => a + b, 0);
              let r = 0;
              let cc = 0;
              for (let ci = 0; ci < total; ci++) {
                while (r < rows && cc >= (rowCounts[r] ?? 0)) {
                  r++;
                  cc = 0;
                }
                if (pos >= recs.length || recs[pos].id !== 72) {
                  warnings.push(`${label}: missing LIST_HEADER for cell ${ci}`);
                  break;
                }
                const lh = recs[pos++];
                const lv = new DataView(lh.data.buffer, lh.data.byteOffset, lh.data.byteLength);
                const n = lv.getUint32(0, true);
                const cell: DumpCell = { row: r, col: cc, paragraphs: [] };
                for (let k = 0; k < n; k++) cell.paragraphs.push(parseParagraph(`${label}/cell(${r},${cc})#${k}`));
                table.cells.push(cell);
                cc++;
              }
              tables.push(table);
            } else {
              warnings.push(`${label}: missing TABLE record after tbl CTRL`);
            }
          }
        } else {
          warnings.push(`${label}: missing CTRL_HEADER for extended control`);
        }
      });
      return para;
    };

    try {
      while (pos < recs.length) {
        paragraphs.push(parseParagraph(`p${pIdx++}`));
      }
    } catch (e) {
      warnings.push(`section ${si}: ${(e as Error).message}`);
    }
    sections.push({ index: si, paragraphs, tables, records });
  });

  return {
    fileName,
    totalBytes: bytes.length,
    signature: sig,
    version: `${version[0]}.${version[1]}.${version[2]}.${version[3]}`,
    compressed,
    encryptVersion,
    kogl,
    streams: streamInfos,
    docRecords,
    idMap,
    fonts,
    paraShapeAligns,
    charShapeCount,
    styleCount,
    sections,
    warnings,
  };
}
