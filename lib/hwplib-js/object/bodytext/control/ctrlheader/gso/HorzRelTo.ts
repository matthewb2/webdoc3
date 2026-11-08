/**
 * 가로 위치의 기준
 *
 * @author neolord
 */
export enum HorzRelTo {
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
}

export namespace HorzRelTo {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): HorzRelTo {
    return (HorzRelTo as Record<number, string | undefined>)[value] !== undefined
      ? (value as HorzRelTo)
      : HorzRelTo.Paper;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: HorzRelTo): number {
    return v;
  }
}
