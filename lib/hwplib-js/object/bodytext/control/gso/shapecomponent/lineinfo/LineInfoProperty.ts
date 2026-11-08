import { BitFlag } from "../../../../../../util/binary/BitFlag.js";
import { LineType } from "./LineType.js";
import { LineEndShape } from "./LineEndShape.js";
import { LineArrowShape } from "./LineArrowShape.js";
import { LineArrowSize } from "./LineArrowSize.js";

/**
 * Object representing the property of the border line information.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.lineinfo.LineInfoProperty`.
 *
 * @author neolord
 */
export class LineInfoProperty {
  /**
   * The integer value stored in the file (unsigned 4 byte).
   */
  private value = 0;

  /**
   * Constructor
   */
  public constructor() {}

  /**
   * Returns the integer value stored in the file.
   *
   * @return the integer value stored in the file
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Sets the integer value stored in the file.
   *
   * @param value the integer value stored in the file
   */
  public setValue(value: number): void {
    this.value = value;
  }

  /**
   * Returns the line type. (0~5 bit)
   *
   * @return the line type
   */
  public getLineType(): LineType {
    return LineType.valueOf(BitFlag.getRange(this.value, 0, 5));
  }

  /**
   * Sets the line type. (0~5 bit)
   *
   * @param lineType the line type
   */
  public setLineType(lineType: LineType): void {
    this.value = BitFlag.setRange(this.value, 0, 5, lineType);
  }

  /**
   * Returns the line end shape. (6~9 bit)
   *
   * @return the line end shape
   */
  public getLineEndShape(): LineEndShape {
    return LineEndShape.valueOf(BitFlag.getRange(this.value, 6, 9));
  }

  /**
   * Sets the line end shape. (6~9 bit)
   *
   * @param lineEndShape the line end shape
   */
  public setLineEndShape(lineEndShape: LineEndShape): void {
    this.value = BitFlag.setRange(this.value, 6, 9, lineEndShape);
  }

  /**
   * Returns the start arrow shape. (10~15 bit)
   *
   * @return the start arrow shape
   */
  public getStartArrowShape(): LineArrowShape {
    return LineArrowShape.valueOf(BitFlag.getRange(this.value, 10, 15));
  }

  /**
   * Sets the start arrow shape. (10~15 bit)
   *
   * @param startArrowShape the start arrow shape
   */
  public setStartArrowShape(startArrowShape: LineArrowShape): void {
    this.value = BitFlag.setRange(this.value, 10, 15, startArrowShape);
  }

  /**
   * Returns the end arrow shape. (16~21 bit)
   *
   * @return the end arrow shape
   */
  public getEndArrowShape(): LineArrowShape {
    return LineArrowShape.valueOf(BitFlag.getRange(this.value, 16, 21));
  }

  /**
   * Sets the end arrow shape. (16~21 bit)
   *
   * @param endArrowShape the end arrow shape
   */
  public setEndArrowShape(endArrowShape: LineArrowShape): void {
    this.value = BitFlag.setRange(this.value, 16, 21, endArrowShape);
  }

  /**
   * Returns the start arrow size. (22~25 bit)
   *
   * @return the start arrow size
   */
  public getStartArrowSize(): LineArrowSize {
    return LineArrowSize.valueOf(BitFlag.getRange(this.value, 22, 25));
  }

  /**
   * Sets the start arrow size. (22~25 bit)
   *
   * @param startArrowSize the start arrow size
   */
  public setStartArrowSize(startArrowSize: LineArrowSize): void {
    this.value = BitFlag.setRange(this.value, 22, 25, startArrowSize);
  }

  /**
   * Returns the end arrow size. (26~29 bit)
   *
   * @return the end arrow size
   */
  public getEndArrowSize(): LineArrowSize {
    return LineArrowSize.valueOf(BitFlag.getRange(this.value, 26, 29));
  }

  /**
   * Sets the end arrow size. (26~29 bit)
   *
   * @param endArrowSize the end arrow size
   */
  public setEndArrowSize(endArrowSize: LineArrowSize): void {
    this.value = BitFlag.setRange(this.value, 26, 29, endArrowSize);
  }

  /**
   * Returns whether the start arrow is filled. (30 bit)
   *
   * @return whether the start arrow is filled
   */
  public isFillStartArrow(): boolean {
    return BitFlag.get(this.value, 30);
  }

  /**
   * Sets whether the start arrow is filled. (30 bit)
   *
   * @param fillStartArrow whether the start arrow is filled
   */
  public setFillStartArrow(fillStartArrow: boolean): void {
    this.value = BitFlag.set(this.value, 30, fillStartArrow);
  }

  /**
   * Returns whether the end arrow is filled. (31 bit)
   *
   * @return whether the end arrow is filled
   */
  public isFillEndArrow(): boolean {
    return BitFlag.get(this.value, 31);
  }

  /**
   * Sets whether the end arrow is filled. (31 bit)
   *
   * @param fillEndArrow whether the end arrow is filled
   */
  public setFillEndArrow(fillEndArrow: boolean): void {
    this.value = BitFlag.set(this.value, 31, fillEndArrow);
  }

  public copy(from: LineInfoProperty): void {
    this.value = from.value;
  }
}
