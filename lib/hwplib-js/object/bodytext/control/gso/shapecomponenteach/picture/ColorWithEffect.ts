import { ColorEffect } from "./ColorEffect.js";

/**
 * Color that contains color effects.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.ColorWithEffect`.
 *
 * @author neolord
 */
export class ColorWithEffect {
  /**
   * Color type (no information)
   */
  private type = 0;
  /**
   * Color value according to the type (no information)
   */
  private color: Uint8Array | null = null;
  /**
   * List of color effects
   */
  private colorEffectList: ColorEffect[];

  /**
   * Constructor
   */
  public constructor() {
    this.colorEffectList = [];
  }

  /**
   * Returns the color type. (no information)
   *
   * @return the color type
   */
  public getType(): number {
    return this.type;
  }

  /**
   * Sets the color type. (no information)
   *
   * @param type the color type
   */
  public setType(type: number): void {
    this.type = type;
  }

  /**
   * Returns the color value according to the type. (no information)
   *
   * @return the color value according to the type
   */
  public getColor(): Uint8Array | null {
    return this.color;
  }

  /**
   * Sets the color value according to the type.
   *
   * @param color the color value according to the type
   */
  public setColor(color: Uint8Array): void {
    this.color = color;
  }

  /**
   * Creates a new color effect object and adds it to the list.
   *
   * @return the newly created color effect object
   */
  public addNewColorEffect(): ColorEffect {
    const ce: ColorEffect = new ColorEffect();
    this.colorEffectList.push(ce);
    return ce;
  }

  /**
   * Returns the list of color effects.
   *
   * @return the list of color effects
   */
  public getColorEffectList(): ColorEffect[] {
    return this.colorEffectList;
  }

  public copy(from: ColorWithEffect): void {
    this.type = from.type;
    this.color = from.color!.slice();

    this.colorEffectList.length = 0;
    for (const colorEffect of from.colorEffectList) {
      this.colorEffectList.push(colorEffect.clone());
    }
  }
}
