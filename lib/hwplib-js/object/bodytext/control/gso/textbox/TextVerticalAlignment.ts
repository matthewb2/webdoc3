/**
 * 텍스트 세로 정렬 방법
 *
 * @author neolord
 */
export enum TextVerticalAlignment {
  /**
   * 위쪽
   */
  Top = 0,
  /**
   * 가운데
   */
  Center = 1,
  /**
   * 아래쪽
   */
  Bottom = 2,
}

export namespace TextVerticalAlignment {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): TextVerticalAlignment {
    return (TextVerticalAlignment as Record<number, string | undefined>)[value] !== undefined
      ? (value as TextVerticalAlignment)
      : TextVerticalAlignment.Top;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: TextVerticalAlignment): number {
    return v;
  }
}
