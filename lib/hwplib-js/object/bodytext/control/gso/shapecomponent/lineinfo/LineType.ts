/**
 * Line type.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.lineinfo.LineType`.
 *
 * @author neolord
 */
export enum LineType {
  /**
   * None
   */
  None = 0,
  /**
   * Solid line
   */
  Solid = 1,
  /**
   * Dash line
   */
  Dash = 2,
  /**
   * Dot line
   */
  Dot = 3,
  /**
   * Dash-dot line
   */
  DashDot = 4,
  /**
   * Dash-dot-dot line
   */
  DashDotDot = 5,
  /**
   * Long dash line
   */
  LongDash = 6,
  /**
   * Circle dot line
   */
  CircleDot = 7,
  /**
   * Double line
   */
  Double = 8,
  /**
   * Thin-bold double line
   */
  ThinBold = 9,
  /**
   * Bold-thin double line
   */
  BoldThin = 10,
  /**
   * Thin-bold-thin triple line
   */
  ThinBoldThin = 11,
}

export namespace LineType {
  /** Java valueOf(byte): the matching constant, or None when the value is unknown. */
  export function valueOf(value: number): LineType {
    return (LineType as Record<number, string | undefined>)[value] !== undefined
      ? (value as LineType)
      : LineType.None;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: LineType): number {
    return v;
  }
}
