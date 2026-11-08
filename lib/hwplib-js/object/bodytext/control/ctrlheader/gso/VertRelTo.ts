/**
 * 세로 위치의 기준
 *
 * @author neolord
 */
export enum VertRelTo {
  /**
   * 종이
   */
  Paper = 0,
  /**
   * 쪽
   */
  Page = 1,
  /**
   * 문단
   */
  Para = 2,
}

export namespace VertRelTo {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): VertRelTo {
    return (VertRelTo as Record<number, string | undefined>)[value] !== undefined
      ? (value as VertRelTo)
      : VertRelTo.Paper;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: VertRelTo): number {
    return v;
  }
}
