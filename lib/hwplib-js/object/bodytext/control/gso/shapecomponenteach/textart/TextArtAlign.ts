/**
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.textart.TextArtAlign`.
 * Stored byte values; valueOf default = LEFT.
 */
export enum TextArtAlign {
  LEFT = 0,
  RIGHT = 1,
  CENTER = 2,
  FULL = 3,
  TABLE = 4,
}

export namespace TextArtAlign {
  /** Java valueOf(byte): the matching constant, or LEFT when the value is unknown. */
  export function valueOf(value: number): TextArtAlign {
    return (TextArtAlign as Record<number, string | undefined>)[value] !== undefined
      ? (value as TextArtAlign)
      : TextArtAlign.LEFT;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: TextArtAlign): number {
    return v;
  }
}
