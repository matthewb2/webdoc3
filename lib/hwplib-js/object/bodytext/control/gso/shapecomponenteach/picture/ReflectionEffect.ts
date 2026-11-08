/**
 * Reflection effect property.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.ReflectionEffect`.
 *
 * @author neolord
 */
export class ReflectionEffect {
  /**
   * Reflection style (no information)
   */
  private style = 0;
  /**
   * Radius
   */
  private radius = 0;
  /**
   * Direction
   */
  private direction = 0;
  /**
   * Distance
   */
  private distance = 0;
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
   * Rotation style (no information)
   */
  private rotationStyle = 0;
  /**
   * Start transparency
   */
  private startTransparency = 0;
  /**
   * Start position
   */
  private startPosition = 0;
  /**
   * End transparency
   */
  private endTransparency = 0;
  /**
   * End position
   */
  private endPosition = 0;
  /**
   * Offset direction
   */
  private offsetDirection = 0;

  /**
   * Constructor
   */
  public constructor() {}

  /**
   * Returns the reflection style. (no information)
   *
   * @return the reflection style
   */
  public getStyle(): number {
    return this.style;
  }

  /**
   * Sets the reflection style. (no information)
   *
   * @param style the reflection style
   */
  public setStyle(style: number): void {
    this.style = style;
  }

  /**
   * Returns the radius.
   *
   * @return the radius
   */
  public getRadius(): number {
    return this.radius;
  }

  /**
   * Sets the radius.
   *
   * @param radius the radius
   */
  public setRadius(radius: number): void {
    this.radius = radius;
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
   * Returns the rotation style. (no information)
   *
   * @return the rotation style
   */
  public getRotationStyle(): number {
    return this.rotationStyle;
  }

  /**
   * Sets the rotation style. (no information)
   *
   * @param rotationStyle the rotation style
   */
  public setRotationStyle(rotationStyle: number): void {
    this.rotationStyle = rotationStyle;
  }

  /**
   * Returns the start transparency.
   *
   * @return the start transparency
   */
  public getStartTransparency(): number {
    return this.startTransparency;
  }

  /**
   * Sets the start transparency.
   *
   * @param startTransparency the start transparency
   */
  public setStartTransparency(startTransparency: number): void {
    this.startTransparency = startTransparency;
  }

  /**
   * Returns the start position.
   *
   * @return the start position
   */
  public getStartPosition(): number {
    return this.startPosition;
  }

  /**
   * Sets the start position.
   *
   * @param startPosition the start position
   */
  public setStartPosition(startPosition: number): void {
    this.startPosition = startPosition;
  }

  /**
   * Returns the end transparency.
   *
   * @return the end transparency
   */
  public getEndTransparency(): number {
    return this.endTransparency;
  }

  /**
   * Sets the end transparency.
   *
   * @param endTransparency the end transparency
   */
  public setEndTransparency(endTransparency: number): void {
    this.endTransparency = endTransparency;
  }

  /**
   * Returns the end position.
   *
   * @return the end position
   */
  public getEndPosition(): number {
    return this.endPosition;
  }

  /**
   * Sets the end position.
   *
   * @param endPosition the end position
   */
  public setEndPosition(endPosition: number): void {
    this.endPosition = endPosition;
  }

  /**
   * Returns the offset direction.
   *
   * @return the offset direction
   */
  public getOffsetDirection(): number {
    return this.offsetDirection;
  }

  /**
   * Sets the offset direction.
   *
   * @param offsetDirection the offset direction
   */
  public setOffsetDirection(offsetDirection: number): void {
    this.offsetDirection = offsetDirection;
  }

  public copy(from: ReflectionEffect): void {
    this.style = from.style;
    this.radius = from.radius;
    this.direction = from.direction;
    this.distance = from.distance;
    this.tiltAngleX = from.tiltAngleX;
    this.tiltAngleY = from.tiltAngleY;
    this.zoomRateX = from.zoomRateX;
    this.zoomRateY = from.zoomRateY;
    this.rotationStyle = from.rotationStyle;
    this.startTransparency = from.startTransparency;
    this.startPosition = from.startPosition;
    this.endTransparency = from.endTransparency;
    this.endPosition = from.endPosition;
    this.offsetDirection = from.offsetDirection;
  }
}
