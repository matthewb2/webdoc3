/**
 * Object for font type information.
 * Ported from hwplib's `object.docinfo.facename.FontTypeInfo`.
 */
export class FontTypeInfo {
  /** Font family */
  private fontType: number = 0;
  /** Serif type */
  private serifType: number = 0;
  /** Thickness */
  private thickness: number = 0;
  /** Ratio */
  private ratio: number = 0;
  /** Contrast */
  private contrast: number = 0;
  /** Stroke deviation */
  private strokeDeviation: number = 0;
  /** Character stroke type */
  private characterStrokeType: number = 0;
  /** Character shape */
  private characterShape: number = 0;
  /** Middle line */
  private middleLine: number = 0;
  /** X-height */
  private xHeight: number = 0;

  public constructor() {}

  /** Returns the font family value. */
  public getFontType(): number {
    return this.fontType;
  }

  /** Sets the font family value. */
  public setFontType(fontType: number): void {
    this.fontType = fontType;
  }

  /** Returns the serif type value. */
  public getSerifType(): number {
    return this.serifType;
  }

  /** Sets the serif type value. */
  public setSerifType(serifType: number): void {
    this.serifType = serifType;
  }

  /** Returns the thickness value. */
  public getThickness(): number {
    return this.thickness;
  }

  /** Sets the thickness value. */
  public setThickness(thickness: number): void {
    this.thickness = thickness;
  }

  /** Returns the ratio value. */
  public getRatio(): number {
    return this.ratio;
  }

  /** Sets the ratio value. */
  public setRatio(ratio: number): void {
    this.ratio = ratio;
  }

  /** Returns the contrast value. */
  public getContrast(): number {
    return this.contrast;
  }

  /** Sets the contrast value. */
  public setContrast(contrast: number): void {
    this.contrast = contrast;
  }

  /** Returns the stroke deviation value. */
  public getStrokeDeviation(): number {
    return this.strokeDeviation;
  }

  /** Sets the stroke deviation value. */
  public setStrokeDeviation(strokeDeviation: number): void {
    this.strokeDeviation = strokeDeviation;
  }

  /** Returns the character stroke type value. */
  public getCharacterStrokeType(): number {
    return this.characterStrokeType;
  }

  /** Sets the character stroke type value. */
  public setCharacterStrokeType(characterStrokeType: number): void {
    this.characterStrokeType = characterStrokeType;
  }

  /** Returns the character shape value. */
  public getCharacterShape(): number {
    return this.characterShape;
  }

  /** Sets the character shape value. */
  public setCharacterShape(characterShape: number): void {
    this.characterShape = characterShape;
  }

  /** Returns the middle line value. */
  public getMiddleLine(): number {
    return this.middleLine;
  }

  /** Sets the middle line value. */
  public setMiddleLine(middleLine: number): void {
    this.middleLine = middleLine;
  }

  /** Returns the X-height. */
  public getxHeight(): number {
    return this.xHeight;
  }

  /** Sets the X-height. */
  public setxHeight(xHeight: number): void {
    this.xHeight = xHeight;
  }

  public copy(from: FontTypeInfo): void {
    this.fontType = from.fontType;
    this.serifType = from.serifType;
    this.thickness = from.thickness;
    this.ratio = from.ratio;
    this.contrast = from.contrast;
    this.strokeDeviation = from.strokeDeviation;
    this.characterStrokeType = from.characterStrokeType;
    this.characterShape = from.characterShape;
    this.middleLine = from.middleLine;
    this.xHeight = from.xHeight;
  }
}
