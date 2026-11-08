/**
 * 한 페이지 내에서 각주를 다단에 위치시킬 방법
 * Ported from hwplib's `object.bodytext.control.sectiondefine.FootNoteDisplayMethod`.
 *
 * @author neolord
 */
export enum FootNoteDisplayMethod {
  /** 각 단마다 따로 배열 */
  EachColumn = 0,
  /** 통단으로 배열 */
  AllColumn = 1,
  /** 가장 오른쪽 단에 배열 */
  RightColumn = 2,
}

export namespace FootNoteDisplayMethod {
  /** Java valueOf(byte): the matching constant, or the default (EachColumn) when unknown. */
  export function valueOf(value: number): FootNoteDisplayMethod {
    return (FootNoteDisplayMethod as Record<number, string | undefined>)[value] !== undefined
      ? (value as FootNoteDisplayMethod)
      : FootNoteDisplayMethod.EachColumn;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: FootNoteDisplayMethod): number {
    return v;
  }
}
