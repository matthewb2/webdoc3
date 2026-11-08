/**
 * 외곽선 종류
 *
 * @author neolord
 */
export enum OutterLineSort {
  /**
   * 없음
   */
  None = 0,
  /**
   * 실선
   */
  Solid = 1,
  /**
   * 점선
   */
  Dot = 2,
  /**
   * 굵은 실선(두꺼운 선)
   */
  BoldSolid = 3,
  /**
   * 쇄선(긴 점선)
   */
  Dash = 4,
  /**
   * 일점쇄선 (-.-.-.-.)
   */
  DashDot = 5,
  /**
   * 이점쇄선 (-..-..-..)
   */
  DashDotDot = 6,
}

export namespace OutterLineSort {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): OutterLineSort {
    return (OutterLineSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as OutterLineSort)
      : OutterLineSort.None;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: OutterLineSort): number {
    return v;
  }
}
