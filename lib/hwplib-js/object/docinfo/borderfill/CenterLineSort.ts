/**
 * Ported from hwplib's `object.docinfo.borderfill.CenterLineSort`.
 */
export enum CenterLineSort {
  /** 선없음 */
  None = 0,
  /** 수평선 */
  Horizontal = 1,
  /** 수직선 */
  Vertical = 2,
  /** 교차 */
  Cross = 3,
}

export namespace CenterLineSort {
  /** Java valueOf(byte): the matching constant, or the default (None) when unknown. */
  export function valueOf(value: number): CenterLineSort {
    return (CenterLineSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as CenterLineSort)
      : CenterLineSort.None;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: CenterLineSort): number {
    return v;
  }
}
