import { FaceNameIds } from "./charshape/FaceNameIds.js";
import { Ratios } from "./charshape/Ratios.js";
import { CharSpaces } from "./charshape/CharSpaces.js";
import { RelativeSizes } from "./charshape/RelativeSizes.js";
import { CharOffsets } from "./charshape/CharOffsets.js";
import { CharShapeProperty } from "./charshape/CharShapeProperty.js";
import { Color4Byte } from "../etc/Color4Byte.js";

/**
 * Record representing a character shape.
 * Ported from hwplib's `object.docinfo.CharShape`.
 */
export class CharShape {
  /** referenced font ID (FaceID) per language */
  private faceNameIds: FaceNameIds;
  /** ratio per language, 50%~200% */
  private ratios: Ratios;
  /** char spacing per language, -50%~50% */
  private charSpaces: CharSpaces;
  /** relative size per language, 10%~250% */
  private relativeSizes: RelativeSizes;
  /** char offset per language, -100%~100% */
  private charOffsets: CharOffsets;
  /** base size */
  private baseSize = 0;
  /** property */
  private property: CharShapeProperty;
  /** shadow gap 1, -100%~100% */
  private shadowGap1 = 0;
  /** shadow gap 2, -100%~100% */
  private shadowGap2 = 0;
  /** char color */
  private charColor: Color4Byte;
  /** underline color */
  private underLineColor: Color4Byte;
  /** shade color */
  private shadeColor: Color4Byte;
  /** shadow color */
  private shadowColor: Color4Byte;
  /** referenced border/background ID for the character */
  private borderFillId = 0;
  /** strike line color (5.0.3.0 and above) */
  private strikeLineColor: Color4Byte;

  constructor() {
    this.faceNameIds = new FaceNameIds();
    this.ratios = new Ratios();
    this.charSpaces = new CharSpaces();
    this.relativeSizes = new RelativeSizes();
    this.charOffsets = new CharOffsets();
    this.property = new CharShapeProperty();
    this.charColor = new Color4Byte();
    this.underLineColor = new Color4Byte();
    this.shadeColor = new Color4Byte();
    this.shadowColor = new Color4Byte();
    this.strikeLineColor = new Color4Byte();
  }

  getFaceNameIds(): FaceNameIds {
    return this.faceNameIds;
  }

  getRatios(): Ratios {
    return this.ratios;
  }

  getCharSpaces(): CharSpaces {
    return this.charSpaces;
  }

  getRelativeSizes(): RelativeSizes {
    return this.relativeSizes;
  }

  getCharOffsets(): CharOffsets {
    return this.charOffsets;
  }

  getBaseSize(): number {
    return this.baseSize;
  }

  setBaseSize(baseSize: number): void {
    this.baseSize = baseSize;
  }

  getProperty(): CharShapeProperty {
    return this.property;
  }

  getShadowGap1(): number {
    return this.shadowGap1;
  }

  setShadowGap1(shadowGap1: number): void {
    this.shadowGap1 = shadowGap1;
  }

  getShadowGap2(): number {
    return this.shadowGap2;
  }

  setShadowGap2(shadowGap2: number): void {
    this.shadowGap2 = shadowGap2;
  }

  getCharColor(): Color4Byte {
    return this.charColor;
  }

  getUnderLineColor(): Color4Byte {
    return this.underLineColor;
  }

  getShadeColor(): Color4Byte {
    return this.shadeColor;
  }

  getShadowColor(): Color4Byte {
    return this.shadowColor;
  }

  getBorderFillId(): number {
    return this.borderFillId;
  }

  setBorderFillId(borderFillId: number): void {
    this.borderFillId = borderFillId;
  }

  getStrikeLineColor(): Color4Byte {
    return this.strikeLineColor;
  }

  clone(): CharShape {
    const cloned = new CharShape();
    cloned.faceNameIds.copy(this.faceNameIds);
    cloned.ratios.copy(this.ratios);
    cloned.charSpaces.copy(this.charSpaces);
    cloned.relativeSizes.copy(this.relativeSizes);
    cloned.charOffsets.copy(this.charOffsets);
    cloned.baseSize = this.baseSize;
    cloned.property.copy(this.property);
    cloned.shadowGap1 = this.shadowGap1;
    cloned.shadowGap2 = this.shadowGap2;
    cloned.charColor.copy(this.charColor);
    cloned.underLineColor.copy(this.underLineColor);
    cloned.shadeColor.copy(this.shadeColor);
    cloned.shadowColor.copy(this.shadeColor);
    cloned.borderFillId = this.borderFillId;
    cloned.strikeLineColor.copy(this.strikeLineColor);
    return cloned;
  }
}
