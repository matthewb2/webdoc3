/**
 * Arrow size (horizontal size-vertical size).
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.lineinfo.LineArrowSize`.
 *
 * @author neolord
 */
export enum LineArrowSize {
  /**
   * Small-Small
   */
  SmallSmall = 0,
  /**
   * Small-Middle
   */
  SmallMiddle = 1,
  /**
   * Small-Big
   */
  SmallBig = 2,
  /**
   * Middle-Small
   */
  MiddleSmall = 3,
  /**
   * Middle-Middle
   */
  MiddleMiddle = 4,
  /**
   * Middle-Big
   */
  MiddleBig = 5,
  /**
   * Big-Small
   */
  BigSmall = 6,
  /**
   * Big-Middle
   */
  BigMiddle = 7,
  /**
   * Big-Big
   */
  BigBig = 8,
}

export namespace LineArrowSize {
  /** Java valueOf(byte): the matching constant, or SmallSmall when the value is unknown. */
  export function valueOf(value: number): LineArrowSize {
    return (LineArrowSize as Record<number, string | undefined>)[value] !== undefined
      ? (value as LineArrowSize)
      : LineArrowSize.SmallSmall;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: LineArrowSize): number {
    return v;
  }
}
