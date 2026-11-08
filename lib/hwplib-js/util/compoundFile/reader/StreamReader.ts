import { RecordHeader } from "../../../object/RecordHeader.js";
import type { FileVersion } from "../../../object/fileheader/FileVersion.js";
import * as BitFlag from "../../binary/BitFlag.js";

/**
 * Structural view of the parts of DocInfo that `correctParaShapeId` needs. The real DocInfo
 * (ported in a later phase) satisfies this shape, so no import cycle is introduced here.
 */
export interface ParaShapeIdCorrectionSource {
  getIDMappings(): { getParaShapeCount(): number };
  getParaShapeList(): { length: number };
}

const utf16le = new TextDecoder("utf-16le");

/**
 * Sequential reader over a single (already-decompressed, already-decrypted) HWP stream.
 * Ported from hwplib's `util.compoundFile.reader.StreamReader`, but reads from a `Uint8Array`
 * instead of a Java `InputStream` — decompression/decryption is handled by the compound-file
 * adapter, mirroring hwplib's `StreamReader.create`.
 */
export class StreamReader {
  private readonly data: Uint8Array;
  private readonly view: DataView;
  private readonly size: number;
  /** bytes read so far (stream position) */
  private read = 0;
  /** bytes read since the last record header */
  private readAfterHeader = 0;
  private readonly header = new RecordHeader();

  fileVersion: FileVersion | null;
  private docInfo: ParaShapeIdCorrectionSource | null = null;

  constructor(data: Uint8Array, fileVersion: FileVersion | null) {
    this.data = data;
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    this.size = data.byteLength;
    this.fileVersion = fileVersion;
  }

  private forwardPosition(n: number): void {
    this.read += n;
    this.readAfterHeader += n;
  }

  readBytes(n: number): Uint8Array {
    const out = this.data.subarray(this.read, this.read + n);
    this.forwardPosition(n);
    return out;
  }

  readSInt1(): number {
    const v = this.view.getInt8(this.read);
    this.forwardPosition(1);
    return v;
  }

  readUInt1(): number {
    const v = this.view.getUint8(this.read);
    this.forwardPosition(1);
    return v;
  }

  readSInt2(): number {
    const v = this.view.getInt16(this.read, true);
    this.forwardPosition(2);
    return v;
  }

  readUInt2(): number {
    const v = this.view.getUint16(this.read, true);
    this.forwardPosition(2);
    return v;
  }

  readSInt4(): number {
    const v = this.view.getInt32(this.read, true);
    this.forwardPosition(4);
    return v;
  }

  readUInt4(): number {
    const v = this.view.getUint32(this.read, true);
    this.forwardPosition(4);
    return v;
  }

  readDouble(): number {
    const v = this.view.getFloat64(this.read, true);
    this.forwardPosition(8);
    return v;
  }

  readFloat(): number {
    const v = this.view.getFloat32(this.read, true);
    this.forwardPosition(4);
    return v;
  }

  skip(n: number): void {
    this.forwardPosition(n);
  }

  /** Read a record header (see {@link RecordHeader}); returns the reused header instance. */
  readRecordHeader(): RecordHeader {
    if (this.isEndOfStream()) {
      this.header.setTagID(0);
      this.header.setLevel(0);
      this.header.setSize(0);
    } else {
      const value = this.readUInt4();
      this.header.setTagID(BitFlag.getRange(value, 0, 9));
      this.header.setLevel(BitFlag.getRange(value, 10, 19));
      this.header.setSize(BitFlag.getRange(value, 20, 31));
      if (this.header.getSize() === 4095) {
        this.header.setSize(this.readUInt4());
      }
    }
    this.readAfterHeader = 0;
    return this.header;
  }

  /** UInt2 length (in code units) followed by UTF-16LE bytes; `null` when length is 0. */
  readUTF16LEString(): string | null {
    const len = this.readUInt2();
    if (len > 0) {
      const bytes = this.readBytes(len * 2);
      return utf16le.decode(bytes);
    }
    return null;
  }

  /** UInt2 length (in code units) followed by the raw UTF-16LE bytes; `null` when length is 0. */
  readHWPString(): Uint8Array | null {
    const len = this.readUInt2();
    if (len > 0) {
      // copy: subarray would alias the backing buffer
      return this.readBytes(len * 2).slice();
    }
    return null;
  }

  readWChar(): Uint8Array {
    return this.readBytes(2).slice();
  }

  getSize(): number {
    return this.size;
  }

  getCurrentPosition(): number {
    return this.read;
  }

  isEndOfStream(): boolean {
    return this.read >= this.size;
  }

  getCurrentRecordHeader(): RecordHeader {
    return this.header;
  }

  getCurrentPositionAfterHeader(): number {
    return this.readAfterHeader;
  }

  getFileVersion(): FileVersion | null {
    return this.fileVersion;
  }

  setFileVersion(fileVersion: FileVersion): void {
    this.fileVersion = fileVersion;
  }

  isEndOfRecord(): boolean {
    return this.readAfterHeader >= this.header.getSize();
  }

  isImmediatelyAfterReadingHeader(): boolean {
    return this.readAfterHeader === 0;
  }

  nextRecord(): void {
    this.readAfterHeader = -1;
  }

  skipToEndRecord(): void {
    const n = this.header.getSize() - this.readAfterHeader;
    if (n > 0) this.skip(n);
  }

  setDocInfo(docInfo: ParaShapeIdCorrectionSource): void {
    this.docInfo = docInfo;
  }

  correctParaShapeId(oldParaShapeId: number): number {
    if (this.docInfo !== null) {
      return oldParaShapeId - this.docInfo.getIDMappings().getParaShapeCount() + this.docInfo.getParaShapeList().length;
    }
    return oldParaShapeId;
  }
}
