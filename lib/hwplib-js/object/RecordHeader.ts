/**
 * Record header, ported from hwplib's `object.RecordHeader`.
 * Each HWP record begins with a 32-bit header: tagID (bits 0..9), level (10..19), size (20..31).
 * A size of 4095 means the real size follows as a UInt4.
 */
export class RecordHeader {
  tagID = 0;
  level = 0;
  size = 0;

  getTagID(): number {
    return this.tagID;
  }
  setTagID(tagID: number): void {
    this.tagID = tagID;
  }

  getLevel(): number {
    return this.level;
  }
  setLevel(level: number): void {
    this.level = level;
  }

  getSize(): number {
    return this.size;
  }
  setSize(size: number): void {
    this.size = size;
  }

  clone(): RecordHeader {
    const rh = new RecordHeader();
    rh.tagID = this.tagID;
    rh.level = this.level;
    rh.size = this.size;
    return rh;
  }
}
