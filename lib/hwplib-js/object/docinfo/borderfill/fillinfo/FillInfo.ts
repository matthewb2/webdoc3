import { FillType } from "./FillType.js";
import { PatternFill } from "./PatternFill.js";
import { GradientFill } from "./GradientFill.js";
import { ImageFill } from "./ImageFill.js";

/**
 * 채우기 정보를 나태내는 객체
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.FillInfo`.
 *
 * @author neolord
 */
export class FillInfo {
  /**
   * 채우기 종류
   */
  private type: FillType;
  /**
   * 단색 채우기
   */
  private patternFill: PatternFill | null = null;
  /**
   * 그러데이션 채우기
   */
  private gradientFill: GradientFill | null = null;
  /**
   * 이미지 채우기
   */
  private imageFill: ImageFill | null = null;

  /**
   * 생성자
   */
  public constructor() {
    this.type = new FillType();
  }

  /**
   * 채우기 종류 객체를 반환한다.
   *
   * @return 채우기 종류 객체
   */
  public getType(): FillType {
    return this.type;
  }

  /**
   * 단색 채우기 객체를 생성한다.
   */
  public createPatternFill(): void {
    this.patternFill = new PatternFill();
  }

  /**
   * 단색 채우기 객체를 삭제한다.
   */
  public deletePatternFill(): void {
    this.patternFill = null;
  }

  /**
   * 단색 채우기 객체를 반환한다.
   *
   * @return 단색 채우기 객체
   */
  public getPatternFill(): PatternFill | null {
    return this.patternFill;
  }

  /**
   * 그러데이션 채우기 객체를 생성한다.
   */
  public createGradientFill(): void {
    this.gradientFill = new GradientFill();
  }

  /**
   * 그러데이션 채우기 객체를 삭제한다.
   */
  public deleteGradientFill(): void {
    this.gradientFill = null;
  }

  /**
   * 그러데이션 채우기 객체를 반환한다.
   *
   * @return 그러데이션 채우기 객체
   */
  public getGradientFill(): GradientFill | null {
    return this.gradientFill;
  }

  /**
   * 이미지 채우기 객체를 생성한다.
   */
  public createImageFill(): void {
    this.imageFill = new ImageFill();
  }

  /**
   * 이미지 채우기 객체를 삭제한다.
   */
  public deleteImageFill(): void {
    this.imageFill = null;
  }

  /**
   * 이미지 채우기 객체를 반환한다.
   *
   * @return 이미지 채우기 객체
   */
  public getImageFill(): ImageFill | null {
    return this.imageFill;
  }

  public copy(from: FillInfo): void {
    this.type.copy(from.type);

    if (from.patternFill !== null) {
      this.createPatternFill();
      this.patternFill!.copy(from.patternFill);
    } else {
      this.deletePatternFill();
    }

    if (from.gradientFill !== null) {
      this.createGradientFill();
      this.gradientFill!.copy(from.gradientFill);
    } else {
      this.deleteGradientFill();
    }
    if (from.imageFill !== null) {
      this.createImageFill();
      this.imageFill!.copy(from.imageFill);
    } else {
      this.deleteImageFill();
    }
  }
}
