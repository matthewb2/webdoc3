import { ShapeComponentEllipseProperty } from "./ellipse/ShapeComponentEllipseProperty.js";

/**
 * 타원 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentEllipse`.
 *
 * @author neolord
 */
export class ShapeComponentEllipse {
  /**
   * 속성
   */
  private property: ShapeComponentEllipseProperty;
  /**
   * 중심 좌표의 X값
   */
  private centerX: number = 0;
  /**
   * 중심 좌표의 Y값
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
   * start pos x
   */
  private startX: number = 0;
  /**
   * start pos y
   */
  private startY: number = 0;
  /**
   * end pos x
   */
  private endX: number = 0;
  /**
   * end pos y
   */
  private endY: number = 0;
  /**
   * start pos x2 interval of curve(effective only when it is an arc)
   */
  private startX2: number = 0;
  /**
   * start pos y2
   */
  private startY2: number = 0;
  /**
   * end pos x2
   */
  private endX2: number = 0;
  /**
   * end pos y2
   */
  private endY2: number = 0;

  /**
   * 생성자
   */
  public constructor() {
    this.property = new ShapeComponentEllipseProperty();
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  public getProperty(): ShapeComponentEllipseProperty {
    return this.property;
  }

  /**
   * 중심 좌표의 X값을 반환한다.
   *
   * @return 중심 좌표의 X값
   */
  public getCenterX(): number {
    return this.centerX;
  }

  /**
   * 중심 좌표의 X값을 설정한다.
   *
   * @param centerX 중심 좌표의 X값
   */
  public setCenterX(centerX: number): void {
    this.centerX = centerX;
  }

  /**
   * 중심 좌표의 Y값을 반환한다.
   *
   * @return 중심 좌표의 Y값
   */
  public getCenterY(): number {
    return this.centerY;
  }

  /**
   * 중심 좌표의 Y값을 설정한다.
   *
   * @param centerY 중심 좌표의 Y값
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

  /**
   * start pos x값을 반환한다.
   *
   * @return start pos x값
   */
  public getStartX(): number {
    return this.startX;
  }

  /**
   * start pos x값을 설정한다.
   *
   * @param startX start pos x
   */
  public setStartX(startX: number): void {
    this.startX = startX;
  }

  /**
   * start pos y값을 반환한다.
   *
   * @return start pos y값
   */
  public getStartY(): number {
    return this.startY;
  }

  /**
   * start pos y값을 설정한다.
   *
   * @param startY start pos y값
   */
  public setStartY(startY: number): void {
    this.startY = startY;
  }

  /**
   * end pos x값을 반환한다.
   *
   * @return end pos x값
   */
  public getEndX(): number {
    return this.endX;
  }

  /**
   * end pos x값을 설정한다.
   *
   * @param endX end pos x값
   */
  public setEndX(endX: number): void {
    this.endX = endX;
  }

  /**
   * end pos y값을 반환한다.
   *
   * @return end pos y값
   */
  public getEndY(): number {
    return this.endY;
  }

  /**
   * end pos y값을 설정한다.
   *
   * @param endY end pos y값
   */
  public setEndY(endY: number): void {
    this.endY = endY;
  }

  /**
   * start pos x2값을 반환한다.
   *
   * @return start pos x2값
   */
  public getStartX2(): number {
    return this.startX2;
  }

  /**
   * start pos x2값을 설정한다.
   *
   * @param startX2 start pos x2
   */
  public setStartX2(startX2: number): void {
    this.startX2 = startX2;
  }

  /**
   * start pos y2값을 반환한다.
   *
   * @return start pos y2값
   */
  public getStartY2(): number {
    return this.startY2;
  }

  /**
   * start pos y2값을 설정한다.
   *
   * @param startY2 start pos y2
   */
  public setStartY2(startY2: number): void {
    this.startY2 = startY2;
  }

  /**
   * end pos x2값을 반환한다.
   *
   * @return end pos x2값
   */
  public getEndX2(): number {
    return this.endX2;
  }

  /**
   * end pos x2값을 설정한다.
   *
   * @param endX2 end pos x2값
   */
  public setEndX2(endX2: number): void {
    this.endX2 = endX2;
  }

  /**
   * end pos y2값을 반환한다.
   *
   * @return end pos y2값
   */
  public getEndY2(): number {
    return this.endY2;
  }

  /**
   * end pos y2값을 설정한다.
   *
   * @param endY2 end pos y2값
   */
  public setEndY2(endY2: number): void {
    this.endY2 = endY2;
  }

  public copy(from: ShapeComponentEllipse): void {
    this.property.copy(from.property);
    this.centerX = from.centerX;
    this.centerY = from.centerY;
    this.axis1X = from.axis1X;
    this.axis1Y = from.axis1Y;
    this.axis2X = from.axis2X;
    this.axis2Y = from.axis2Y;
    this.startX = from.startX;
    this.startY = from.startY;
    this.endX = from.endX;
    this.endY = from.endY;
    this.startX2 = from.startX2;
    this.startY2 = from.startY2;
    this.endX2 = from.endX2;
    this.endY2 = from.endY2;
  }
}
