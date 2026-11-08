/**
 * 밑줄 종류
 *
 * @author neolord
 */
export enum UnderLineSort {
  /**
   * 없음
   */
  None = 0,
  /**
   * 글자 아래
   */
  Bottom = 1,
  /**
   * 글자 위
   */
  Top = 3,
}

export namespace UnderLineSort {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): UnderLineSort {
    return (UnderLineSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as UnderLineSort)
      : UnderLineSort.None;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: UnderLineSort): number {
    return v;
  }
}
