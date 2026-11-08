/**
 * 대각선 종류
 * Ported from hwplib's `object.docinfo.borderfill.DiagonalSort`.
 *
 * @author neolord
 */
export enum DiagonalSort {
  /** Slash */
  Slash = 0,
  /** BackSlash */
  BackSlash = 1,
  /** CrookedSlash */
  CrookedSlash = 2,
}

export namespace DiagonalSort {
  /** Java valueOf(byte): the matching constant, or the default (Slash) when unknown. */
  export function valueOf(value: number): DiagonalSort {
    return (DiagonalSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as DiagonalSort)
      : DiagonalSort.Slash;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: DiagonalSort): number {
    return v;
  }
}
