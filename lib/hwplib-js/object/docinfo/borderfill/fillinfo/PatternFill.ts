import { Color4Byte } from "../../../etc/Color4Byte.js";
import type { PatternType } from "./PatternType.js";

/**
 * 단색 채우기 객체
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.PatternFill`.
 *
 * @author neolord
 */
export class PatternFill {
  /**
   * 배경색
   */
  private backColor: Color4Byte;
  /**
   * 무늬색
   */
  private patternColor: Color4Byte;
  /**
   * 무늬 종류
   */
  private patternType: PatternType | null = null;

  /**
   * 생성자
   */
  public constructor() {
    this.backColor = new Color4Byte();
    this.patternColor = new Color4Byte();
  }

  /**
   * 배경색 객체를 반환한다.
   *
   * @return 배경색 객체
   */
  public getBackColor(): Color4Byte {
    return this.backColor;
  }

  /**
   * 무늬색 객체를 반환한다.
   *
   * @return 무늬색 객체
   */
  public getPatternColor(): Color4Byte {
    return this.patternColor;
  }

  /**
   * 무늬 종류를 반환한다.
   *
   * @return 무늬 종류
   */
  public getPatternType(): PatternType | null {
    return this.patternType;
  }

  /**
   * 무늬 종류를 설정한다.
   *
   * @param patternType 무늬 종류
   */
  public setPatternType(patternType: PatternType): void {
    this.patternType = patternType;
  }

  public copy(from: PatternFill): void {
    this.backColor.copy(from.backColor);
    this.patternColor.copy(from.patternColor);
    this.patternType = from.patternType;
  }
}
