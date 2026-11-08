import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * Object representing the property of the object common attribute.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.ShapeComponentProperty`.
 *
 * @author neolord
 */
export class ShapeComponentProperty {
  /**
   * The integer value stored in the file (unsigned 4 byte).
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

  public setValue(value: number): void {
    this.value = value;
  }

  /**
   * Returns whether the object is flipped horizontally. (0 bit)
   * @return whether flipped horizontally
   */
  public isFlipHorizontal(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * Sets whether the object is flipped horizontally. (0 bit)
   * @param flipHorizontal whether flipped horizontally
   */
  public setFlipHorizontal(flipHorizontal: boolean): void {
    this.value = BitFlag.set(this.value, 0, flipHorizontal);
  }

  /**
   * Returns whether the object is flipped vertically. (1 bit)
   * @return whether flipped vertically
   */
  public isFlipVertical(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * Sets whether the object is flipped vertically. (1 bit)
   * @param flipVertical whether flipped vertically
   */
  public setFlipVertical(flipVertical: boolean): void {
    this.value = BitFlag.set(this.value, 1, flipVertical);
  }

  /**
   * Returns whether the object rotates together with the image. (19 bit)
   * @return whether it rotates together with the image
   */
  public isRotateWithImage(): boolean {
    return BitFlag.get(this.value, 19);
  }

  /**
   * Sets whether the object rotates together with the image. (19 bit)
   * @param rotateWithImage whether the object rotates together with the image
   */
  public setRotateWithImage(rotateWithImage: boolean): void {
    this.value = BitFlag.set(this.value, 19, rotateWithImage);
  }

  /**
   * Returns whether the picture object's color is reversed. (24 bit)
   * @return whether the picture object's color is reversed
   */
  public isReverseColor(): boolean {
    return BitFlag.get(this.value, 24);
  }

  /**
   * Sets whether the picture object's color is reversed. (24 bit)
   * @param reverseColor whether the picture object's color is reversed
   */
  public setReverseColor(reverseColor: boolean): void {
    this.value = BitFlag.set(this.value, 24, reverseColor);
  }
}
