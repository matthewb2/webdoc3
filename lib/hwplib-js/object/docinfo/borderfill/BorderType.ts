/**
 * Ported from hwplib's `object.docinfo.borderfill.BorderType`.
 *
 * 테두리선 종류
 */
export enum BorderType {
  /** 선없음 */
  None = 0,
  /** 실선 */
  Solid = 1,
  /** 긴 점선 (쇄선) */
  Dash = 2,
  /** 점선 */
  Dot = 3,
  /** -.-.-.-.(일점 쇄선) */
  DashDot = 4,
  /** -..-..-..(이점 쇄선) */
  DashDotDot = 5,
  /** Dash보다 긴 선분의 반복 */
  LongDash = 6,
  /** Dot보다 큰 동그라미의 반복 */
  CircleDot = 7,
  /** 2중선 */
  Double = 8,
  /** 가는선 + 굵은선 2중선 */
  ThinThick = 9,
  /** 굵은선 + 가는선 2중선 */
  ThickThin = 10,
  /** 가는선 + 굵은선 + 가는선 3중선 */
  ThinThickThin = 11,
  /** 물결 */
  Wave = 12,
  /** 물결 2중선 */
  DoubleWave = 13,
  /** 두꺼운 3D */
  Thick3D = 14,
  /** 두꺼운 3D(광원 반대) */
  Thick3DReverseLighting = 15,
  /** 3D 단선 */
  Solid3D = 16,
  /** 3D 단선(광원 반대) */
  Solid3DReverseLighting = 17,
}

export namespace BorderType {
  /** Java valueOf(byte): the matching constant, or the default (Solid) when unknown. */
  export function valueOf(value: number): BorderType {
    return (BorderType as Record<number, string | undefined>)[value] !== undefined
      ? (value as BorderType)
      : BorderType.Solid;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: BorderType): number {
    return v;
  }
}
