/**
 * 단 종류
 *
 * @author neolord
 */
export enum ColumnSort {
  /**
   * 일반 다단
   */
  Normal = 0,
  /**
   * 배분 다단
   */
  Distribution = 1,
  /**
   * 평행 다단
   */
  Parallel = 2,
}

export namespace ColumnSort {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): ColumnSort {
    return (ColumnSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as ColumnSort)
      : ColumnSort.Normal;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: ColumnSort): number {
    return v;
  }
}
