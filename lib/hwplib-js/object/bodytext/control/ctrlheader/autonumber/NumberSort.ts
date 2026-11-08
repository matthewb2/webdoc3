/**
 * 번호 종류
 *
 * @author neolord
 */
export enum NumberSort {
  /**
   * 쪽 번호
   */
  Page = 0,
  /**
   * 각주 번호
   */
  FootNote = 1,
  /**
   * 미주 번호
   */
  EndNote = 2,
  /**
   * 그림 번호
   */
  Picture = 3,
  /**
   * 표 번호
   */
  Table = 4,
  /**
   * 수식 번호
   */
  Equation = 5,
}

export namespace NumberSort {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): NumberSort {
    return (NumberSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as NumberSort)
      : NumberSort.Page;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: NumberSort): number {
    return v;
  }
}
