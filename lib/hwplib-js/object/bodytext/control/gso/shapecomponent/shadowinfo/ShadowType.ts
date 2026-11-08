/**
 * Shadow type.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.shadowinfo.ShadowType`.
 *
 * @author neolord
 */
export enum ShadowType {
  /**
   * None
   */
  None = 0,
  /**
   * Left top
   */
  LeftTop = 1,
  /**
   * Right top
   */
  RightTop = 2,
  /**
   * Left bottom
   */
  LeftBottom = 3,
  /**
   * Right bottom
   */
  RightBottom = 4,
  /**
   * Left back
   */
  LeftBack = 5,
  /**
   * Right back
   */
  RightBack = 6,
  /**
   * Left front
   */
  LeftFront = 7,
  /**
   * Right front
   */
  RightFront = 8,
  /**
   * Small
   */
  Small = 13,
  /**
   * Large
   */
  Large = 14,
}

export namespace ShadowType {
  /** Java valueOf(byte): the matching constant, or None when the value is unknown. */
  export function valueOf(value: number): ShadowType {
    return (ShadowType as Record<number, string | undefined>)[value] !== undefined
      ? (value as ShadowType)
      : ShadowType.None;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: ShadowType): number {
    return v;
  }
}
