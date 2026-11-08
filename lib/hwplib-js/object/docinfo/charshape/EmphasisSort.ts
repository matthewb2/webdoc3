/**
 * 강조점 종류
 *
 * @author neolord
 */
export enum EmphasisSort {
  /**
   * 없음
   */
  None = 0,
  DotAbove = 1,
  RingAbove = 2,
  Tilde = 3,
  Caron = 4,
  Side = 5,
  Colon = 6,
  GraveAccent = 7,
  AcuteAccent = 8,
  Circumflex = 9,
  Macron = 10,
  HookAbove = 11,
  DotBelow = 12,
}

export namespace EmphasisSort {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): EmphasisSort {
    return (EmphasisSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as EmphasisSort)
      : EmphasisSort.None;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: EmphasisSort): number {
    return v;
  }
}
