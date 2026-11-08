import { BorderType } from "../borderfill/BorderType.js";

/**
 * 문자선(밑줄 or 취소선) 종류
 *
 * @author neolord
 */
export enum BorderType2 {
  /**
   * 실선
   */
  Solid = 0,
  /**
   * 긴 점선 (쇄선)
   */
  Dash = 1,
  /**
   * 점선
   */
  Dot = 2,
  /**
   * -.-.-.-.(일점 쇄선)
   */
  DashDot = 3,
  /**
   * -..-..-..(이점 쇄선)
   */
  DashDotDot = 4,
  /**
   * Dash보다 긴 선분의 반복
   */
  LongDash = 5,
  /**
   * Dot보다 큰 동그라미의 반복
   */
  CircleDot = 6,
  /**
   * 2중선
   */
  Double = 7,
  /**
   * 가는선 + 굵은선 2중선
   */
  ThinThick = 8,
  /**
   * 굵은선 + 가는선 2중선
   */
  ThickThin = 9,
  /**
   * 가는선 + 굵은선 + 가는선 3중선
   */
  ThinThickThin = 10,
  /**
   * 물결
   */
  Wave = 11,
  /**
   * 물결 2중선
   */
  DoubleWave = 12,
  /**
   * 두꺼운 3D
   */
  Thick3D = 13,
  /**
   * 두꺼운 3D(광원 반대)
   */
  Thick3DReverseLighting = 14,
  /**
   * 3D 단선
   */
  Solid3D = 15,
  /**
   * 3D 단선(광원 반대)
   */
  Solid3DReverseLighting = 16,
}

export namespace BorderType2 {
  /**
   * 파일에 저장되는 정수값에 해당되는 enum 값을 반환한다.
   *
   * @param value 파일에 저장되는 정수값
   * @return enum 값
   */
  export function valueOf(value: number): BorderType2 {
    return (BorderType2 as Record<number, string | undefined>)[value] !== undefined
      ? (value as BorderType2)
      : BorderType2.Solid;
  }

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  export function getValue(v: BorderType2): number {
    return v;
  }

  export function toBorderType(v: BorderType2): BorderType {
    switch (v) {
      case BorderType2.Solid:
        return BorderType.Solid;
      case BorderType2.Dash:
        return BorderType.Dash;
      case BorderType2.Dot:
        return BorderType.Dot;
      case BorderType2.DashDot:
        return BorderType.DashDot;
      case BorderType2.DashDotDot:
        return BorderType.DashDotDot;
      case BorderType2.LongDash:
        return BorderType.LongDash;
      case BorderType2.CircleDot:
        return BorderType.CircleDot;
      case BorderType2.Double:
        return BorderType.Double;
      case BorderType2.ThinThick:
        return BorderType.ThinThick;
      case BorderType2.ThickThin:
        return BorderType.ThickThin;
      case BorderType2.ThinThickThin:
        return BorderType.ThinThickThin;
      case BorderType2.Wave:
        return BorderType.Wave;
      case BorderType2.DoubleWave:
        return BorderType.DoubleWave;
      case BorderType2.Thick3D:
        return BorderType.Thick3D;
      case BorderType2.Thick3DReverseLighting:
        return BorderType.Thick3DReverseLighting;
      case BorderType2.Solid3D:
        return BorderType.Solid3D;
      case BorderType2.Solid3DReverseLighting:
        return BorderType.Solid3DReverseLighting;
    }
    return BorderType.None;
  }
}
