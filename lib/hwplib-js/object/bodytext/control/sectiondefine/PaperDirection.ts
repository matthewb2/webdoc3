/**
 * 용지 방향
 * Ported from hwplib's `object.bodytext.control.sectiondefine.PaperDirection`.
 *
 * @author neolord
 */
export enum PaperDirection {
  /** 좁게 */
  Portrait = 0,
  /** 넓게 */
  Landscape = 1,
}

export namespace PaperDirection {
  /** Java valueOf(byte): the matching constant, or the default (Portrait) when unknown. */
  export function valueOf(value: number): PaperDirection {
    return (PaperDirection as Record<number, string | undefined>)[value] !== undefined
      ? (value as PaperDirection)
      : PaperDirection.Portrait;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: PaperDirection): number {
    return v;
  }
}
