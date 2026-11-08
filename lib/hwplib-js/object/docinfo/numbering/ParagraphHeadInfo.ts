import { ParagraphHeadInfoProperty } from "./ParagraphHeadInfoProperty.js";

/**
 * Paragraph head information object.
 * Ported from hwplib's `object.docinfo.numbering.ParagraphHeadInfo`.
 */
export class ParagraphHeadInfo {
  /** Property */
  private property: ParagraphHeadInfoProperty;
  /** Correction value for width */
  private correctionValueForWidth: number = 0;
  /** Distance from body */
  private distanceFromBody: number = 0;
  /** Referenced char shape id */
  private charShapeID: number = 0;

  public constructor() {
    this.property = new ParagraphHeadInfoProperty();
  }

  /** Returns the property object of the paragraph head information. */
  public getProperty(): ParagraphHeadInfoProperty {
    return this.property;
  }

  /** Returns the correction value for width. */
  public getCorrectionValueForWidth(): number {
    return this.correctionValueForWidth;
  }

  /** Sets the correction value for width. */
  public setCorrectionValueForWidth(correctionValueForWidth: number): void {
    this.correctionValueForWidth = correctionValueForWidth;
  }

  /** Returns the distance from body. */
  public getDistanceFromBody(): number {
    return this.distanceFromBody;
  }

  /** Sets the distance from body. */
  public setDistanceFromBody(distanceFromBody: number): void {
    this.distanceFromBody = distanceFromBody;
  }

  /** Returns the referenced char shape id. */
  public getCharShapeID(): number {
    return this.charShapeID;
  }

  /** Sets the referenced char shape id. */
  public setCharShapeID(charShapeID: number): void {
    this.charShapeID = charShapeID;
  }

  public copy(from: ParagraphHeadInfo): void {
    this.property.copy(from.property);
    this.correctionValueForWidth = from.correctionValueForWidth;
    this.distanceFromBody = from.distanceFromBody;
    this.charShapeID = from.charShapeID;
  }
}
