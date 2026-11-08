import { Color4Byte } from "../../etc/Color4Byte.js";
import type { BorderType } from "./BorderType.js";
import type { BorderThickness } from "./BorderThickness.js";

/**
 * 테두리/배경 객체에서 4방향의 각각의 선을 나타내는 객체
 * Ported from hwplib's `object.docinfo.borderfill.EachBorder`.
 *
 * @author neolord
 */
export class EachBorder {
  /**
   * 선 종류
   */
  private type: BorderType | null = null;
  /**
   * 두께
   */
  private thickness: BorderThickness | null = null;
  /**
   * 색상
   */
  private color: Color4Byte;

  /**
   * 생성자
   */
  public constructor() {
    this.color = new Color4Byte();
  }

  /**
   * 선의 종류를 반환한다.
   *
   * @return 선의 종류
   */
  public getType(): BorderType | null {
    return this.type;
  }

  /**
   * 선의 종류를 설정한다.
   *
   * @param type 선의 종류
   */
  public setType(type: BorderType): void {
    this.type = type;
  }

  /**
   * 선의 두께를 반환한다.
   *
   * @return 선의 두께
   */
  public getThickness(): BorderThickness | null {
    return this.thickness;
  }

  /**
   * 선의 두께를 설정한다.
   *
   * @param thickness 선의 두께
   */
  public setThickness(thickness: BorderThickness): void {
    this.thickness = thickness;
  }

  /**
   * 선의 색상 객체을 반환한다.
   *
   * @return 선의 색상 객체
   */
  public getColor(): Color4Byte {
    return this.color;
  }

  public copy(from: EachBorder): void {
    this.type = from.type;
    this.thickness = from.thickness;
    this.color.copy(from.color);
  }
}
