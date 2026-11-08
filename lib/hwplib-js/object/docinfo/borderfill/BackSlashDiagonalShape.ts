/**
 * BackSlash의 대각선 모양
 * Ported from hwplib's `object.docinfo.borderfill.BackSlashDiagonalShape`.
 *
 * @author neolord
 */
export enum BackSlashDiagonalShape {
  /** none */
  None = 0,
  /** back slash(leftTop --> rightBottom) "\" */
  BackSlash = 2,
  /** LeftTop --> Bottom Edge */
  LeftTopToBottomEdge = 3,
  /** LeftTop --> Right Edge */
  LeftTopToRightEdg = 6,
  /** LeftTop --> Bottom & Right Edge */
  LeftTopToBottomRightEdge = 7,
}

export namespace BackSlashDiagonalShape {
  /** Java valueOf(byte): the matching constant, or the default (None) when unknown. */
  export function valueOf(value: number): BackSlashDiagonalShape {
    return (BackSlashDiagonalShape as Record<number, string | undefined>)[value] !== undefined
      ? (value as BackSlashDiagonalShape)
      : BackSlashDiagonalShape.None;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: BackSlashDiagonalShape): number {
    return v;
  }
}
