import { ParaShapeProperty1 } from "./parashape/ParaShapeProperty1.js";
import { ParaShapeProperty2 } from "./parashape/ParaShapeProperty2.js";
import { ParaShapeProperty3 } from "./parashape/ParaShapeProperty3.js";

/**
 * Record for a paragraph shape.
 * Ported from hwplib's `object.docinfo.ParaShape`.
 */
export class ParaShape {
  /** property 1 */
  private property1: ParaShapeProperty1;
  /** left margin */
  private leftMargin = 0;
  /** right margin */
  private rightMargin = 0;
  /** indent / outdent */
  private indent = 0;
  /** space above paragraph */
  private topParaSpace = 0;
  /** space below paragraph */
  private bottomParaSpace = 0;
  /** line space. used in Hangul 2007 and earlier (before 5.0.2.5) */
  private lineSpace = 0;
  /** referenced tab definition id */
  private tabDefId = 0;
  /** referenced numbering id or referenced bullet id */
  private paraHeadId = 0;
  /** referenced border/background shape id */
  private borderFillId = 0;
  /** paragraph border left space */
  private leftBorderSpace = 0;
  /** paragraph border right space */
  private rightBorderSpace = 0;
  /** paragraph border top space */
  private topBorderSpace = 0;
  /** paragraph border bottom space */
  private bottomBorderSpace = 0;
  /** property 2 (5.0.1.7 and above) */
  private property2: ParaShapeProperty2;
  /** property 3 (5.0.2.5 and above) */
  private property3: ParaShapeProperty3;
  /** line space (5.0.2.5 and above) */
  private lineSpace2 = 0;
  /** outline level (5.1.0.0 and above). used instead of property1.paraLevel. */
  private paraLevel = 0;

  constructor() {
    this.property1 = new ParaShapeProperty1();
    this.property2 = new ParaShapeProperty2();
    this.property3 = new ParaShapeProperty3();
  }

  getProperty1(): ParaShapeProperty1 {
    return this.property1;
  }

  getLeftMargin(): number {
    return this.leftMargin;
  }

  setLeftMargin(leftMargin: number): void {
    this.leftMargin = leftMargin;
  }

  getRightMargin(): number {
    return this.rightMargin;
  }

  setRightMargin(rightMargin: number): void {
    this.rightMargin = rightMargin;
  }

  getIndent(): number {
    return this.indent;
  }

  setIndent(indent: number): void {
    this.indent = indent;
  }

  getTopParaSpace(): number {
    return this.topParaSpace;
  }

  setTopParaSpace(topParaSpace: number): void {
    this.topParaSpace = topParaSpace;
  }

  getBottomParaSpace(): number {
    return this.bottomParaSpace;
  }

  setBottomParaSpace(bottomParaSpace: number): void {
    this.bottomParaSpace = bottomParaSpace;
  }

  getLineSpace(): number {
    return this.lineSpace;
  }

  setLineSpace(lineSpace: number): void {
    this.lineSpace = lineSpace;
  }

  getTabDefId(): number {
    return this.tabDefId;
  }

  setTabDefId(tabDefId: number): void {
    this.tabDefId = tabDefId;
  }

  getParaHeadId(): number {
    return this.paraHeadId;
  }

  setParaHeadId(paraHeadId: number): void {
    this.paraHeadId = paraHeadId;
  }

  getBorderFillId(): number {
    return this.borderFillId;
  }

  setBorderFillId(borderFillId: number): void {
    this.borderFillId = borderFillId;
  }

  getLeftBorderSpace(): number {
    return this.leftBorderSpace;
  }

  setLeftBorderSpace(leftBorderSpace: number): void {
    this.leftBorderSpace = leftBorderSpace;
  }

  getRightBorderSpace(): number {
    return this.rightBorderSpace;
  }

  setRightBorderSpace(rightBorderSpace: number): void {
    this.rightBorderSpace = rightBorderSpace;
  }

  getTopBorderSpace(): number {
    return this.topBorderSpace;
  }

  setTopBorderSpace(topBorderSpace: number): void {
    this.topBorderSpace = topBorderSpace;
  }

  getBottomBorderSpace(): number {
    return this.bottomBorderSpace;
  }

  setBottomBorderSpace(bottomBorderSpace: number): void {
    this.bottomBorderSpace = bottomBorderSpace;
  }

  getProperty2(): ParaShapeProperty2 {
    return this.property2;
  }

  getProperty3(): ParaShapeProperty3 {
    return this.property3;
  }

  getLineSpace2(): number {
    return this.lineSpace2;
  }

  setLineSpace2(lineSpace2: number): void {
    this.lineSpace2 = lineSpace2;
  }

  getParaLevel(): number {
    return this.paraLevel;
  }

  setParaLevel(paraLevel: number): void {
    this.paraLevel = paraLevel;
  }

  clone(): ParaShape {
    const cloned = new ParaShape();
    cloned.property1.copy(this.property1);
    cloned.leftMargin = this.leftMargin;
    cloned.rightMargin = this.rightMargin;
    cloned.indent = this.indent;
    cloned.topParaSpace = this.topParaSpace;
    cloned.bottomParaSpace = this.bottomParaSpace;
    cloned.lineSpace = this.lineSpace;
    cloned.tabDefId = this.tabDefId;
    cloned.paraHeadId = this.paraHeadId;
    cloned.borderFillId = this.borderFillId;
    cloned.leftBorderSpace = this.leftBorderSpace;
    cloned.rightBorderSpace = this.rightBorderSpace;
    cloned.topBorderSpace = this.topBorderSpace;
    cloned.bottomBorderSpace = this.bottomBorderSpace;
    cloned.property2.copy(this.property2);
    cloned.property3.copy(this.property3);
    cloned.lineSpace2 = this.lineSpace2;
    cloned.paraLevel = this.paraLevel;
    return cloned;
  }
}
