/**
 * 번호 모양
 * Ported from hwplib's `object.bodytext.control.sectiondefine.NumberShape`.
 *
 * @author neolord
 */
export enum NumberShape {
  /** 1, 2, 3 */
  Number = 0,
  /** 동그라미 쳐진 1, 2, 3 */
  CircledNumber = 1,
  /** I, II, III */
  UppercaseRomanNumber = 2,
  /** i, ii, iii */
  LowercaseRomanNumber = 3,
  /** A, B, C */
  UppercaseAlphabet = 4,
  /** a, b, c */
  LowercaseAlphabet = 5,
  /** 동그라미 쳐진 A, B, C */
  CircledUppercaseAlphabet = 6,
  /** 동그라미 쳐진 a, b, c */
  CircledLowercaseAlphabet = 7,
  /** 가, 나, 다 */
  Hangul = 8,
  /** 동그라미 쳐진 가,나,다 */
  CircledHangul = 9,
  /** ㄱ, ㄴ, ㄷ */
  HangulJamo = 10,
  /** 동그라미 쳐진 ㄱ,ㄴ,ㄷ */
  CircledHangulJamo = 11,
  /** 일, 이, 삼 */
  HangulNumber = 12,
  /** 一, 二, 三 */
  HanjaNumber = 13,
  /** 동그라미 쳐진 一,二,三 */
  CircledHanjaNumber = 14,
  /** 갑, 을, 병, 정, 무, 기, 경, 신, 임, 계 */
  HangulSibgan = 15,
  /** 甲, 乙, 丙, 丁, 戊, 己, 庚, 辛, 壬, 癸 */
  HanjaSibgan = 16,
  /** 4가지 문자가 차례로 반복(각주/미주 전용) */
  Symbol = 0x80,
  /** 사용자 지정 문자 반복 */
  UserChar = 0x81,
}

export namespace NumberShape {
  /** Java valueOf(short): the matching constant, or the default (Number) when unknown. */
  export function valueOf(value: number): NumberShape {
    return (NumberShape as Record<number, string | undefined>)[value] !== undefined
      ? (value as NumberShape)
      : NumberShape.Number;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: NumberShape): number {
    return v;
  }
}
