/**
 * 오브젝트의 좌/우 어느 쪽에 글을 배치할지 지정하는 옵션
 *
 * @author neolord
 */
export enum TextHorzArrange {
  /**
   * 양쪽
   */
  BothSides = 0,
  /**
   * 왼쪽
   */
  LeftOnly = 1,
  /**
   * 오른쪽
   */
  RightOnly = 2,
  /**
   * 큰 쪽
   */
  LargestOnly = 3,
}

export namespace TextHorzArrange {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): TextHorzArrange {
    return (TextHorzArrange as Record<number, string | undefined>)[value] !== undefined
      ? (value as TextHorzArrange)
      : TextHorzArrange.BothSides;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: TextHorzArrange): number {
    return v;
  }
}
