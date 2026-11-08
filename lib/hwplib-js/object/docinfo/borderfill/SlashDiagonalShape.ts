/**
 * Slash 대각선 모양
 * Ported from hwplib's `object.docinfo.borderfill.SlashDiagonalShape`.
 *
 * @author neolord
 */
export enum SlashDiagonalShape {
  /** none */
  None = 0,
  /** slash (RightTop --> leftBottom) "/" */
  Slash = 2,
  /** RightTop --> Bottom Edge */
  RightTopToBottomEdge = 3,
  /** RightTop --> Left Edge */
  RightTopToLeftEdge = 6,
  /** RightTop --> Bottom & Left Edge */
  RightTopToBottomLeftEdge = 7,
}

export namespace SlashDiagonalShape {
  /** Java valueOf(byte): the matching constant, or the default (None) when unknown. */
  export function valueOf(value: number): SlashDiagonalShape {
    return (SlashDiagonalShape as Record<number, string | undefined>)[value] !== undefined
      ? (value as SlashDiagonalShape)
      : SlashDiagonalShape.None;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: SlashDiagonalShape): number {
    return v;
  }
}
