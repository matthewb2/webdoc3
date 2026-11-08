import { Matrix } from "./Matrix.js";

/**
 * Object representing a pair of matrices for scaling/rotation.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.renderingnfo.ScaleRotateMatrixPair`.
 *
 * @author neolord
 */
export class ScaleRotateMatrixPair {
  /**
   * The matrix for scaling.
   */
  private scaleMatrix: Matrix;
  /**
   * The matrix for rotation.
   */
  private rotateMatrix: Matrix;

  /**
   * Constructor
   */
  public constructor() {
    this.scaleMatrix = new Matrix();
    this.rotateMatrix = new Matrix();
  }

  /**
   * Returns the matrix for scaling.
   *
   * @return the matrix for scaling
   */
  public getScaleMatrix(): Matrix {
    return this.scaleMatrix;
  }

  /**
   * Returns the matrix for rotation.
   *
   * @return the matrix for rotation
   */
  public getRotateMatrix(): Matrix {
    return this.rotateMatrix;
  }

  public clone(): ScaleRotateMatrixPair {
    const cloned = new ScaleRotateMatrixPair();
    cloned.scaleMatrix.copy(this.scaleMatrix);
    cloned.rotateMatrix.copy(this.rotateMatrix);
    return cloned;
  }
}
