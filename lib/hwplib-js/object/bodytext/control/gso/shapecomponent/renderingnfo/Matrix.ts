/**
 * Object representing a matrix. Each matrix is implemented as a 3 X 3 matrix whose elements are
 * expressed as double. Because the last row is always [0,0,1], it is omitted and only 6 elements
 * are actually stored.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.renderingnfo.Matrix`.
 *
 * @author neolord
 */
export class Matrix {
  /**
   * The array storing the matrix's elements.
   */
  private values: number[];

  /**
   * Constructor
   */
  public constructor() {
    this.values = new Array<number>(6).fill(0);
  }

  /**
   * Returns the matrix's element.
   *
   * @param index the element's index
   * @return the matrix's element
   */
  public getValue(index: number): number {
    return this.values[index]!;
  }

  /**
   * Sets the matrix's element.
   *
   * @param index the element's index
   * @param value the matrix's element
   */
  public setValue(index: number, value: number): void {
    this.values[index] = value;
  }

  /**
   * Returns the array storing the matrix's elements.
   *
   * @return the array storing the matrix's elements
   */
  public getValues(): number[] {
    return this.values;
  }

  public copy(from: Matrix): void {
    this.values = from.values.slice();
  }
}
