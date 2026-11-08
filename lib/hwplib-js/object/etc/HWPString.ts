/**
 * A UTF-16LE string field, ported from hwplib's `object.etc.HWPString`.
 * Stores the raw bytes and encodes/decodes to UTF-16LE on demand.
 */
export class HWPString {
  private bytes: Uint8Array | null;

  constructor(bytes: Uint8Array | null = null) {
    this.bytes = bytes;
  }

  getBytes(): Uint8Array | null {
    return this.bytes;
  }

  setBytes(bytes: Uint8Array | null): void {
    this.bytes = bytes;
  }

  toUTF16LEString(): string | null {
    if (this.bytes === null) {
      return null;
    }
    return new TextDecoder("utf-16le").decode(this.bytes);
  }

  fromUTF16LEString(utf16LE: string | null): void {
    if (utf16LE !== null && utf16LE.length > 0) {
      const buffer = new Uint8Array(utf16LE.length * 2);
      const dataView = new DataView(buffer.buffer);
      for (let i = 0; i < utf16LE.length; i++) {
        dataView.setUint16(i * 2, utf16LE.charCodeAt(i), true);
      }
      this.bytes = buffer;
    }
  }

  clone(): HWPString {
    const cloned = new HWPString();
    cloned.copy(this);
    return cloned;
  }

  copy(from: HWPString): void {
    this.bytes = from.bytes;
  }

  getWCharsSize(): number {
    if (this.bytes !== null) {
      return 2 + this.bytes.length;
    }
    return 2;
  }

  equals(other: HWPString): boolean {
    const a = this.bytes;
    const b = other.bytes;
    if (a === b) {
      return true;
    }
    if (a === null || b === null) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
}
