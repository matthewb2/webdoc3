/**
 * Outline style.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.lineinfo.OutlineStyle`.
 *
 * @author neolord
 */
export enum OutlineStyle {
  /**
   * Normal
   */
  Normal = 0,
  /**
   * Outter
   */
  Outter = 1,
  /**
   * Inner
   */
  Inner = 2,
}

export namespace OutlineStyle {
  /** Java valueOf(byte): the matching constant, or Normal when the value is unknown. */
  export function valueOf(value: number): OutlineStyle {
    return (OutlineStyle as Record<number, string | undefined>)[value] !== undefined
      ? (value as OutlineStyle)
      : OutlineStyle.Normal;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: OutlineStyle): number {
    return v;
  }
}
