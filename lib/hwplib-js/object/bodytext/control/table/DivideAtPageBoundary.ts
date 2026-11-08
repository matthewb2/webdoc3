/**
 * 쪽 경계에서 나눔 방법
 *
 * @author neolord
 */
export enum DivideAtPageBoundary {
  /**
   * 나누지 않음
   */
  NoDivide = 0,
  /**
   * 셀 단위로 나눔
   */
  DivideByCell = 1,
  /**
   * 나눔
   */
  Divide = 2,
}

export namespace DivideAtPageBoundary {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): DivideAtPageBoundary {
    return (DivideAtPageBoundary as Record<number, string | undefined>)[value] !== undefined
      ? (value as DivideAtPageBoundary)
      : DivideAtPageBoundary.NoDivide;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: DivideAtPageBoundary): number {
    return v;
  }
}
