/**
 * 덧말의 위치
 *
 * @author neolord
 */
export enum AdditionalTextPosition {
  /**
   * 위
   */
  Top = 0,
  /**
   * 아래
   */
  Bottom = 1,
  /**
   * 가운데
   */
  Center = 2,
}

export namespace AdditionalTextPosition {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): AdditionalTextPosition {
    return (AdditionalTextPosition as Record<number, string | undefined>)[value] !== undefined
      ? (value as AdditionalTextPosition)
      : AdditionalTextPosition.Top;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: AdditionalTextPosition): number {
    return v;
  }
}
