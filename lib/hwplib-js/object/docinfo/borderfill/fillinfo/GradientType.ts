/**
 * 그러데이션 유형
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.GradientType`.
 *
 * @author neolord
 */
export enum GradientType {
  /** 줄무늬형 */
  Stripe = 1,
  /** 원형 */
  Circle = 2,
  /** 원뿔형 */
  Cone = 3,
  /** 사각형 */
  Square = 4,
}

export namespace GradientType {
  /** Java valueOf(byte): the matching constant, or the default (Stripe) when unknown. */
  export function valueOf(value: number): GradientType {
    return (GradientType as Record<number, string | undefined>)[value] !== undefined
      ? (value as GradientType)
      : GradientType.Stripe;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: GradientType): number {
    return v;
  }
}
