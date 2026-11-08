import { FaceNameProperty } from "./facename/FaceNameProperty.js";
import type { FontType } from "./facename/FontType.js";
import { FontTypeInfo } from "./facename/FontTypeInfo.js";

/**
 * Font record.
 * Ported from hwplib's `object.docinfo.FaceName`.
 */
export class FaceName {
  /** property */
  private property: FaceNameProperty;
  /** font name */
  private name: string | null = null;
  /** substitute font type */
  private substituteFontType: FontType | null = null;
  /** substitute font name */
  private substituteFontName: string | null = null;
  /** font type information */
  private fontTypeInfo: FontTypeInfo;
  /** base font name */
  private baseFontName: string | null = null;

  constructor() {
    this.property = new FaceNameProperty();
    this.fontTypeInfo = new FontTypeInfo();
  }

  getProperty(): FaceNameProperty {
    return this.property;
  }

  getName(): string | null {
    return this.name;
  }

  setName(name: string | null): void {
    this.name = name;
  }

  getSubstituteFontType(): FontType | null {
    return this.substituteFontType;
  }

  setSubstituteFontType(substituteFontType: FontType | null): void {
    this.substituteFontType = substituteFontType;
  }

  getSubstituteFontName(): string | null {
    return this.substituteFontName;
  }

  setSubstituteFontName(substituteFontName: string | null): void {
    this.substituteFontName = substituteFontName;
  }

  getFontTypeInfo(): FontTypeInfo {
    return this.fontTypeInfo;
  }

  getBaseFontName(): string | null {
    return this.baseFontName;
  }

  setBaseFontName(baseFontName: string | null): void {
    this.baseFontName = baseFontName;
  }

  clone(): FaceName {
    const cloned = new FaceName();
    cloned.property.copy(this.property);
    cloned.name = this.name;
    cloned.substituteFontType = this.substituteFontType;
    cloned.substituteFontName = this.substituteFontName;
    cloned.fontTypeInfo.copy(this.fontTypeInfo);
    cloned.baseFontName = this.baseFontName;
    return cloned;
  }
}
