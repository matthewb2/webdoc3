/**
 * 문단의 줄바꿈 방법
 *
 * @author neolord
 */
export enum LineChange {
  /**
   * 일반적인 줄바꿈
   */
  Normal = 0,
  /**
   * 자간을 조종하여 한 줄을 유지
   */
  KeepOneLineByAdjustWordSpace = 1,
  /**
   * 내용에 따라 폭이 늘어남
   */
  IncreaseWidthByContent = 2,
}

export namespace LineChange {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): LineChange {
    return (LineChange as Record<number, string | undefined>)[value] !== undefined
      ? (value as LineChange)
      : LineChange.Normal;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: LineChange): number {
    return v;
  }
}
