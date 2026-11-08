/**
 * Caret position information.
 * Ported from hwplib's `object.docinfo.documentproperties.CaretPosition`.
 */
export class CaretPosition {
  private listID = 0;
  private paragraphID = 0;
  private positionInParagraph = 0;

  constructor() {}

  getListID(): number {
    return this.listID;
  }

  setListID(listID: number): void {
    this.listID = listID;
  }

  getParagraphID(): number {
    return this.paragraphID;
  }

  setParagraphID(paragraphID: number): void {
    this.paragraphID = paragraphID;
  }

  getPositionInParagraph(): number {
    return this.positionInParagraph;
  }

  setPositionInParagraph(positionInParagraph: number): void {
    this.positionInParagraph = positionInParagraph;
  }

  copy(from: CaretPosition): void {
    this.listID = from.listID;
    this.paragraphID = from.paragraphID;
    this.positionInParagraph = from.positionInParagraph;
  }
}
