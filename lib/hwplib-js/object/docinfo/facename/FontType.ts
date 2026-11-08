/**
 * Substitute font type.
 * Ported from hwplib's `object.docinfo.facename.FontType`.
 * Stored byte values; valueOf default = Unknown.
 */
export enum FontType {
  /** When the original type is unknown */
  Unknown = 0,
  /** TrueType font (TTF) */
  TTF = 1,
  /** Hangul-only font (HFT) */
  HFT = 2,
}

export namespace FontType {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): FontType {
    return (FontType as Record<number, string | undefined>)[value] !== undefined
      ? (value as FontType)
      : FontType.Unknown;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: FontType): number {
    return v;
  }
}
