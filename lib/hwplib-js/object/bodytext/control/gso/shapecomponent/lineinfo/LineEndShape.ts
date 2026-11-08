/**
 * Line end shape.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.lineinfo.LineEndShape`.
 *
 * @author neolord
 */
export enum LineEndShape {
  /**
   * Round line end
   */
  Round = 0,
  /**
   * Flat line end
   */
  Flat = 1,
}

export namespace LineEndShape {
  /** Java valueOf(byte): the matching constant, or Round when the value is unknown. */
  export function valueOf(value: number): LineEndShape {
    return (LineEndShape as Record<number, string | undefined>)[value] !== undefined
      ? (value as LineEndShape)
      : LineEndShape.Round;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: LineEndShape): number {
    return v;
  }
}
