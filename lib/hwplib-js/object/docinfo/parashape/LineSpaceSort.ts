/**
 * 줄 간격 종류(한글 2007이하 버전에만 사용)
 *
 * @author neolord
 */
export enum LineSpaceSort {
  /**
   * 글자에 따라(%)
   */
  RatioForLetter = 0,
  /**
   * 고정값
   */
  FixedValue = 1,
  /**
   * 여백만 지정
   */
  OnlyMargin = 2,
  /**
   * 최소
   */
  AtLeast = 3,
}

export namespace LineSpaceSort {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): LineSpaceSort {
    return (LineSpaceSort as Record<number, string | undefined>)[value] !== undefined
      ? (value as LineSpaceSort)
      : LineSpaceSort.RatioForLetter;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: LineSpaceSort): number {
    return v;
  }
}
