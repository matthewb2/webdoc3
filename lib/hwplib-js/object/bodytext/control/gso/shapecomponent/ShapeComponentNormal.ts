import { ShapeComponent } from "./ShapeComponent.js";
import { LineInfo } from "./lineinfo/LineInfo.js";
import { ShadowInfo } from "./shadowinfo/ShadowInfo.js";
import { FillInfo } from "../../../../docinfo/borderfill/fillinfo/FillInfo.js";

/**
 * Object common attribute record for a normal control.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.ShapeComponentNormal`.
 *
 * @author neolord
 */
export class ShapeComponentNormal extends ShapeComponent {
  /**
   * Border line information
   */
  private lineInfo: LineInfo | null;
  /**
   * Fill information
   */
  private fillInfo: FillInfo | null;
  /**
   * Shadow information
   */
  private shadowInfo: ShadowInfo | null;

  /**
   * Constructor
   */
  public constructor() {
    super();
    this.lineInfo = null;
    this.fillInfo = null;
    this.shadowInfo = null;
  }

  /**
   * Creates the border line information object.
   */
  public createLineInfo(): void {
    this.lineInfo = new LineInfo();
  }

  /**
   * Deletes the border line information object.
   */
  public deleteLineInfo(): void {
    this.lineInfo = null;
  }

  /**
   * Returns the border line information object.
   *
   * @return the border line information object
   */
  public getLineInfo(): LineInfo | null {
    return this.lineInfo;
  }

  /**
   * Creates the fill information object.
   */
  public createFillInfo(): void {
    this.fillInfo = new FillInfo();
  }

  /**
   * Deletes the fill information object.
   */
  public deleteFillInfo(): void {
    this.fillInfo = null;
  }

  /**
   * Returns the fill information object.
   *
   * @return the fill information object
   */
  public getFillInfo(): FillInfo | null {
    return this.fillInfo;
  }

  /**
   * Creates the shadow information object.
   */
  public createShadowInfo(): void {
    this.shadowInfo = new ShadowInfo();
  }

  /**
   * Deletes the shadow information object.
   */
  public deleteShadowInfo(): void {
    this.shadowInfo = null;
  }

  /**
   * Returns the shadow information object.
   *
   * @return the shadow information object
   */
  public getShadowInfo(): ShadowInfo | null {
    return this.shadowInfo;
  }

  public override copy(from: ShapeComponent): void {
    this.copyShapeComponent(from);
    const from2 = from as ShapeComponentNormal;

    if (from2.lineInfo !== null) {
      this.createLineInfo();
      this.lineInfo!.copy(from2.lineInfo);
    } else {
      this.lineInfo = null;
    }

    if (from2.fillInfo !== null) {
      this.createFillInfo();
      this.fillInfo!.copy(from2.fillInfo);
    } else {
      this.fillInfo = null;
    }

    if (from2.shadowInfo !== null) {
      this.createShadowInfo();
      this.shadowInfo!.copy(from2.shadowInfo);
    } else {
      this.shadowInfo = null;
    }
  }
}
