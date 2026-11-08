import { BitFlag } from "../../../util/binary/BitFlag.js";

/**
 * Property object of a tab definition.
 * Ported from hwplib's `object.docinfo.tabdef.TabDefProperty`.
 */
export class TabDefProperty {
  /** The value stored in the file (unsigned 4 byte) */
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

  /** Returns whether there is an auto tab at the paragraph left end (auto tab for hanging indent). (0 bit) */
  public isAutoTabAtParagraphLeftEnd(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /** Sets whether there is an auto tab at the paragraph left end (auto tab for hanging indent). (0 bit) */
  public setAutoTabAtParagraphLeftEnd(autoTabAtParagraphLeftEnd: boolean): void {
    this.value = BitFlag.set(this.value, 0, autoTabAtParagraphLeftEnd);
  }

  /** Returns whether there is an auto tab at the paragraph right end. (1 bit) */
  public isAutoTabAtParagraphRightEnd(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /** Sets whether there is an auto tab at the paragraph right end. (1 bit) */
  public setAutoTabAtParagraphRightEnd(autoTabAtParagraphRightEnd: boolean): void {
    this.value = BitFlag.set(this.value, 1, autoTabAtParagraphRightEnd);
  }

  public copy(from: TabDefProperty): void {
    this.value = from.value;
  }
}
