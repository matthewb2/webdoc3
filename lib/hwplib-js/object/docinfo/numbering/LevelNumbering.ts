import { HWPString } from "../../etc/HWPString.js";
import { ParagraphHeadInfo } from "./ParagraphHeadInfo.js";

/**
 * Paragraph number information for each level (1~7).
 * Ported from hwplib's `object.docinfo.numbering.LevelNumbering`.
 */
export class LevelNumbering {
  /** Paragraph head information */
  private paragraphHeadInfo: ParagraphHeadInfo;
  /** Number format */
  private numberFormat: HWPString;
  /** Start number per level (5.0.2.5 or above) */
  private startNumber: number = 0;

  public constructor() {
    this.paragraphHeadInfo = new ParagraphHeadInfo();
    this.numberFormat = new HWPString();
  }

  /** Returns the paragraph head information object. */
  public getParagraphHeadInfo(): ParagraphHeadInfo {
    return this.paragraphHeadInfo;
  }

  /** Returns the number format. */
  public getNumberFormat(): HWPString {
    return this.numberFormat;
  }

  /** Returns the start number per level. */
  public getStartNumber(): number {
    return this.startNumber;
  }

  /** Sets the start number per level. */
  public setStartNumber(startNumber: number): void {
    this.startNumber = startNumber;
  }

  public copy(from: LevelNumbering): void {
    this.paragraphHeadInfo.copy(from.paragraphHeadInfo);
    this.numberFormat.copy(from.numberFormat);
    this.startNumber = from.startNumber;
  }
}
