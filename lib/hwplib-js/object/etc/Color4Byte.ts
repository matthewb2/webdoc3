import { BitFlag } from "../../util/binary/BitFlag.js";

/**
 * 4-byte color object, ported from hwplib's `object.etc.Color4Byte`.
 * Corresponds to the Windows API COLORREF value.
 */
export class Color4Byte {
  /**
   * Stores the unsigned 4-byte color value.
   */
  private value = 0;

  constructor(r?: number, g?: number, b?: number, a?: number) {
    if (r !== undefined && g !== undefined && b !== undefined) {
      this.setR(r);
      this.setG(g);
      this.setB(b);
      this.setA(a !== undefined ? a : 0);
    }
  }

  /**
   * Returns the unsigned 4-byte color value.
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Sets the unsigned 4-byte color value (the COLORREF value in the Windows API).
   */
  setValue(value: number): void {
    this.value = value;
  }

  /**
   * Returns the color's red value (0~255).
   */
  getR(): number {
    return BitFlag.getRange(this.value, 0, 7);
  }

  /**
   * Sets the color's red value (0~255).
   */
  setR(r: number): void {
    this.value = BitFlag.setRange(this.value, 0, 7, r);
  }

  /**
   * Returns the color's green value (0~255).
   */
  getG(): number {
    return BitFlag.getRange(this.value, 8, 15);
  }

  /**
   * Sets the color's green value (0~255).
   */
  setG(g: number): void {
    this.value = BitFlag.setRange(this.value, 8, 15, g);
  }

  /**
   * Returns the color's blue value (0~255).
   */
  getB(): number {
    return BitFlag.getRange(this.value, 16, 23);
  }

  /**
   * Sets the color's blue value (0~255).
   */
  setB(b: number): void {
    this.value = BitFlag.setRange(this.value, 16, 23, b);
  }

  /**
   * Returns the color's alpha value (0~255).
   */
  getA(): number {
    return BitFlag.getRange(this.value, 24, 31);
  }

  /**
   * Sets the color's alpha value (0~255).
   */
  setA(a: number): void {
    this.value = BitFlag.setRange(this.value, 24, 31, a);
  }

  clone(): Color4Byte {
    const cloned = new Color4Byte();
    cloned.copy(this);
    return cloned;
  }

  copy(from: Color4Byte): void {
    this.value = from.value;
  }
}
