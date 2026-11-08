import { BorderThickness } from "./borderfill/BorderThickness.js";
import { BorderType } from "./borderfill/BorderType.js";
import { Color4Byte } from "../etc/Color4Byte.js";

/**
 * Record representing a memo shape.
 * Ported from hwplib's `object.docinfo.MemoShape`.
 */
export class MemoShape {
  private width = 0;
  private lineType: BorderType;
  private lineWidth: BorderThickness;
  private lineColor: Color4Byte;
  private fillColor: Color4Byte;
  private activeColor: Color4Byte;
  private unknown = 0;

  constructor() {
    this.lineType = BorderType.None;
    this.lineWidth = BorderThickness.MM0_1;
    this.lineColor = new Color4Byte();
    this.fillColor = new Color4Byte();
    this.activeColor = new Color4Byte();
    this.unknown = 0;
  }

  getWidth(): number {
    return this.width;
  }

  setWidth(width: number): void {
    this.width = width;
  }

  getLineType(): BorderType {
    return this.lineType;
  }

  setLineType(lineType: BorderType): void {
    this.lineType = lineType;
  }

  getLineWidth(): BorderThickness {
    return this.lineWidth;
  }

  setLineWidth(lineWidth: BorderThickness): void {
    this.lineWidth = lineWidth;
  }

  getLineColor(): Color4Byte {
    return this.lineColor;
  }

  getFillColor(): Color4Byte {
    return this.fillColor;
  }

  getActiveColor(): Color4Byte {
    return this.activeColor;
  }

  getUnknown(): number {
    return this.unknown;
  }

  setUnknown(unknown: number): void {
    this.unknown = unknown;
  }

  clone(): MemoShape {
    const cloned = new MemoShape();
    cloned.width = this.width;
    cloned.lineType = this.lineType;
    cloned.lineWidth = this.lineWidth;
    cloned.lineColor.copy(this.lineColor);
    cloned.fillColor.copy(this.fillColor);
    cloned.activeColor.copy(this.activeColor);
    cloned.unknown = this.unknown;
    return cloned;
  }
}
