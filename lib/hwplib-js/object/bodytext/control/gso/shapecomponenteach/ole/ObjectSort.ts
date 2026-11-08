/**
 * OLE 객체 종류
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ole.ObjectSort`.
 * Stored byte values; valueOf default = Unknown.
 *
 * @author neolord
 */
export enum ObjectSort {
  /**
   * Unknown
   */
  Unknown = 0,
  /**
   * Embedded
   */
  Embedded = 1,
  /**
   * Link
   */
  Link = 2,
  /**
   * Static
   */
  Static = 3,
  /**
   * Equation
   */
  Equation = 4,
}

export namespace ObjectSort {
  /** Java valueOf(byte): the matching constant, or Unknown when the value is unknown. */
  export function valueOf(value: number): ObjectSort {
    return (ObjectSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as ObjectSort)
      : ObjectSort.Unknown;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: ObjectSort): number {
    return v;
  }
}
