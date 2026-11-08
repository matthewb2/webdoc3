/**
 * 세로 정렬
 *
 * @author neolord
 */
export enum VerticalAlignment {
  /**
   * 글꼴기준
   */
  ByFont = 0,
  /**
   * 위쪽
   */
  Top = 1,
  /**
   * 가운데
   */
  Center = 2,
  /**
   * 아래
   */
  Bottom = 3,
}

export namespace VerticalAlignment {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): VerticalAlignment {
    return (VerticalAlignment as Record<number, string | undefined>)[value] !== undefined
      ? (value as VerticalAlignment)
      : VerticalAlignment.ByFont;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: VerticalAlignment): number {
    return v;
  }
}
