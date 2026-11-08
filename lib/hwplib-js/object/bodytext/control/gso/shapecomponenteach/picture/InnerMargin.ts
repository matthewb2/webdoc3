/**
 * Inner margin information.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.InnerMargin`.
 *
 * @author neolord
 */
export class InnerMargin {
  /**
   * Left margin
   */
  private left = 0;
  /**
   * Right margin
   */
  private right = 0;
  /**
   * Top margin
   */
  private top = 0;
  /**
   * Bottom margin
   */
  private bottom = 0;

  /**
   * Constructor
   */
  public constructor() {}

  /**
   * Returns the size of the left margin.
   *
   * @return the size of the left margin
   */
  public getLeft(): number {
    return this.left;
  }

  /**
   * Sets the size of the left margin.
   *
   * @param left the size of the left margin
   */
  public setLeft(left: number): void {
    this.left = left;
  }

  /**
   * Returns the size of the right margin.
   *
   * @return the size of the right margin
   */
  public getRight(): number {
    return this.right;
  }

  /**
   * Sets the size of the right margin.
   *
   * @param right the size of the right margin
   */
  public setRight(right: number): void {
    this.right = right;
  }

  /**
   * Returns the size of the top margin.
   *
   * @return the size of the top margin
   */
  public getTop(): number {
    return this.top;
  }

  /**
   * Sets the size of the top margin.
   *
   * @param top the size of the top margin
   */
  public setTop(top: number): void {
    this.top = top;
  }

  /**
   * Returns the size of the bottom margin.
   *
   * @return the size of the bottom margin
   */
  public getBottom(): number {
    return this.bottom;
  }

  /**
   * Sets the size of the bottom margin.
   *
   * @param bottom the size of the bottom margin
   */
  public setBottom(bottom: number): void {
    this.bottom = bottom;
  }

  public copy(from: InnerMargin): void {
    this.left = from.left;
    this.right = from.right;
    this.top = from.top;
    this.bottom = from.bottom;
  }
}
