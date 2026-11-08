/**
 * Kind of the distance-from-body value (per level).
 * Ported from hwplib's `object.docinfo.numbering.ValueType`.
 * Stored byte values; valueOf default = RatioForLetter.
 */
export enum ValueType {
  /** Relative ratio to the letter size */
  RatioForLetter = 0,
  /** Absolute value */
  Value = 1,
}

export namespace ValueType {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): ValueType {
    return (ValueType as Record<number, string | undefined>)[value] !== undefined
      ? (value as ValueType)
      : ValueType.RatioForLetter;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: ValueType): number {
    return v;
  }
}
