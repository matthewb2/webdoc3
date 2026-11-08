/**
 * Paragraph alignment kind.
 * Ported from hwplib's `object.docinfo.numbering.ParagraphAlignment`.
 * Stored byte values; valueOf default = Left.
 */
export enum ParagraphAlignment {
  /** Left */
  Left = 0,
  /** Center */
  Center = 1,
  /** Right */
  Right = 2,
}

export namespace ParagraphAlignment {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): ParagraphAlignment {
    return (ParagraphAlignment as Record<number, string | undefined>)[value] !== undefined
      ? (value as ParagraphAlignment)
      : ParagraphAlignment.Left;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: ParagraphAlignment): number {
    return v;
  }
}
