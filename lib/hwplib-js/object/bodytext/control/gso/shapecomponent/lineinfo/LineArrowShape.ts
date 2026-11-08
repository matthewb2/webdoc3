/**
 * Arrow shape at the end of a line.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.lineinfo.LineArrowShape`.
 *
 * @author neolord
 */
export enum LineArrowShape {
  /**
   * No shape
   */
  None = 0,
  /**
   * Arrow
   */
  Arrow = 1,
  /**
   * Lined arrow
   */
  LinedArrow = 2,
  /**
   * Concave arrow
   */
  ConcaveArrow = 3,
  /**
   * Hollow diamond shape
   */
  Diamond = 4,
  /**
   * Hollow circle shape
   */
  Circle = 5,
  /**
   * Hollow rectangle shape
   */
  Rectangle = 6,
}

export namespace LineArrowShape {
  /** Java valueOf(byte): the matching constant, or None when the value is unknown. */
  export function valueOf(value: number): LineArrowShape {
    return (LineArrowShape as Record<number, string | undefined>)[value] !== undefined
      ? (value as LineArrowShape)
      : LineArrowShape.None;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: LineArrowShape): number {
    return v;
  }
}
