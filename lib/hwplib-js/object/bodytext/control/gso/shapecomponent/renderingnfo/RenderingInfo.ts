import { Matrix } from "./Matrix.js";
import { ScaleRotateMatrixPair } from "./ScaleRotateMatrixPair.js";

/**
 * Rendering information.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.renderingnfo.RenderingInfo`.
 *
 * @author neolord
 */
export class RenderingInfo {
  /**
   * The matrix for translation.
   */
  private translationMatrix: Matrix;
  /**
   * The list of matrix pairs for scaling/rotation.
   */
  private scaleRotateMatrixPairList: ScaleRotateMatrixPair[];

  /**
   * Constructor
   */
  public constructor() {
    this.translationMatrix = new Matrix();
    this.scaleRotateMatrixPairList = [];
  }

  /**
   * Returns the matrix object for translation.
   *
   * @return the matrix object for translation
   */
  public getTranslationMatrix(): Matrix {
    return this.translationMatrix;
  }

  /**
   * Creates a new matrix pair for scaling/rotation and adds it to the list.
   *
   * @return the newly created matrix pair for scaling/rotation
   */
  public addNewScaleRotateMatrixPair(): ScaleRotateMatrixPair {
    const srmp = new ScaleRotateMatrixPair();
    this.scaleRotateMatrixPairList.push(srmp);
    return srmp;
  }

  /**
   * Returns the list of matrix pairs for scaling/rotation.
   *
   * @return the list of matrix pairs for scaling/rotation
   */
  public getScaleRotateMatrixPairList(): ScaleRotateMatrixPair[] {
    return this.scaleRotateMatrixPairList;
  }

  public copy(from: RenderingInfo): void {
    this.translationMatrix.copy(from.translationMatrix);

    this.scaleRotateMatrixPairList.length = 0;
    for (const matrixPair of from.scaleRotateMatrixPairList) {
      this.scaleRotateMatrixPairList.push(matrixPair.clone());
    }
  }
}
