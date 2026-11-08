/**
 * 위치 기준
 * Ported from hwplib's `object.bodytext.control.sectiondefine.PositionCriterion`.
 *
 * @author neolord
 */
export enum PositionCriterion {
  /** 본문 기준 */
  MainText = 0,
  /** 종이 기준 */
  Paper = 1,
}

export namespace PositionCriterion {
  /** Java valueOf(byte): the matching constant, or the default (MainText) when unknown. */
  export function valueOf(value: number): PositionCriterion {
    return (PositionCriterion as Record<number, string | undefined>)[value] !== undefined
      ? (value as PositionCriterion)
      : PositionCriterion.MainText;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: PositionCriterion): number {
    return v;
  }
}
