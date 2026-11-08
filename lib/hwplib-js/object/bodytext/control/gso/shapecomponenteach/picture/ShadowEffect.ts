import { ColorWithEffect } from "./ColorWithEffect.js";

/**
 * Shadow effect property.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.ShadowEffect`.
 *
 * @author neolord
 */
export class ShadowEffect {
  /**
   * Shadow style (no information)
   */
  private style = 0;
  /**
   * Shadow transparency
   */
  private transparency = 0;
  /**
   * Shadow cloudiness
   */
  private cloudy = 0;
  /**
   * Direction
   */
  private direction = 0;
  /**
   * Distance
   */
  private distance = 0;
  /**
   * Sort (no information)
   */
  private sort = 0;
  /**
   * Tilt angle on the x axis
   */
  private tiltAngleX = 0;
  /**
   * Tilt angle on the y axis
   */
  private tiltAngleY = 0;
  /**
   * Zoom rate on the x axis
   */
  private zoomRateX = 0;
  /**
   * Zoom rate on the y axis
   */
  private zoomRateY = 0;
  /**
   * Rotate shadow together with the shape
   */
  private rotateWithShape = 0;
  /**
   * Shadow color
   */
  private color: ColorWithEffect;

  /**
   * Constructor
   */
  public constructor() {
    this.color = new ColorWithEffect();
  }

  /**
   * Returns the shadow style. (no information)
   *
   * @return the shadow style
   */
  public getStyle(): number {
    return this.style;
  }

  /**
   * Sets the shadow style.
   *
   * @param style the shadow style
   */
  public setStyle(style: number): void {
    this.style = style;
  }

  /**
   * Returns the shadow transparency.
   *
   * @return the shadow transparency
   */
  public getTransparency(): number {
    return this.transparency;
  }

  /**
   * Sets the shadow transparency.
   *
   * @param transparency the shadow transparency
   */
  public setTransparency(transparency: number): void {
    this.transparency = transparency;
  }

  /**
   * Returns the shadow cloudiness.
   *
   * @return the shadow cloudiness
   */
  public getCloudy(): number {
    return this.cloudy;
  }

  /**
   * Sets the shadow cloudiness.
   *
   * @param cloudy the shadow cloudiness
   */
  public setCloudy(cloudy: number): void {
    this.cloudy = cloudy;
  }

  /**
   * Returns the direction.
   *
   * @return the direction
   */
  public getDirection(): number {
    return this.direction;
  }

  /**
   * Sets the direction.
   *
   * @param direction the direction
   */
  public setDirection(direction: number): void {
    this.direction = direction;
  }

  /**
   * Returns the distance.
   *
   * @return the distance
   */
  public getDistance(): number {
    return this.distance;
  }

  /**
   * Sets the distance.
   *
   * @param distance the distance
   */
  public setDistance(distance: number): void {
    this.distance = distance;
  }

  /**
   * Returns the sort method. (no information)
   *
   * @return the sort method
   */
  public getSort(): number {
    return this.sort;
  }

  /**
   * Sets the sort method.
   *
   * @param sort the sort method
   */
  public setSort(sort: number): void {
    this.sort = sort;
  }

  /**
   * Returns the tilt angle on the x axis.
   *
   * @return the tilt angle on the x axis
   */
  public getTiltAngleX(): number {
    return this.tiltAngleX;
  }

  /**
   * Sets the tilt angle on the x axis.
   *
   * @param tiltAngleX the tilt angle on the x axis
   */
  public setTiltAngleX(tiltAngleX: number): void {
    this.tiltAngleX = tiltAngleX;
  }

  /**
   * Returns the tilt angle on the y axis.
   *
   * @return the tilt angle on the y axis
   */
  public getTiltAngleY(): number {
    return this.tiltAngleY;
  }

  /**
   * Sets the tilt angle on the y axis.
   *
   * @param tiltAngleY the tilt angle on the y axis
   */
  public setTiltAngleY(tiltAngleY: number): void {
    this.tiltAngleY = tiltAngleY;
  }

  /**
   * Returns the zoom rate on the x axis.
   *
   * @return the zoom rate on the x axis
   */
  public getZoomRateX(): number {
    return this.zoomRateX;
  }

  /**
   * Sets the zoom rate on the x axis.
   *
   * @param zoomRateX the zoom rate on the x axis
   */
  public setZoomRateX(zoomRateX: number): void {
    this.zoomRateX = zoomRateX;
  }

  /**
   * Returns the zoom rate on the y axis.
   *
   * @return the zoom rate on the y axis
   */
  public getZoomRateY(): number {
    return this.zoomRateY;
  }

  /**
   * Sets the zoom rate on the y axis.
   *
   * @param zoomRateY the zoom rate on the y axis
   */
  public setZoomRateY(zoomRateY: number): void {
    this.zoomRateY = zoomRateY;
  }

  /**
   * Returns whether the shadow rotates together with the shape (?).
   *
   * @return whether the shadow rotates together with the shape
   */
  public getRotateWithShape(): number {
    return this.rotateWithShape;
  }

  /**
   * Sets whether the shadow rotates together with the shape (?).
   *
   * @param rotateWithShape whether the shadow rotates together with the shape
   */
  public setRotateWithShape(rotateWithShape: number): void {
    this.rotateWithShape = rotateWithShape;
  }

  /**
   * Returns the shadow color object.
   *
   * @return the shadow color object
   */
  public getColor(): ColorWithEffect {
    return this.color;
  }

  public copy(from: ShadowEffect): void {
    this.style = from.style;
    this.transparency = from.transparency;
    this.cloudy = from.cloudy;
    this.direction = from.direction;
    this.distance = from.distance;
    this.sort = from.sort;
    this.tiltAngleX = from.tiltAngleX;
    this.tiltAngleY = from.tiltAngleY;
    this.zoomRateX = from.zoomRateX;
    this.zoomRateY = from.zoomRateY;
    this.rotateWithShape = from.rotateWithShape;
    this.color.copy(from.color);
  }
}
