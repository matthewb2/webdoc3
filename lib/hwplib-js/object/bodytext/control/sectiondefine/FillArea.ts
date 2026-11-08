/**
 * 채워질 영역의 종류
 * Ported from hwplib's `object.bodytext.control.sectiondefine.FillArea`.
 *
 * @author neolord
 */
export enum FillArea {
  /** 종이 */
  Paper = 0,
  /** 쪽 */
  Page = 1,
  /** 테두리 */
  Border = 2,
}

export namespace FillArea {
  /** Java valueOf(byte): the matching constant, or the default (Paper) when unknown. */
  export function valueOf(value: number): FillArea {
    return (FillArea as Record<number, string | undefined>)[value] !== undefined
      ? (value as FillArea)
      : FillArea.Paper;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: FillArea): number {
    return v;
  }
}
