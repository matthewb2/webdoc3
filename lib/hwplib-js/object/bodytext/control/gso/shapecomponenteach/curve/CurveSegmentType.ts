/**
 * 곡선의 Segment Type
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.curve.CurveSegmentType`.
 * Stored byte values; valueOf default = Line.
 *
 * @author neolord
 */
export enum CurveSegmentType {
  /**
   * line
   */
  Line = 0,
  /**
   * curve
   */
  Curve = 1,
}

export namespace CurveSegmentType {
  /** Java valueOf(byte): the matching constant, or Line when the value is unknown. */
  export function valueOf(value: number): CurveSegmentType {
    return (CurveSegmentType as Record<number, string | undefined>)[value] !== undefined
      ? (value as CurveSegmentType)
      : CurveSegmentType.Line;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: CurveSegmentType): number {
    return v;
  }
}
