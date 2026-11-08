/**
 * File version, ported from hwplib's `object.fileheader.FileVersion`.
 * The version is a packed UInt4: MM.NN.PP.RR (one byte each, MM highest).
 */
export class FileVersion {
  private mm = 0;
  private nn = 0;
  private pp = 0;
  private rr = 0;

  /** Set from the packed unsigned 32-bit value. */
  setVersion(version: number): void {
    this.mm = (version & 0xff000000) >>> 24;
    this.nn = (version & 0x00ff0000) >>> 16;
    this.pp = (version & 0x0000ff00) >>> 8;
    this.rr = version & 0x000000ff;
  }

  setVersionParts(mm: number, nn: number, pp: number, rr: number): void {
    this.mm = mm;
    this.nn = nn;
    this.pp = pp;
    this.rr = rr;
  }

  /** The packed unsigned 32-bit value. */
  getVersion(): number {
    return ((this.mm & 0xff) * 2 ** 24 + (this.nn & 0xff) * 2 ** 16 + (this.pp & 0xff) * 2 ** 8 + (this.rr & 0xff));
  }

  getMM(): number {
    return this.mm;
  }
  getNN(): number {
    return this.nn;
  }
  getPP(): number {
    return this.pp;
  }
  getRR(): number {
    return this.rr;
  }

  /**
   * Whether this version is greater than *or equal to* (mm2, nn2, pp2, rr2).
   * Ported verbatim from hwplib `isOver`, whose final clause includes equality — the reader relies
   * on this "over-or-equal" behavior to gate version-specific record fields.
   */
  isOver(mm2: number, nn2: number, pp2: number, rr2: number): boolean {
    return (
      this.mm > mm2 ||
      (this.mm === mm2 && this.nn > nn2) ||
      (this.mm === mm2 && this.nn === nn2 && this.pp > pp2) ||
      (this.mm === mm2 && this.nn === nn2 && this.pp === pp2 && this.rr > rr2) ||
      (this.mm === mm2 && this.nn === nn2 && this.pp === pp2 && this.rr === rr2)
    );
  }

  toString(): string {
    return `${this.mm}.${this.nn}.${this.pp}.${this.rr}.`;
  }

  copy(from: FileVersion): void {
    this.mm = from.mm;
    this.nn = from.nn;
    this.pp = from.pp;
    this.rr = from.rr;
  }
}
