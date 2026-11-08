/**
 * 그림 효과
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.PictureEffect`.
 *
 * @author neolord
 */
export enum PictureEffect {
  /** 실제이미지(REAL_PIC) */
  RealPicture = 0,
  /** 회색톤 (GRAY_SCALE) */
  GrayScale = 1,
  /** 흑백 (BLACK_WHITE) */
  BlackWhite = 2,
  /** PATTERN8x8 */
  Pattern8x8 = 3,
}

export namespace PictureEffect {
  /** Java valueOf(byte): the matching constant, or the default (RealPicture) when unknown. */
  export function valueOf(value: number): PictureEffect {
    return (PictureEffect as Record<number, string | undefined>)[value] !== undefined
      ? (value as PictureEffect)
      : PictureEffect.RealPicture;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: PictureEffect): number {
    return v;
  }
}
