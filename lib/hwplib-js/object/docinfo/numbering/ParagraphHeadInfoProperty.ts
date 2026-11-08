import { BitFlag } from "../../../util/binary/BitFlag.js";
import { ParagraphAlignment } from "./ParagraphAlignment.js";
import { ValueType } from "./ValueType.js";
import { ParagraphNumberFormat } from "./ParagraphNumberFormat.js";

/**
 * Property object of paragraph head information.
 * Ported from hwplib's `object.docinfo.numbering.ParagraphHeadInfoProperty`.
 */
export class ParagraphHeadInfoProperty {
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

  /** Returns the paragraph alignment kind. (0~1 bit) */
  public getParagraphAlignment(): ParagraphAlignment {
    return ParagraphAlignment.valueOf(BitFlag.getRange(this.value, 0, 1));
  }

  /** Sets the paragraph alignment kind. (0~1 bit) */
  public setParagraphAlignment(paragraphAlignment: ParagraphAlignment): void {
    this.value = BitFlag.setRange(this.value, 0, 1, paragraphAlignment);
  }

  /** Returns whether the number width follows the actual instance string width. (2 bit) */
  public isFollowStringWidth(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /** Sets whether the number width follows the actual instance string width. (2 bit) */
  public setFollowStringWidth(followStringWidth: boolean): void {
    this.value = BitFlag.set(this.value, 2, followStringWidth);
  }

  /** Returns whether auto hanging indent is used. (3 bit) */
  public isAutoIndent(): boolean {
    return BitFlag.get(this.value, 3);
  }

  /** Sets whether auto hanging indent is used. (3 bit) */
  public setAutoIndent(autoIndent: boolean): void {
    this.value = BitFlag.set(this.value, 3, autoIndent);
  }

  /** Returns the kind of the per-level distance-from-body value. (4 bit) */
  public getValueTypeForDistanceFromBody(): ValueType {
    if (BitFlag.get(this.value, 4) === false) {
      return ValueType.RatioForLetter;
    } else {
      return ValueType.Value;
    }
  }

  /** Sets the kind of the per-level distance-from-body value. (4 bit) */
  public setValueTypeForDistanceFromBody(valueType: ValueType): void {
    if (valueType === ValueType.RatioForLetter) {
      this.value = BitFlag.set(this.value, 4, false);
    } else {
      this.value = BitFlag.set(this.value, 4, true);
    }
  }

  /** Returns the paragraph number format. (5~9 bit) */
  public getParagraphNumberFormat(): ParagraphNumberFormat {
    return ParagraphNumberFormat.valueOf(BitFlag.getRange(this.value, 5, 9));
  }

  public setParagraphNumberFormat(paragraphNumberFormat: ParagraphNumberFormat): void {
    this.value = BitFlag.setRange(this.value, 5, 9, paragraphNumberFormat);
  }

  public copy(from: ParagraphHeadInfoProperty): void {
    this.value = from.value;
  }
}
