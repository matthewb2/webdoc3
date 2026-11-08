/**
 * 줄 나눔 기준 영어 단위
 *
 * @author neolord
 */
export enum LineDivideForEnglish {
  /**
   * 단어
   */
  ByWord = 0,
  /**
   * 하이픈
   */
  ByHypen = 1,
  /**
   * 글자
   */
  ByLetter = 2,
}

export namespace LineDivideForEnglish {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): LineDivideForEnglish {
    return (LineDivideForEnglish as Record<number, string | undefined>)[value] !== undefined
      ? (value as LineDivideForEnglish)
      : LineDivideForEnglish.ByWord;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: LineDivideForEnglish): number {
    return v;
  }
}
