/**
 * 개체가 속하는 번호 범주
 *
 * @author neolord
 */
export enum ObjectNumberSort {
  /**
   * 없음
   */
  None = 0,
  /**
   * 그림
   */
  Figure = 1,
  /**
   * 표
   */
  Table = 2,
  /**
   * 수식
   */
  Equation = 3,
}

export namespace ObjectNumberSort {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): ObjectNumberSort {
    return (ObjectNumberSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as ObjectNumberSort)
      : ObjectNumberSort.None;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: ObjectNumberSort): number {
    return v;
  }
}
