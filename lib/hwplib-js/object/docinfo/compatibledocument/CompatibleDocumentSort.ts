/**
 * The kind of target program for a compatible document.
 * Ported from hwplib's `object.docinfo.compatibledocument.CompatibleDocumentSort`.
 * Valued enum: member value = the stored byte value.
 */
export enum CompatibleDocumentSort {
  /** HWP document (current version) */
  HWPCurrent = 0,
  /** HWP 2007 compatible document */
  HWP2007 = 1,
  /** MS Word compatible document */
  MSWord = 2,
}

export namespace CompatibleDocumentSort {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): CompatibleDocumentSort {
    return (CompatibleDocumentSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as CompatibleDocumentSort)
      : CompatibleDocumentSort.HWPCurrent;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: CompatibleDocumentSort): number {
    return v;
  }
}
