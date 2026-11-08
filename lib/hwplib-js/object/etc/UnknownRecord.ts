import type { RecordHeader } from "../RecordHeader.js";

/**
 * An unknown record, ported from hwplib's `object.etc.UnknownRecord`.
 * Retains the raw record header and body bytes for records the reader does not recognize.
 */
export class UnknownRecord {
  /**
   * The record header.
   */
  private header: RecordHeader | null = null;
  /**
   * The record data.
   */
  private body: Uint8Array | null = null;

  constructor(header?: RecordHeader) {
    if (header !== undefined) {
      this.header = header.clone();
    }
  }

  getHeader(): RecordHeader | null {
    return this.header;
  }

  setHeader(header: RecordHeader): void {
    this.header = header.clone();
  }

  getBody(): Uint8Array | null {
    return this.body;
  }

  setBody(body: Uint8Array | null): void {
    this.body = body;
  }

  clone(): UnknownRecord {
    const cloned = new UnknownRecord();
    if (this.header !== null) {
      cloned.header = this.header.clone();
    }
    if (this.body !== null) {
      cloned.body = this.body.slice();
    }
    return cloned;
  }
}
