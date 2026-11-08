/**
 * 번호의 표시 위치
 *
 * @author neolord
 */
export enum NumberPosition {
  /**
   * 쪽 번호 없음
   */
  None = 0,
  /**
   * 왼쪽 위
   */
  LeftTop = 1,
  /**
   * 가운데 위
   */
  CenterTop = 2,
  /**
   * 오른쪽 위
   */
  RightTop = 3,
  /**
   * 왼쪽 아래
   */
  LeftBottom = 4,
  /**
   * 가운데 아래
   */
  CenterBottom = 5,
  /**
   * 오른쪽 아래
   */
  RightBottom = 6,
  /**
   * 바깥쪽 위
   */
  OutsideTop = 7,
  /**
   * 바깥쪽 아래
   */
  OutsideBottom = 8,
  /**
   * 안쪽 위
   */
  InsideTop = 9,
  /**
   * 안쪽 아래
   */
  InsideBottom = 10,
}

export namespace NumberPosition {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): NumberPosition {
    return (NumberPosition as Record<number, string | undefined>)[value] !== undefined
      ? (value as NumberPosition)
      : NumberPosition.None;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: NumberPosition): number {
    return v;
  }
}
