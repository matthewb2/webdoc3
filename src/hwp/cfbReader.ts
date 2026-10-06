// src/hwp/cfbReader.ts - 최소 CFB(Compound File Binary) 리더 (브라우저 안전)
// HWP의 OLE 컨테이너를 읽어 스트림별 바이트를 꺼낸다. 외부 의존 없음.
export interface CfbEntry {
  name: string;
  type: number; // 5: 루트, 1: 스토리지, 2: 스트림
  start: number;
  size: number;
}

export interface CfbContainer {
  entries: CfbEntry[];
  streams: Map<string, Uint8Array>;
  sectorSize: number;
}

const FREESECT = 0xffffffff;
const ENDOFCHAIN = 0xfffffffe;

export function readCfb(data: Uint8Array): CfbContainer {
  if (data.length < 512) throw new Error(`CFB too small: ${data.length}B`);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const sig = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  for (let i = 0; i < 8; i++) {
    if (data[i] !== sig[i]) throw new Error('Not a CFB file (bad signature)');
  }
  const sectorSize = 1 << view.getUint16(30, true);
  const miniSectorSize = 1 << view.getUint16(32, true);
  const numFat = view.getUint32(44, true);
  const firstDir = view.getUint32(48, true);
  const miniCutoff = view.getUint32(56, true);
  const firstMiniFat = view.getUint32(60, true);
  const difat: number[] = [];
  for (let i = 0; i < 109; i++) {
    const v = view.getUint32(76 + i * 4, true);
    if (v === FREESECT) break;
    difat.push(v);
  }
  if (difat.length === 0) throw new Error('CFB has no FAT sectors');

  const sector = (n: number): Uint8Array => {
    const off = 512 + n * sectorSize;
    if (off + sectorSize > data.length) throw new Error(`CFB sector ${n} out of range`);
    return data.subarray(off, off + sectorSize);
  };
  const fat: number[] = [];
  difat.slice(0, Math.max(1, numFat)).forEach((s) => {
    const d = sector(s);
    const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
    for (let i = 0; i < sectorSize / 4; i++) fat.push(dv.getUint32(i * 4, true));
  });

  const chain = (start: number): Uint8Array[] => {
    const out: Uint8Array[] = [];
    let s = start;
    let guard = 0;
    while (s !== ENDOFCHAIN && s !== FREESECT) {
      if (guard++ > 100000) throw new Error('CFB FAT chain too long (loop?)');
      out.push(sector(s));
      const next = fat[s];
      if (next === undefined) throw new Error(`CFB FAT entry ${s} missing`);
      s = next;
    }
    return out;
  };
  const concat = (parts: Uint8Array[]): Uint8Array => {
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
  };

  const dirRaw = concat(chain(firstDir));
  const entries: CfbEntry[] = [];
  for (let off = 0; off + 128 <= dirRaw.length; off += 128) {
    const type = dirRaw[off + 66];
    if (type === 0) continue;
    const dv = new DataView(dirRaw.buffer, dirRaw.byteOffset + off, 128);
    let name = '';
    for (let i = 0; i < 32; i++) {
      const c = dv.getUint16(i * 2, true);
      if (c === 0) break;
      name += String.fromCharCode(c);
    }
    entries.push({
      name,
      type,
      start: dv.getUint32(116, true),
      size: dv.getUint32(120, true),
    });
  }
  if (entries.length === 0) throw new Error('CFB has no directory entries');

  // 미니스트림 (루트 엔트리의 데이터)
  const root = entries[0];
  const ministream = concat(chain(root.start)).subarray(0, root.size);
  const miniFat: number[] = [];
  {
    let s = firstMiniFat;
    let guard = 0;
    const chunks: Uint8Array[] = [];
    while (s !== ENDOFCHAIN && s !== FREESECT) {
      if (guard++ > 10000) throw new Error('CFB MiniFAT chain too long');
      chunks.push(sector(s));
      s = fat[s];
    }
    const raw = concat(chunks);
    const rv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    for (let i = 0; i + 4 <= raw.length; i += 4) miniFat.push(rv.getUint32(i, true));
  }
  const miniChain = (start: number, size: number): Uint8Array => {
    const parts: Uint8Array[] = [];
    let s = start;
    let guard = 0;
    while (s !== ENDOFCHAIN && s !== FREESECT) {
      if (guard++ > 100000) throw new Error('CFB mini chain too long');
      parts.push(ministream.subarray(s * miniSectorSize, (s + 1) * miniSectorSize));
      const next = miniFat[s];
      if (next === undefined) throw new Error(`CFB MiniFAT entry ${s} missing`);
      s = next;
    }
    return concat(parts).subarray(0, size);
  };

  const streams = new Map<string, Uint8Array>();
  entries.forEach((e) => {
    if (e.type !== 2) return;
    streams.set(e.name, e.size >= miniCutoff ? concat(chain(e.start)).subarray(0, e.size) : miniChain(e.start, e.size));
  });
  return { entries, streams, sectorSize };
}
