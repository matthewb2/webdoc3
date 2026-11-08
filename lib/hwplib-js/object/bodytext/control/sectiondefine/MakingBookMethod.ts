/**
 * 제책 방법
 * Ported from hwplib's `object.bodytext.control.sectiondefine.MakingBookMethod`.
 *
 * @author neolord
 */
export enum MakingBookMethod {
  /** 한쪽 편집 */
  OneSideEditing = 0,
  /** 맞쪽 편집 */
  BothSideEditing = 1,
  /** 위로 넘기기 */
  BackFlip = 2,
}

export namespace MakingBookMethod {
  /** Java valueOf(byte): the matching constant, or the default (OneSideEditing) when unknown. */
  export function valueOf(value: number): MakingBookMethod {
    return (MakingBookMethod as Record<number, string | undefined>)[value] !== undefined
      ? (value as MakingBookMethod)
      : MakingBookMethod.OneSideEditing;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: MakingBookMethod): number {
    return v;
  }
}
