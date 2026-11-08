/**
 * 머리글/꼬리글 적용 페이지 종류
 *
 * @author neolord
 */
export enum HeaderFooterApplyPage {
  /**
   * 양 쪽
   */
  BothPage = 0,
  /**
   * 짝수 쪽만
   */
  EvenPage = 1,
  /**
   * 홀수 족만
   */
  OddPage = 2,
}

export namespace HeaderFooterApplyPage {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): HeaderFooterApplyPage {
    return (HeaderFooterApplyPage as Record<number, string | undefined>)[value] !== undefined
      ? (value as HeaderFooterApplyPage)
      : HeaderFooterApplyPage.BothPage;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: HeaderFooterApplyPage): number {
    return v;
  }
}
