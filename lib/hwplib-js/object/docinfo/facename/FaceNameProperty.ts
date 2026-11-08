import { BitFlag } from "../../../util/binary/BitFlag.js";
import { FontType } from "./FontType.js";

/**
 * Property object for a face name (font).
 * Ported from hwplib's `object.docinfo.facename.FaceNameProperty`.
 */
export class FaceNameProperty {
  /** The value stored in the file (unsigned 1 byte) */
  private value: number = 0;

  public constructor() {}

  /** Returns the value stored in the file. */
  public getValue(): number {
    return this.value;
  }

  /** Sets the value stored in the file. */
  public setValue(value: number): void {
    this.value = value;
  }

  /** Returns the font type. (0~1 bit) */
  public getType(): FontType {
    return FontType.valueOf(BitFlag.getRange(this.value, 0, 1));
  }

  /** Sets the font type. (0~1 bit) */
  public setType(type: FontType): void {
    this.value = BitFlag.setRange(this.value, 0, 1, type);
  }

  /** Returns whether a substitute font exists. (0x80) */
  public hasSubstituteFont(): boolean {
    return BitFlag.get(this.value, 7);
  }

  /** Sets whether a substitute font exists. (0x80) */
  public setHasSubstituteFont(hasSubstituteFontInfo: boolean): void {
    this.value = BitFlag.set(this.value, 7, hasSubstituteFontInfo);
  }

  /** Returns whether font type information exists. (0x40) */
  public hasFontInfo(): boolean {
    return BitFlag.get(this.value, 6);
  }

  /** Sets whether font type information exists. (0x40) */
  public setHasFontInfo(hasFontInfo: boolean): void {
    this.value = BitFlag.set(this.value, 6, hasFontInfo);
  }

  /** Returns whether a base font exists. */
  public hasBaseFont(): boolean {
    return BitFlag.get(this.value, 5);
  }

  /** Sets whether a base font exists. */
  public setHasBaseFont(hasBaseFont: boolean): void {
    this.value = BitFlag.set(this.value, 5, hasBaseFont);
  }

  public copy(from: FaceNameProperty): void {
    this.value = from.value;
  }
}
