/**
 * 상대적인 배열 방식
 *
 * @author neolord
 */
export enum RelativeArrange {
  /**
   * VerRelTo이 ‘paper’나 ‘page’ 이면 top, 그렇지 않으면 left
   */
  TopOrLeft = 0,
  /**
   * VerRelTo이 ‘paper’나 ‘page’ 이면 center
   */
  Center = 1,
  /**
   * VerRelTo이 ‘paper’나 ‘page’ 이면 bottom, 그렇지 않으면 right
   */
  BottomOrRight = 2,
  /**
   * VerRelTo이 ‘paper’나 ‘page’ 이면 inside
   */
  Inside = 3,
  /**
   * VerRelTo이 ‘paper’나 ‘page’ 이면 outsides
   */
  Outside = 4,
}

export namespace RelativeArrange {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): RelativeArrange {
    return (RelativeArrange as Record<number, string | undefined>)[value] !== undefined
      ? (value as RelativeArrange)
      : RelativeArrange.TopOrLeft;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: RelativeArrange): number {
    return v;
  }
}
