import { BitFlag } from "../../../../../../util/binary/BitFlag.js";

/**
 * Object representing the property of a picture effect.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.PictureEffectProperty`.
 *
 * @author neolord
 */
export class PictureEffectProperty {
  /**
   * The integer value stored in the file (unsigned 4 byte)
   */
  private value = 0;

  /**
   * Constructor
   */
  public constructor() {}

  /**
   * Returns the integer value stored in the file.
   *
   * @return the integer value stored in the file
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Sets the integer value stored in the file.
   *
   * @param value the integer value stored in the file
   */
  public setValue(value: number): void {
    this.value = value;
  }

  /**
   * Returns whether there is a shadow effect. (0 bit)
   *
   * @return whether there is a shadow effect
   */
  public hasShadowEffect(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * Sets whether there is a shadow effect. (0 bit)
   *
   * @param hasShadowEffect whether there is a shadow effect
   */
  public setHasShadowEffect(hasShadowEffect: boolean): void {
    this.value = BitFlag.set(this.value, 0, hasShadowEffect);
  }

  /**
   * Returns whether there is a neon effect. (1 bit)
   *
   * @return whether there is a neon effect
   */
  public hasNeonEffect(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * Sets whether there is a neon effect. (1 bit)
   *
   * @param hasNeonEffect whether there is a neon effect
   */
  public setHasNeonEffect(hasNeonEffect: boolean): void {
    this.value = BitFlag.set(this.value, 1, hasNeonEffect);
  }

  /**
   * Returns whether there is a soft border effect. (2 bit)
   *
   * @return whether there is a soft border effect
   */
  public hasSoftBorderEffect(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * Sets whether there is a soft border effect. (2 bit)
   *
   * @param hasSoftBorderEffect whether there is a soft border effect
   */
  public setHasSoftBorderEffect(hasSoftBorderEffect: boolean): void {
    this.value = BitFlag.set(this.value, 2, hasSoftBorderEffect);
  }

  /**
   * Returns whether there is a reflection effect. (3 bit)
   *
   * @return whether there is a reflection effect
   */
  public hasReflectionEffect(): boolean {
    return BitFlag.get(this.value, 3);
  }

  /**
   * Sets whether there is a reflection effect. (3 bit)
   *
   * @param hasReflectionEffect whether there is a reflection effect
   */
  public setHasReflectionEffect(hasReflectionEffect: boolean): void {
    this.value = BitFlag.set(this.value, 3, hasReflectionEffect);
  }

  public copy(from: PictureEffectProperty): void {
    this.value = from.value;
  }
}
