import type { ArcType } from "./arc/ArcType.js";

/**
 * 호 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentArc`.
 *
 * @author neolord
 */
export class ShapeComponentArc {
  /**
   * 호 테두리 타입
   */
  private arcType: ArcType | null = null;
  /**
   * 타원의 중심 좌표 X값
   */
  private centerX: number = 0;
  /**
   * 타원의 중심 좌표 Y값
   */
  private centerY: number = 0;
  /**
   * 제1축 X좌표 값
   */
  private axis1X: number = 0;
  /**
   * 제1축 Y좌표 값
   */
  private axis1Y: number = 0;
  /**
   * 제2축 X좌표 값
   */
  private axis2X: number = 0;
  /**
   * 제2축 Y좌표 값
   */
  private axis2Y: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 호 테두리 타입를 반환한다.
   *
   * @return 호 테두리 타입
   */
  public getArcType(): ArcType | null {
    return this.arcType;
  }

  /**
   * 호 테두리 타입를 설정한다.
   *
   * @param arcType 호 테두리 타입
   */
  public setArcType(arcType: ArcType | null): void {
    this.arcType = arcType;
  }

  /**
   * 타원의 중심 좌표 X값을 반환한다.
   *
   * @return 타원의 중심 좌표 X값
   */
  public getCenterX(): number {
    return this.centerX;
  }

  /**
   * 타원의 중심 좌표 X값을 설정한다.
   *
   * @param centerX 타원의 중심 좌표 X값
   */
  public setCenterX(centerX: number): void {
    this.centerX = centerX;
  }

  /**
   * 타원의 중심 좌표 Y값을 반환한다.
   *
   * @return 타원의 중심 좌표 Y값
   */
  public getCenterY(): number {
    return this.centerY;
  }

  /**
   * 타원의 중심 좌표 Y값을 설정한다.
   *
   * @param centerY 타원의 중심 좌표 Y값
   */
  public setCenterY(centerY: number): void {
    this.centerY = centerY;
  }

  /**
   * 제1축 X좌표 값을 반환한다.
   *
   * @return 제1축 X좌표 값
   */
  public getAxis1X(): number {
    return this.axis1X;
  }

  /**
   * 제1축 X좌표 값을 설정한다.
   *
   * @param axis1X 제1축 X좌표 값
   */
  public setAxis1X(axis1X: number): void {
    this.axis1X = axis1X;
  }

  /**
   * 제1축 Y좌표 값을 반환한다.
   *
   * @return 제1축 Y좌표 값
   */
  public getAxis1Y(): number {
    return this.axis1Y;
  }

  /**
   * 제1축 Y좌표 값을 설정한다.
   *
   * @param axis1Y 제1축 Y좌표 값
   */
  public setAxis1Y(axis1Y: number): void {
    this.axis1Y = axis1Y;
  }

  /**
   * 제2축 X좌표 값을 반환한다.
   *
   * @return 제2축 X좌표 값
   */
  public getAxis2X(): number {
    return this.axis2X;
  }

  /**
   * 제2축 X좌표 값을 설정한다.
   *
   * @param axis2X 제2축 X좌표 값
   */
  public setAxis2X(axis2X: number): void {
    this.axis2X = axis2X;
  }

  /**
   * 제2축 Y좌표 값을 반환한다.
   *
   * @return 제2축 Y좌표 값
   */
  public getAxis2Y(): number {
    return this.axis2Y;
  }

  /**
   * 제2축 Y좌표 값을 설정한다.
   *
   * @param axis2Y 제2축 Y좌표 값
   */
  public setAxis2Y(axis2Y: number): void {
    this.axis2Y = axis2Y;
  }

  public copy(from: ShapeComponentArc): void {
    this.arcType = from.arcType;
    this.centerX = from.centerX;
    this.centerY = from.centerY;
    this.axis1X = from.axis1X;
    this.axis1Y = from.axis1Y;
    this.axis2X = from.axis2X;
    this.axis2Y = from.axis2Y;
  }
}
