/**
 * Soft edge effect property.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.SoftEdgeEffect`.
 *
 * @author neolord
 */
export class SoftEdgeEffect {
  /**
   * Radius
   */
  private radius = 0;

  /**
   * Constructor
   */
  public constructor() {}

  /**
   * Returns the soft edge radius.
   *
   * @return the soft edge radius
   */
  public getRadius(): number {
    return this.radius;
  }

  /**
   * Sets the soft edge radius.
   *
   * @param radius the soft edge radius
   */
  public setRadius(radius: number): void {
    this.radius = radius;
  }

  public copy(from: SoftEdgeEffect): void {
    this.radius = from.radius;
  }
}
