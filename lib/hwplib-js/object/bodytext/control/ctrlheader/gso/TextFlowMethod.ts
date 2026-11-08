/**
 * 오브젝트 주위를 텍스트가 어떻게 흘러갈지 지정하는 옵션
 *
 * @author neolord
 */
export enum TextFlowMethod {
  /**
   * 어울림
   */
  FitWithText = 0,
  /**
   * 자리 차치
   */
  TakePlace = 1,
  /**
   * 글 뒤로
   */
  BehindText = 2,
  /**
   * 글 앞으로
   */
  InFrontOfText = 3,
}

export namespace TextFlowMethod {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): TextFlowMethod {
    return (TextFlowMethod as Record<number, string | undefined>)[value] !== undefined
      ? (value as TextFlowMethod)
      : TextFlowMethod.FitWithText;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: TextFlowMethod): number {
    return v;
  }
}
