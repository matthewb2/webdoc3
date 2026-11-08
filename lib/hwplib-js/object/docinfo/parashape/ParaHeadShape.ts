/**
 * 문단 머리 모양의 종류
 *
 * @author neolord
 */
export enum ParaHeadShape {
  /**
   * 없음
   */
  None = 0,
  /**
   * 개요
   */
  Outline = 1,
  /**
   * 번호
   */
  Numbering = 2,
  /**
   * 글머리표(bullet)
   */
  Bullet = 3,
}

export namespace ParaHeadShape {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): ParaHeadShape {
    return (ParaHeadShape as Record<number, string | undefined>)[value] !== undefined
      ? (value as ParaHeadShape)
      : ParaHeadShape.None;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: ParaHeadShape): number {
    return v;
  }
}
