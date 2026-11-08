/**
 * 오브젝트 폭의 기준
 *
 * @author neolord
 */
export enum WidthCriterion {
  /**
   * 종이
   */
  Paper = 0,
  /**
   * 쪽
   */
  Page = 1,
  /**
   * 단
   */
  Column = 2,
  /**
   * 문단
   */
  Para = 3,
  /**
   * 절대값
   */
  Absolute = 4,
}

export namespace WidthCriterion {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): WidthCriterion {
    return (WidthCriterion as Record<number, string | undefined>)[value] !== undefined
      ? (value as WidthCriterion)
      : WidthCriterion.Paper;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: WidthCriterion): number {
    return v;
  }
}
