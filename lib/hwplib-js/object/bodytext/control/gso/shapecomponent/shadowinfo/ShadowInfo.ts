import { Color4Byte } from "../../../../../etc/Color4Byte.js";
import type { ShadowType } from "./ShadowType.js";

/**
 * Shadow information.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.shadowinfo.ShadowInfo`.
 *
 * @author neolord
 */
export class ShadowInfo {
  /**
   * Shadow type
   */
  private type: ShadowType | null = null;
  /**
   * Shadow color
   */
  private color: Color4Byte;
  /**
   * Horizontal offset distance
   */
  private offsetX = 0;
  /**
   * Vertical offset distance
   */
  private offsetY = 0;
  /**
   * Transparency
   */
  private transparent = 0;

  /**
   * Constructor
   */
  public constructor() {
    this.color = new Color4Byte();
  }

  /**
   * Returns the shadow type.
   *
   * @return the shadow type
   */
  public getType(): ShadowType | null {
    return this.type;
  }

  /**
   * Sets the shadow type.
   *
   * @param type the shadow type
   */
  public setType(type: ShadowType): void {
    this.type = type;
  }

  /**
   * Returns the shadow color object.
   *
   * @return the shadow color object
   */
  public getColor(): Color4Byte {
    return this.color;
  }

  /**
   * Returns the horizontal offset distance.
   *
   * @return the horizontal offset distance
   */
  public getOffsetX(): number {
    return this.offsetX;
  }

  /**
   * Sets the horizontal offset distance.
   *
   * @param offsetX the horizontal offset distance
   */
  public setOffsetX(offsetX: number): void {
    this.offsetX = offsetX;
  }

  /**
   * Returns the vertical offset distance.
   *
   * @return the vertical offset distance
   */
  public getOffsetY(): number {
    return this.offsetY;
  }

  /**
   * Sets the vertical offset distance.
   *
   * @param offsetY the vertical offset distance
   */
  public setOffsetY(offsetY: number): void {
    this.offsetY = offsetY;
  }

  /**
   * Returns the transparency.
   *
   * @return the transparency
   */
  public getTransparent(): number {
    return this.transparent;
  }

  /**
   * Sets the transparency.
   *
   * @param transparent the transparency
   */
  public setTransparent(transparent: number): void {
    this.transparent = transparent;
  }

  public copy(from: ShadowInfo): void {
    this.type = from.type;
    this.color.copy(from.color);
    this.offsetX = from.offsetX;
    this.offsetY = from.offsetY;
    this.transparent = from.transparent;
  }
}
