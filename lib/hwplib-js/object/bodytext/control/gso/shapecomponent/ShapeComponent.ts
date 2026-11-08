import { RenderingInfo } from "./renderingnfo/RenderingInfo.js";
import type { ScaleRotateMatrixPair } from "./renderingnfo/ScaleRotateMatrixPair.js";
import { ShapeComponentProperty } from "./ShapeComponentProperty.js";

/**
 * Object common attribute.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.ShapeComponent`.
 *
 * @author neolord
 */
export abstract class ShapeComponent {
  /**
   * Object control Id
   */
  private gsoId = 0;
  /**
   * X offset within the group the object belongs to
   */
  private offsetX = 0;
  /**
   * Y offset within the group the object belongs to
   */
  private offsetY = 0;
  /**
   * Grouping count
   */
  private groupingCount = 0;
  /**
   * Local file version of the object element
   */
  private localFileVersion = 0;
  /**
   * Width at creation
   */
  private widthAtCreate = 0;
  /**
   * Height at creation
   */
  private heightAtCreate = 0;
  /**
   * Current width
   */
  private widthAtCurrent = 0;
  /**
   * Current height
   */
  private heightAtCurrent = 0;
  /**
   * Property (no information)
   */
  private property: ShapeComponentProperty;
  /**
   * Rotation angle
   */
  private rotateAngle = 0;
  /**
   * X coordinate of the rotation center (object coordinate system)
   */
  private rotateXCenter = 0;
  /**
   * Y coordinate of the rotation center (object coordinate system)
   */
  private rotateYCenter = 0;
  /**
   * Rendering information
   */
  private renderingInfo: RenderingInfo;

  private instid = 0;

  /**
   * Constructor
   */
  protected constructor() {
    this.renderingInfo = new RenderingInfo();
    this.property = new ShapeComponentProperty();
  }

  /**
   * Returns the object control Id.
   *
   * @return the object control Id
   */
  public getGsoId(): number {
    return this.gsoId;
  }

  /**
   * Sets the object control Id.
   *
   * @param gsoId the object control Id
   */
  public setGsoId(gsoId: number): void {
    this.gsoId = gsoId;
  }

  /**
   * Returns the X offset within the group the object belongs to.
   *
   * @return the X offset within the group the object belongs to
   */
  public getOffsetX(): number {
    return this.offsetX;
  }

  /**
   * Sets the X offset within the group the object belongs to.
   *
   * @param offsetX the X offset within the group the object belongs to
   */
  public setOffsetX(offsetX: number): void {
    this.offsetX = offsetX;
  }

  /**
   * Returns the Y offset within the group the object belongs to.
   *
   * @return the Y offset within the group the object belongs to
   */
  public getOffsetY(): number {
    return this.offsetY;
  }

  /**
   * Sets the Y offset within the group the object belongs to.
   *
   * @param offsetY the Y offset within the group the object belongs to
   */
  public setOffsetY(offsetY: number): void {
    this.offsetY = offsetY;
  }

  /**
   * Returns the grouping count.
   *
   * @return the grouping count
   */
  public getGroupingCount(): number {
    return this.groupingCount;
  }

  /**
   * Sets the grouping count.
   *
   * @param groupingCount the grouping count
   */
  public setGroupingCount(groupingCount: number): void {
    this.groupingCount = groupingCount;
  }

  /**
   * Returns the local file version of the object element.
   *
   * @return the local file version of the object element
   */
  public getLocalFileVersion(): number {
    return this.localFileVersion;
  }

  /**
   * Sets the local file version of the object element.
   *
   * @param localFileVersion the local file version of the object element
   */
  public setLocalFileVersion(localFileVersion: number): void {
    this.localFileVersion = localFileVersion;
  }

  /**
   * Returns the width at creation.
   *
   * @return the width at creation
   */
  public getWidthAtCreate(): number {
    return this.widthAtCreate;
  }

  /**
   * Sets the width at creation.
   *
   * @param widthAtCreate the width at creation
   */
  public setWidthAtCreate(widthAtCreate: number): void {
    this.widthAtCreate = widthAtCreate;
  }

  /**
   * Returns the height at creation.
   *
   * @return the height at creation
   */
  public getHeightAtCreate(): number {
    return this.heightAtCreate;
  }

  /**
   * Sets the height at creation.
   *
   * @param heightAtCreate the height at creation
   */
  public setHeightAtCreate(heightAtCreate: number): void {
    this.heightAtCreate = heightAtCreate;
  }

  /**
   * Returns the current width.
   *
   * @return the current width
   */
  public getWidthAtCurrent(): number {
    return this.widthAtCurrent;
  }

  /**
   * Sets the current width.
   *
   * @param widthAtCurrent the current width
   */
  public setWidthAtCurrent(widthAtCurrent: number): void {
    this.widthAtCurrent = widthAtCurrent;
  }

  /**
   * Returns the current height.
   *
   * @return the current height
   */
  public getHeightAtCurrent(): number {
    return this.heightAtCurrent;
  }

  /**
   * Sets the current height.
   *
   * @param heightAtCurrent the current height
   */
  public setHeightAtCurrent(heightAtCurrent: number): void {
    this.heightAtCurrent = heightAtCurrent;
  }

  /**
   * Returns the property value. (no information)
   *
   * @return the property value
   */
  public getProperty(): ShapeComponentProperty {
    return this.property;
  }

  /**
   * Returns the rotation angle.
   *
   * @return the rotation angle
   */
  public getRotateAngle(): number {
    return this.rotateAngle;
  }

  /**
   * Sets the rotation angle.
   *
   * @param rotateAngle the rotation angle
   */
  public setRotateAngle(rotateAngle: number): void {
    this.rotateAngle = rotateAngle;
  }

  /**
   * Returns the X coordinate of the rotation center. (object coordinate system)
   *
   * @return the X coordinate of the rotation center
   */
  public getRotateXCenter(): number {
    return this.rotateXCenter;
  }

  /**
   * Sets the X coordinate of the rotation center. (object coordinate system)
   *
   * @param rotateXCenter the X coordinate of the rotation center
   */
  public setRotateXCenter(rotateXCenter: number): void {
    this.rotateXCenter = rotateXCenter;
  }

  /**
   * Returns the Y coordinate of the rotation center. (object coordinate system)
   *
   * @return the Y coordinate of the rotation center
   */
  public getRotateYCenter(): number {
    return this.rotateYCenter;
  }

  /**
   * Sets the Y coordinate of the rotation center.
   *
   * @param rotateYCenter
   */
  public setRotateYCenter(rotateYCenter: number): void {
    this.rotateYCenter = rotateYCenter;
  }

  /**
   * Returns the rendering information object.
   *
   * @return the rendering information object
   */
  public getRenderingInfo(): RenderingInfo {
    return this.renderingInfo;
  }

  /**
   * Sets the matrices to the normal state (not rotated or scaled).
   */
  public setMatrixsNormal(): void {
    this.renderingInfo.getTranslationMatrix().setValue(0, 1.0);
    this.renderingInfo.getTranslationMatrix().setValue(1, 0.0);
    this.renderingInfo.getTranslationMatrix().setValue(2, 0.0);
    this.renderingInfo.getTranslationMatrix().setValue(3, 0.0);
    this.renderingInfo.getTranslationMatrix().setValue(4, 1.0);
    this.renderingInfo.getTranslationMatrix().setValue(5, 0.0);

    const pair: ScaleRotateMatrixPair = this.renderingInfo.addNewScaleRotateMatrixPair();
    pair.getScaleMatrix().setValue(0, 1.0);
    pair.getScaleMatrix().setValue(1, 0.0);
    pair.getScaleMatrix().setValue(2, 0.0);
    pair.getScaleMatrix().setValue(3, 0.0);
    pair.getScaleMatrix().setValue(4, 1.0);
    pair.getScaleMatrix().setValue(5, 0.0);

    pair.getRotateMatrix().setValue(0, 1.0);
    pair.getRotateMatrix().setValue(1, 0.0);
    pair.getRotateMatrix().setValue(2, 0.0);
    pair.getRotateMatrix().setValue(3, 0.0);
    pair.getRotateMatrix().setValue(4, 1.0);
    pair.getRotateMatrix().setValue(5, 0.0);
  }

  /**
   * Returns the object's instance id.
   * @return the object's instance id
   */
  public getInstid(): number {
    return this.instid;
  }

  /**
   * Sets the object's instance id.
   * @param instid the object's instance id
   */
  public setInstid(instid: number): void {
    this.instid = instid;
  }

  public abstract copy(from: ShapeComponent): void;

  public copyShapeComponent(from: ShapeComponent): void {
    this.setGsoId(from.getGsoId());

    this.offsetX = from.offsetX;
    this.offsetY = from.offsetY;
    this.groupingCount = from.groupingCount;
    this.localFileVersion = from.localFileVersion;
    this.widthAtCreate = from.widthAtCreate;
    this.heightAtCreate = from.heightAtCreate;
    this.widthAtCurrent = from.widthAtCurrent;
    this.heightAtCurrent = from.heightAtCurrent;
    this.property.setValue(from.property.getValue());
    this.rotateAngle = from.rotateAngle;
    this.rotateXCenter = from.rotateXCenter;
    this.rotateYCenter = from.rotateYCenter;
    this.renderingInfo.copy(from.renderingInfo);
    this.instid = from.instid;
  }
}
