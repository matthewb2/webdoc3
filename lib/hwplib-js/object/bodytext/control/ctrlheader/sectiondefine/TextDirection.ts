/**
 * 텍스트 진행방향
 *
 * @author neolord
 */
export enum TextDirection {
  /**
   * 가로
   */
  Horizontal = 0,
  /**
   * 세로(영어 눕힘)
   */
  VerticalWithEnglishLayDown = 1,
  /**
   * 세로(영어 세움)
   */
  VerticalWithEnglishStanding = 2,
}

export namespace TextDirection {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): TextDirection {
    return (TextDirection as Record<number, string | undefined>)[value] !== undefined
      ? (value as TextDirection)
      : TextDirection.Horizontal;
  }
  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: TextDirection): number {
    return v;
  }
}
