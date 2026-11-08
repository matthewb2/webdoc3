/**
 * 채우기 무늬 종류
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.PatternType`.
 *
 * @author neolord
 */
export enum PatternType {
  /** 단색 (solid) */
  None = -1,
  /** 수평선 (- - - -) */
  HorizontalLine = 0,
  /** 수직선 (|||||) */
  VerticalLine = 1,
  /** 하향 대각선 (\\\\\) */
  BackDiagonalLine = 2,
  /** 상향 대각선 (/////) */
  FrontDiagonalLine = 3,
  /** 심자선 (+++++) */
  CrossLine = 4,
  /** 체크 (xxxxx) */
  CrossDiagonalLine = 5,
}

export namespace PatternType {
  /** Java valueOf(byte): the matching constant, or the default (None) when unknown. */
  export function valueOf(value: number): PatternType {
    return (PatternType as Record<number, string | undefined>)[value] !== undefined
      ? (value as PatternType)
      : PatternType.None;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: PatternType): number {
    return v;
  }
}
