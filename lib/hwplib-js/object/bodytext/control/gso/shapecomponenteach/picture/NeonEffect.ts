import { ColorWithEffect } from "./ColorWithEffect.js";

/**
 * Neon effect property.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.NeonEffect`.
 *
 * @author neolord
 */
export class NeonEffect {
  /**
   * Neon transparency
   */
  private transparency = 0;
  /**
   * Neon radius
   */
  private radius = 0;
  /**
   * Neon color
   */
  private color: ColorWithEffect;

  /**
   * Constructor
   */
  public constructor() {
    this.color = new ColorWithEffect();
  }

  /**
   * Returns the neon transparency.
   *
   * @return the neon transparency
   */
  public getTransparency(): number {
    return this.transparency;
  }

  /**
   * Sets the neon transparency.
   *
   * @param transparency the neon transparency
   */
  public setTransparency(transparency: number): void {
    this.transparency = transparency;
  }

  /**
   * Returns the neon radius.
   *
   * @return the neon radius
   */
  public getRadius(): number {
    return this.radius;
  }

  /**
   * Sets the neon radius.
   *
   * @param radius the neon radius
   */
  public setRadius(radius: number): void {
    this.radius = radius;
  }

  /**
   * Returns the neon color object.
   *
   * @return the neon color object
   */
  public getColor(): ColorWithEffect {
    return this.color;
  }

  public copy(from: NeonEffect): void {
    this.transparency = from.transparency;
    this.radius = from.radius;
    this.color.copy(from.color);
  }
}
