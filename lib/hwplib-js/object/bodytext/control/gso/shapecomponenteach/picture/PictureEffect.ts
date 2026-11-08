import { PictureEffectProperty } from "./PictureEffectProperty.js";
import { ShadowEffect } from "./ShadowEffect.js";
import { NeonEffect } from "./NeonEffect.js";
import { SoftEdgeEffect } from "./SoftEdgeEffect.js";
import { ReflectionEffect } from "./ReflectionEffect.js";

/**
 * Picture effect.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.PictureEffect`.
 *
 * @author neolord
 */
export class PictureEffect {
  /**
   * Property
   */
  private property: PictureEffectProperty;
  /**
   * Shadow effect
   */
  private shadowEffect: ShadowEffect | null = null;
  /**
   * Neon effect
   */
  private neonEffect: NeonEffect | null = null;
  /**
   * Soft edge effect
   */
  private softEdgeEffect: SoftEdgeEffect | null = null;
  /**
   * Reflection effect
   */
  private reflectionEffect: ReflectionEffect | null = null;

  /**
   * Constructor
   */
  public constructor() {
    this.property = new PictureEffectProperty();
  }

  /**
   * Returns the property object.
   *
   * @return the property object
   */
  public getProperty(): PictureEffectProperty {
    return this.property;
  }

  /**
   * Creates the shadow effect object.
   */
  public createShadowEffect(): void {
    this.shadowEffect = new ShadowEffect();
  }

  /**
   * Deletes the shadow effect object.
   */
  public deleteShadowEffect(): void {
    this.shadowEffect = null;
  }

  /**
   * Returns the shadow effect object.
   *
   * @return the shadow effect object
   */
  public getShadowEffect(): ShadowEffect | null {
    return this.shadowEffect;
  }

  /**
   * Creates the neon effect object.
   */
  public createNeonEffect(): void {
    this.neonEffect = new NeonEffect();
  }

  /**
   * Deletes the neon effect object.
   */
  public deleteNeonEffect(): void {
    this.neonEffect = null;
  }

  /**
   * Returns the neon effect object.
   *
   * @return the neon effect object
   */
  public getNeonEffect(): NeonEffect | null {
    return this.neonEffect;
  }

  /**
   * Creates the soft edge effect object.
   */
  public createSoftEdgeEffect(): void {
    this.softEdgeEffect = new SoftEdgeEffect();
  }

  /**
   * Deletes the soft edge effect object.
   */
  public deleteSoftEdgeEffect(): void {
    this.softEdgeEffect = null;
  }

  /**
   * Returns the soft edge effect object.
   *
   * @return the soft edge effect object
   */
  public getSoftEdgeEffect(): SoftEdgeEffect | null {
    return this.softEdgeEffect;
  }

  /**
   * Creates the reflection effect object.
   */
  public createReflectionEffect(): void {
    this.reflectionEffect = new ReflectionEffect();
  }

  /**
   * Deletes the reflection effect object.
   */
  public deleteReflectionEffect(): void {
    this.reflectionEffect = null;
  }

  /**
   * Returns the reflection effect object.
   *
   * @return the reflection effect object
   */
  public getReflectionEffect(): ReflectionEffect | null {
    return this.reflectionEffect;
  }

  public copy(from: PictureEffect): void {
    this.property.copy(from.property);

    if (from.shadowEffect != null) {
      this.createShadowEffect();
      this.shadowEffect!.copy(from.shadowEffect);
    } else {
      this.shadowEffect = null;
    }

    if (from.neonEffect != null) {
      this.createNeonEffect();
      this.neonEffect!.copy(from.neonEffect);
    } else {
      this.neonEffect = null;
    }

    if (from.softEdgeEffect != null) {
      this.createSoftEdgeEffect();
      this.softEdgeEffect!.copy(from.softEdgeEffect);
    } else {
      this.softEdgeEffect = null;
    }

    if (from.reflectionEffect != null) {
      this.createReflectionEffect();
      this.reflectionEffect!.copy(from.reflectionEffect);
    } else {
      this.reflectionEffect = null;
    }
  }
}
