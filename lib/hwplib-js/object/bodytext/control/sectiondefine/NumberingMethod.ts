/**
 * 번호매김 방법
 * Ported from hwplib's `object.bodytext.control.sectiondefine.NumberingMethod`.
 *
 * @author neolord
 */
export enum NumberingMethod {
  /** 앞 구역에 이어서 */
  Continue = 0,
  /** 현재 구역부터 새로 시작 */
  Restart = 1,
  /** 쪽마다 새로 시작(각주 전용) */
  RestartAtEachPage = 2,
}

export namespace NumberingMethod {
  /** Java valueOf(byte): the matching constant, or the default (Continue) when unknown. */
  export function valueOf(value: number): NumberingMethod {
    return (NumberingMethod as Record<number, string | undefined>)[value] !== undefined
      ? (value as NumberingMethod)
      : NumberingMethod.Continue;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: NumberingMethod): number {
    return v;
  }
}
