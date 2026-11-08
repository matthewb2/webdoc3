/**
 * Style sort (kind).
 * Ported from hwplib's `object.docinfo.style.StyleSort`.
 * Stored byte values; valueOf default = ParaStyle.
 */
export enum StyleSort {
  /** Paragraph style */
  ParaStyle = 0,
  /** Character style */
  CharStyle = 1,
}

export namespace StyleSort {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): StyleSort {
    return (StyleSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as StyleSort)
      : StyleSort.ParaStyle;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: StyleSort): number {
    return v;
  }
}
