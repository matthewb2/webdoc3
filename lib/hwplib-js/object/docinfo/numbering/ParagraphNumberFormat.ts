/**
 * Paragraph number format.
 * Ported from hwplib's `object.docinfo.numbering.ParagraphNumberFormat`.
 * Stored byte values; valueOf default = Number.
 */
export enum ParagraphNumberFormat {
  /** 1, 2, 3 (infinite) */
  Number = 0,
  /** circled 1, 2, 3 (1~20 repeated) */
  CircledNumber = 1,
  /** I, II, III (infinite) */
  UppercaseRomanNumber = 2,
  /** i, ii, iii (infinite) */
  LowercaseRomanNumber = 3,
  /** A, B, C (A~Z repeated) */
  UppercaseAlphabet = 4,
  /** a, b, c (a~z repeated) */
  LowercaseAlphabet = 5,
  /** circled A, B, C (A-Z repeated) */
  CircledUppercaseAlphabet = 6,
  /** circled a, b, c (a-z repeated) */
  CircledLowercaseAlphabet = 7,
  /** 가, 나, 다 */
  Hangul = 8,
  /** circled 가, 나, 다 (가~하 repeated) */
  CircledHangul = 9,
  /** ㄱ, ㄴ, ㄷ (ㄱ~ㅎ repeated) */
  HangulJamo = 10,
  /** circled ㄱ, ㄴ, ㄷ (ㄱ~ㅎ repeated) */
  CircledHangulJamo = 11,
  /** 일, 이, 삼 (일~구십구 repeated) */
  HangulNumber = 12,
  /** 一, 二, 三 (一~九十九 repeated) */
  HanjaNumber = 13,
  /** circled 一, 二, 三 (一~十 repeated) */
  CircledHanjaNumber = 14,
  /** 갑,을,병,정,무,기,경,신,임,계 */
  SibGanHangul = 15,
  /** 甲,乙,丙,丁,戊,己,庚,辛,壬,癸 */
  SibGanHanja = 16,
}

export namespace ParagraphNumberFormat {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): ParagraphNumberFormat {
    return (ParagraphNumberFormat as Record<number, string | undefined>)[value] !== undefined
      ? (value as ParagraphNumberFormat)
      : ParagraphNumberFormat.Number;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: ParagraphNumberFormat): number {
    return v;
  }
}
