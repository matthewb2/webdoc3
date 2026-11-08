/**
 * Tab sort (kind).
 * Ported from hwplib's `object.docinfo.tabdef.TabSort`.
 * Stored byte values; valueOf default = Left.
 */
export enum TabSort {
  /** Left */
  Left = 0,
  /** Right */
  Right = 1,
  /** Center */
  Center = 2,
  /** Decimal point */
  DecimalPoint = 3,
}

export namespace TabSort {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): TabSort {
    return (TabSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as TabSort)
      : TabSort.Left;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: TabSort): number {
    return v;
  }
}
