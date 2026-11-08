/**
 * 호 테두리
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.arc.ArcType`.
 * Stored byte values; valueOf default = Arc.
 *
 * @author neolord
 */
export enum ArcType {
  /**
   * 호
   */
  Arc = 0,
  /**
   * 부채꼴
   */
  CircularSector = 1,
  /**
   * 활
   */
  Bow = 2,
}

export namespace ArcType {
  /** Java valueOf(byte): the matching constant, or Arc when the value is unknown. */
  export function valueOf(value: number): ArcType {
    return (ArcType as Record<number, string | undefined>)[value] !== undefined
      ? (value as ArcType)
      : ArcType.Arc;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: ArcType): number {
    return v;
  }
}
