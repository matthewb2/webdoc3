import type { ColorEffectSort } from "./ColorEffectSort.js";

/**
 * Color effect property.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.ColorEffect`.
 *
 * @author neolord
 */
export class ColorEffect {
  /**
   * Kind of color effect (no information)
   */
  private sort: ColorEffectSort | null = null;
  /**
   * Color effect value
   */
  private value = 0;

  /**
   * Constructor
   */
  public constructor() {}

  /**
   * Returns the kind of color effect.
   *
   * @return the kind of color effect
   */
  public getSort(): ColorEffectSort | null {
    return this.sort;
  }

  /**
   * Sets the kind of color effect.
   *
   * @param sort the kind of color effect
   */
  public setSort(sort: ColorEffectSort): void {
    this.sort = sort;
  }

  /**
   * Returns the color effect value.
   *
   * @return the color effect value
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Sets the color effect value.
   *
   * @param value the color effect value
   */
  public setValue(value: number): void {
    this.value = value;
  }

  public clone(): ColorEffect {
    const cloned: ColorEffect = new ColorEffect();
    cloned.sort = this.sort;
    cloned.value = this.value;
    return cloned;
  }
}
