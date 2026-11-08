/**
 * 정렬 방식
 *
 * @author neolord
 */
export enum Alignment {
  /**
   * 양쪽 정렬
   */
  Justify = 0,
  /**
   * 왼쪽 정렬
   */
  Left = 1,
  /**
   * 오른쪽 정렬
   */
  Right = 2,
  /**
   * 가운데 정렬
   */
  Center = 3,
  /**
   * 배분 정렬
   */
  Distribute = 4,
  /**
   * 나눔 정렬
   */
  Divide = 5,
}

export namespace Alignment {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): Alignment {
    return (Alignment as Record<number, string | undefined>)[value] !== undefined
      ? (value as Alignment)
      : Alignment.Justify;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: Alignment): number {
    return v;
  }
}
