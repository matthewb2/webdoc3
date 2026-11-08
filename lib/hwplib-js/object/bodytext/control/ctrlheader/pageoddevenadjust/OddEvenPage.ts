export enum OddEvenPage {
  /**
   * 양쪽
   */
  Both = 0,
  /**
   * 짝수
   */
  Even = 1,
  /**
   * 홀수
   */
  Odd = 2,
}

export namespace OddEvenPage {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): OddEvenPage {
    return (OddEvenPage as Record<number, string | undefined>)[value] !== undefined
      ? (value as OddEvenPage)
      : OddEvenPage.Both;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: OddEvenPage): number {
    return v;
  }
}
