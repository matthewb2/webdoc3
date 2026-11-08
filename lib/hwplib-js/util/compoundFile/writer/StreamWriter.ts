import type { FileVersion } from "../../../object/fileheader/FileVersion.js";
import * as BitFlag from "../../binary/BitFlag.js";
import { Compressor } from "../../binary/Compressor.js";

/** Minimal view of HWPString needed by the writer; the real object satisfies this shape. */
export interface HWPStringLike {
  getBytes(): Uint8Array | null;
}

/** Same para-shape-id correction source as the reader, with the writer's inverse formula. */
export interface ParaShapeIdCorrectionSource {
  getIDMappings(): { getParaShapeCount(): number };
  getParaShapeList(): { length: number };
}

const utf16leEncode = (s: string): Uint8Array => {
  const out = new Uint8Array(s.length * 2);
  const view = new DataView(out.buffer);
  for (let i = 0; i < s.length; i++) view.setUint16(i * 2, s.charCodeAt(i), true);
  return out;
};

/**
 * Sequential writer for a single HWP stream. Ported from hwplib's
 * `util.compoundFile.writer.StreamWriter`. Accumulates uncompressed bytes; {@link getData}
 * returns the final stream bytes, DEFLATE-compressed iff `compress` was set.
 */
export class StreamWriter {
  private readonly name: string;
  readonly compress: boolean;
  private readonly version: FileVersion | null;

  private chunks: Uint8Array[] = [];
  private currentRecordLevel = 0;
  private docInfo: ParaShapeIdCorrectionSource | null = null;

  private readonly scratch = new DataView(new ArrayBuffer(8));

  constructor(name: string, compress: boolean, version: FileVersion | null) {
    this.name = name;
    this.compress = compress;
    this.version = version;
  }

  getName(): string {
    return this.name;
  }

  getFileVersion(): FileVersion | null {
    return this.version;
  }

  /** The finished stream bytes (compressed iff this writer is a compress stream). */
  getData(): Uint8Array {
    const raw = this.concat();
    return this.compress ? Compressor.compress(raw) : raw;
  }

  private concat(): Uint8Array {
    let total = 0;
    for (const c of this.chunks) total += c.length;
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of this.chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  }

  writeBytes(value: Uint8Array, count?: number): void {
    this.chunks.push(count === undefined ? value : value.subarray(0, count));
  }

  private push1(): void {
    this.chunks.push(new Uint8Array(this.scratch.buffer.slice(0, 1)));
  }
  private push2(): void {
    this.chunks.push(new Uint8Array(this.scratch.buffer.slice(0, 2)));
  }
  private push4(): void {
    this.chunks.push(new Uint8Array(this.scratch.buffer.slice(0, 4)));
  }

  writeSInt1(value: number): void {
    this.scratch.setInt8(0, value);
    this.push1();
  }
  writeUInt1(value: number): void {
    this.scratch.setUint8(0, value);
    this.push1();
  }
  writeSInt2(value: number): void {
    this.scratch.setInt16(0, value, true);
    this.push2();
  }
  writeUInt2(value: number): void {
    this.scratch.setUint16(0, value, true);
    this.push2();
  }
  writeSInt4(value: number): void {
    this.scratch.setInt32(0, value, true);
    this.push4();
  }
  writeUInt4(value: number): void {
    this.scratch.setUint32(0, value, true);
    this.push4();
  }
  writeDouble(value: number): void {
    this.scratch.setFloat64(0, value, true);
    this.chunks.push(new Uint8Array(this.scratch.buffer.slice(0, 8)));
  }
  writeFloat(value: number): void {
    this.scratch.setFloat32(0, value, true);
    this.push4();
  }

  writeRecordHeader(tagID: number, size: number): void {
    let header = 0;
    header = BitFlag.setRange(header, 0, 9, tagID);
    header = BitFlag.setRange(header, 10, 19, this.currentRecordLevel);
    header = BitFlag.setRange(header, 20, 31, Math.min(size, 4095));
    this.writeUInt4(header);
    if (size >= 4095) {
      this.writeUInt4(size);
    }
  }

  writeUTF16LEString(value: string | null): void {
    if (value === null) {
      this.writeUInt2(0);
    } else {
      this.writeUInt2(value.length);
      if (value.length > 0) this.writeBytes(utf16leEncode(value));
    }
  }

  writeHWPString(value: HWPStringLike | null): void {
    const bytes = value?.getBytes() ?? null;
    if (bytes === null) {
      this.writeUInt2(0);
    } else {
      this.writeUInt2(bytes.length / 2);
      if (bytes.length > 0) this.writeBytes(bytes);
    }
  }

  writeWChar(value: Uint8Array | null): void {
    if (value !== null && value.length >= 2) {
      this.writeBytes(value, 2);
    } else {
      this.writeZero(2);
    }
  }

  writeZero(number: number): void {
    if (number > 0) this.chunks.push(new Uint8Array(number));
  }

  upRecordLevel(): void {
    this.currentRecordLevel++;
  }

  downRecordLevel(): void {
    this.currentRecordLevel--;
  }

  setDocInfo(docInfo: ParaShapeIdCorrectionSource): void {
    this.docInfo = docInfo;
  }

  correctParaShapeId(oldParaShapeId: number): number {
    if (this.docInfo !== null) {
      return oldParaShapeId + this.docInfo.getIDMappings().getParaShapeCount() - this.docInfo.getParaShapeList().length;
    }
    return oldParaShapeId;
  }
}
