/**
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.objectlinkline.LinkLineType`.
 * Stored byte values; valueOf default = Straight_NoArrow.
 */
export enum LinkLineType {
  Straight_NoArrow = 0,
  Straight_OneWay = 1,
  Straight_Both = 2,
  Stroke_NoArrow = 3,
  Stoke_OneWay = 4,
  Stoke_Both = 5,
  Arc_NoArrow = 6,
  Arc_OneWay = 7,
  Arc_Both = 8,
}

export namespace LinkLineType {
  /** Java valueOf(byte): the matching constant, or Straight_NoArrow when the value is unknown. */
  export function valueOf(value: number): LinkLineType {
    return (LinkLineType as Record<number, string | undefined>)[value] !== undefined
      ? (value as LinkLineType)
      : LinkLineType.Straight_NoArrow;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: LinkLineType): number {
    return v;
  }
}
