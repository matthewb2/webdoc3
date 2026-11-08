import { Color4Byte } from "../../../../../etc/Color4Byte.js";
import { LineInfoProperty } from "./LineInfoProperty.js";
import type { OutlineStyle } from "./OutlineStyle.js";

/**
 * Border line information.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.lineinfo.LineInfo`.
 *
 * @author neolord
 */
export class LineInfo {
  /**
   * Line color
   */
  private color: Color4Byte;
  /**
   * Line thickness
   */
  private thickness = 0;
  /**
   * Property
   */
  private property: LineInfoProperty;
  /**
   * outline style
   */
  private outlineStyle: OutlineStyle | null = null;

  /**
   * Constructor
   */
  public constructor() {
    this.color = new Color4Byte();
    this.property = new LineInfoProperty();
  }

  /**
   * Returns the line color object.
   *
   * @return the line color object
   */
  public getColor(): Color4Byte {
    return this.color;
  }

  /**
   * Returns the line thickness.
   *
   * @return the line thickness
   */
  public getThickness(): number {
    return this.thickness;
  }

  /**
   * Sets the line thickness.
   *
   * @param thickness the line thickness
   */
  public setThickness(thickness: number): void {
    this.thickness = thickness;
  }

  /**
   * Returns the property object.
   *
   * @return the property object
   */
  public getProperty(): LineInfoProperty {
    return this.property;
  }

  /**
   * Returns the outline style.
   *
   * @return the outline style
   */
  public getOutlineStyle(): OutlineStyle | null {
    return this.outlineStyle;
  }

  /**
   * Sets the outline style.
   *
   * @param outlineStyle the outline style
   */
  public setOutlineStyle(outlineStyle: OutlineStyle): void {
    this.outlineStyle = outlineStyle;
  }

  public copy(from: LineInfo): void {
    this.color.copy(from.color);
    this.thickness = from.thickness;
    this.property.copy(from.property);
    this.outlineStyle = from.outlineStyle;
  }
}
