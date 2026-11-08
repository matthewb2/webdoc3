/**
 * 단 방향
 *
 * @author neolord
 */
export enum ColumnDirection {
  /**
   * 왼쪽부터
   */
  FromLeft = 0,
  /**
   * 오른쪽부터
   */
  FromRight = 1,
  /**
   * 맞쪽
   */
  Both = 2,
}

export namespace ColumnDirection {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): ColumnDirection {
    return (ColumnDirection as Record<number, string | undefined>)[value] !== undefined
      ? (value as ColumnDirection)
      : ColumnDirection.FromLeft;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: ColumnDirection): number {
    return v;
  }
}
