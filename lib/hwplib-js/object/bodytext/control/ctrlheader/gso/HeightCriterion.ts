/**
 * 오브젝트 높이의 기준
 *
 * @author neolord
 */
export enum HeightCriterion {
  /**
   * 종이
   */
  Paper = 0,
  /**
   * 쪽
   */
  Page = 1,
  /**
   * 절대값
   */
  Absolute = 2,
}

export namespace HeightCriterion {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): HeightCriterion {
    return (HeightCriterion as Record<number, string | undefined>)[value] !== undefined
      ? (value as HeightCriterion)
      : HeightCriterion.Paper;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: HeightCriterion): number {
    return v;
  }
}
