import { BitFlag } from "../../../util/binary/BitFlag.js";
import { StyleSort } from "./StyleSort.js";

/**
 * Property object of a style.
 * Ported from hwplib's `object.docinfo.style.StyleProperty`.
 */
export class StyleProperty {
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

  /** Returns the style sort. (0~2 bit) */
  public getStyleSort(): StyleSort {
    return StyleSort.valueOf(BitFlag.getRange(this.value, 0, 2));
  }

  /** Sets the style sort. (0~2 bit) */
  public setStyleSort(styleSort: StyleSort): void {
    this.value = BitFlag.setRange(this.value, 0, 2, styleSort);
  }

  public copy(from: StyleProperty): void {
    this.value = from.value;
  }
}
