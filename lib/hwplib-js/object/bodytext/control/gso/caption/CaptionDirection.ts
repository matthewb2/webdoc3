/**
 * 캡션 방향
 *
 * @author neolord
 */
export enum CaptionDirection {
  /**
   * 왼쪽
   */
  Left = 0,
  /**
   * 오른쪽
   */
  Right = 1,
  /**
   * 위쪽
   */
  Top = 2,
  /**
   * 아래쪽
   */
  Bottom = 3,
}

export namespace CaptionDirection {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): CaptionDirection {
    return (CaptionDirection as Record<number, string | undefined>)[value] !== undefined
      ? (value as CaptionDirection)
      : CaptionDirection.Left;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: CaptionDirection): number {
    return v;
  }
}
