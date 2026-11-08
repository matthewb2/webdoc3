/**
 * 줄 나눔 기준 한글 단위
 *
 * @author neolord
 */
export enum LineDivideForHangul {
  /**
   * 어절
   */
  ByWord = 0,
  /**
   * 글자
   */
  ByLetter = 1,
}

export namespace LineDivideForHangul {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): LineDivideForHangul {
    return (LineDivideForHangul as Record<number, string | undefined>)[value] !== undefined
      ? (value as LineDivideForHangul)
      : LineDivideForHangul.ByWord;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: LineDivideForHangul): number {
    return v;
  }
}
