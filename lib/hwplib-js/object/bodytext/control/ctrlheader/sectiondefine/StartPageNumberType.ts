/**
 * 사작 쪽번호 타입
 */
export enum StartPageNumberType {
  /**
   * 이어서
   */
  Continue = 0,
  /**
   * 짝수
   */
  Even = 1,
  /**
   * 홀수
   */
  Odd = 2,
  /**
   * 사용자 정의
   */
  Custom = 3,
}

export namespace StartPageNumberType {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): StartPageNumberType {
    return (StartPageNumberType as Record<number, string | undefined>)[value] !== undefined
      ? (value as StartPageNumberType)
      : StartPageNumberType.Continue;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: StartPageNumberType): number {
    return v;
  }
}
