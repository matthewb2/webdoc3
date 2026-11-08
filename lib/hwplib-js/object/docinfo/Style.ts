import { StyleProperty } from "./style/StyleProperty.js";

/**
 * Record for a style.
 * Ported from hwplib's `object.docinfo.Style`.
 */
export class Style {
  /** Hangul name */
  private hangulName: string | null = null;
  /** English name */
  private englishName: string | null = null;
  /** property */
  private proeprty: StyleProperty;
  /** next style id */
  private nextStyleId = 0;
  /** language id */
  private languageId = 0;
  /** referenced paragraph shape id */
  private paraShapeId = 0;
  /** referenced character shape id */
  private charShapeId = 0;

  constructor() {
    this.proeprty = new StyleProperty();
  }

  getHangulName(): string | null {
    return this.hangulName;
  }

  setHangulName(hangulName: string | null): void {
    this.hangulName = hangulName;
  }

  getEnglishName(): string | null {
    return this.englishName;
  }

  setEnglishName(englishName: string | null): void {
    this.englishName = englishName;
  }

  getProeprty(): StyleProperty {
    return this.proeprty;
  }

  getNextStyleId(): number {
    return this.nextStyleId;
  }

  setNextStyleId(nextStyleId: number): void {
    this.nextStyleId = nextStyleId;
  }

  getLanguageId(): number {
    return this.languageId;
  }

  setLanguageId(languageId: number): void {
    this.languageId = languageId;
  }

  getParaShapeId(): number {
    return this.paraShapeId;
  }

  setParaShapeId(paraShapeId: number): void {
    this.paraShapeId = paraShapeId;
  }

  getCharShapeId(): number {
    return this.charShapeId;
  }

  setCharShapeId(charShapeId: number): void {
    this.charShapeId = charShapeId;
  }

  clone(): Style {
    const cloned = new Style();
    cloned.hangulName = this.hangulName;
    cloned.englishName = this.englishName;
    cloned.proeprty.copy(this.proeprty);
    cloned.nextStyleId = this.nextStyleId;
    cloned.languageId = this.languageId;
    cloned.paraShapeId = this.paraShapeId;
    cloned.charShapeId = this.charShapeId;
    return cloned;
  }
}
