/**
 * Layout compatibility record.
 * Ported from hwplib's `object.docinfo.LayoutCompatibility`.
 */
export class LayoutCompatibility {
  private letterLevelFormat = 0;
  private paragraphLevelFormat = 0;
  private sectionLevelFormat = 0;
  private objectLevelFormat = 0;
  private fieldLevelFormat = 0;

  constructor() {}

  getLetterLevelFormat(): number {
    return this.letterLevelFormat;
  }

  setLetterLevelFormat(letterLevelFormat: number): void {
    this.letterLevelFormat = letterLevelFormat;
  }

  getParagraphLevelFormat(): number {
    return this.paragraphLevelFormat;
  }

  setParagraphLevelFormat(paragraphLevelFormat: number): void {
    this.paragraphLevelFormat = paragraphLevelFormat;
  }

  getSectionLevelFormat(): number {
    return this.sectionLevelFormat;
  }

  setSectionLevelFormat(sectionLevelFormat: number): void {
    this.sectionLevelFormat = sectionLevelFormat;
  }

  getObjectLevelFormat(): number {
    return this.objectLevelFormat;
  }

  setObjectLevelFormat(objectLevelFormat: number): void {
    this.objectLevelFormat = objectLevelFormat;
  }

  getFieldLevelFormat(): number {
    return this.fieldLevelFormat;
  }

  setFieldLevelFormat(fieldLevelFormat: number): void {
    this.fieldLevelFormat = fieldLevelFormat;
  }

  clone(): LayoutCompatibility {
    const cloned = new LayoutCompatibility();
    cloned.letterLevelFormat = this.letterLevelFormat;
    cloned.paragraphLevelFormat = this.paragraphLevelFormat;
    cloned.sectionLevelFormat = this.sectionLevelFormat;
    cloned.objectLevelFormat = this.objectLevelFormat;
    cloned.fieldLevelFormat = this.fieldLevelFormat;
    return cloned;
  }
}
