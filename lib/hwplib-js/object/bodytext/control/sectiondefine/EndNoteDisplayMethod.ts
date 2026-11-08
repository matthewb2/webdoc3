/**
 * 미주를 위치시킬 방법
 * Ported from hwplib's `object.bodytext.control.sectiondefine.EndNoteDisplayMethod`.
 *
 * @author neolord
 */
export enum EndNoteDisplayMethod {
  /** 문서의 마지막 */
  DocumentEnd = 0,
  /** 구역의 마지막 */
  SectionEnd = 1,
}

export namespace EndNoteDisplayMethod {
  /** Java valueOf(byte): the matching constant, or the default (DocumentEnd) when unknown. */
  export function valueOf(value: number): EndNoteDisplayMethod {
    return (EndNoteDisplayMethod as Record<number, string | undefined>)[value] !== undefined
      ? (value as EndNoteDisplayMethod)
      : EndNoteDisplayMethod.DocumentEnd;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: EndNoteDisplayMethod): number {
    return v;
  }
}
