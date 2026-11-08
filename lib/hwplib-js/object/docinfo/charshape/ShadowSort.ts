/**
 * 그림자 종류
 *
 * @author neolord
 */
export enum ShadowSort {
  /**
   * 없음
   */
  None = 0,
  /**
   * 비연속
   */
  Discontinuous = 1,
  /**
   * 연속
   */
  Continuous = 2,
}

export namespace ShadowSort {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): ShadowSort {
    return (ShadowSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as ShadowSort)
      : ShadowSort.None;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: ShadowSort): number {
    return v;
  }
}
