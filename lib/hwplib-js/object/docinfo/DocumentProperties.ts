import { CaretPosition } from "./documentproperties/CaretPosition.js";
import { StartNumber } from "./documentproperties/StartNumber.js";

/**
 * Record representing document properties.
 * Ported from hwplib's `object.docinfo.DocumentProperties`.
 */
export class DocumentProperties {
  /** section count */
  private sectionCount = 0;
  /** information about various start numbers in the document */
  private startNumber: StartNumber;
  /** caret position information in the document */
  private caretPosition: CaretPosition;

  constructor() {
    this.startNumber = new StartNumber();
    this.caretPosition = new CaretPosition();
  }

  getSectionCount(): number {
    return this.sectionCount;
  }

  setSectionCount(sectionCount: number): void {
    this.sectionCount = sectionCount;
  }

  getStartNumber(): StartNumber {
    return this.startNumber;
  }

  getCaretPosition(): CaretPosition {
    return this.caretPosition;
  }

  copy(from: DocumentProperties): void {
    this.sectionCount = from.sectionCount;
    this.startNumber.copy(from.startNumber);
    this.caretPosition.copy(from.caretPosition);
  }
}
