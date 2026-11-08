import { Color4Byte } from "../../../etc/Color4Byte.js";
import type { GradientType } from "./GradientType.js";

/**
 * 그러데이션 채우기 객체
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.GradientFill`.
 *
 * @author neolord
 */
export class GradientFill {
  /**
   * 그러데이션 유형
   */
  private gradientType: GradientType | null = null;
  /**
   * 그러데이션의 기울임 (문서 오류 : 4byte)
   */
  private startAngle: number = 0;
  /**
   * 그러데이션의 가로 중심 (문서 오류 : 4byte)
   */
  private centerX: number = 0;
  /**
   * 그러데이션의 세로 중심 (문서 오류 : 4byte)
   */
  private centerY: number = 0;
  /**
   * 그러데이션 번짐 정도(0 -100) (문서 오류 : 4byte)
   */
  private blurringDegree: number = 0;
  /**
   * 색상이 바뀌는 곳의 위치 리스트 (num > 2 일 경우에만)
   */
  private changePointList: number[];
  /**
   * 색상 리스트
   */
  private colorList: Color4Byte[];
  /**
   * 번짐 중심 (추가 속성)
   */
  private blurringCenter: number = 0;

  /**
   * 생성자
   */
  public constructor() {
    this.changePointList = [];
    this.colorList = [];
  }

  /**
   * 그러데이션 유형을 반환한다.
   *
   * @return 그러데이션 유형
   */
  public getGradientType(): GradientType | null {
    return this.gradientType;
  }

  /**
   * 그러데이션 유형을 설정한다.
   *
   * @param gradientType 그러데이션 유형
   */
  public setGradientType(gradientType: GradientType): void {
    this.gradientType = gradientType;
  }

  /**
   * 그러데이션의 기울임을 반환한다.
   *
   * @return 그러데이션의 기울임
   */
  public getStartAngle(): number {
    return this.startAngle;
  }

  /**
   * 그러데이션의 기울임를 설정한다.
   *
   * @param startAngle 그러데이션의 기울임
   */
  public setStartAngle(startAngle: number): void {
    this.startAngle = startAngle;
  }

  /**
   * 그러데이션의 가로 중심를 반황한다.
   *
   * @return 그러데이션의 가로 중심
   */
  public getCenterX(): number {
    return this.centerX;
  }

  /**
   * 그러데이션의 가로 중심를 설정한다.
   *
   * @param centerX 그러데이션의 가로 중심
   */
  public setCenterX(centerX: number): void {
    this.centerX = centerX;
  }

  /**
   * 그러데이션의 세로 중심을 반환한다.
   *
   * @return 그러데이션의 세로 중심
   */
  public getCenterY(): number {
    return this.centerY;
  }

  /**
   * 그러데이션의 세로 중심을 설정한다.
   *
   * @param centerY 그러데이션의 세로 중심
   */
  public setCenterY(centerY: number): void {
    this.centerY = centerY;
  }

  /**
   * 그러데이션 번짐 정도을 반환한다.
   *
   * @return 그러데이션 번짐 정도
   */
  public getBlurringDegree(): number {
    return this.blurringDegree;
  }

  /**
   * 그러데이션 번짐 정도를 설정한다.
   *
   * @param blurringDegree 그러데이션 번짐 정도
   */
  public setBlurringDegree(blurringDegree: number): void {
    this.blurringDegree = blurringDegree;
  }

  /**
   * 색상이 바뀌는 곳의 위치를 추가한다.
   *
   * @param changePoint 색상이 바뀌는 곳의 위치
   */
  public addChangePoint(changePoint: number): void {
    this.changePointList.push(changePoint);
  }

  /**
   * 색상이 바뀌는 곳의 위치 리스트를 반환한다.
   *
   * @return 색상이 바뀌는 곳의 위치 리스트
   */
  public getChangePointList(): number[] {
    return this.changePointList;
  }

  /**
   * 새로운 색상 객체를 생성하고 색상 리스트에 추가한다.
   *
   * @return 새로 생성된 색상 객체
   */
  public addNewColor(): Color4Byte {
    const c = new Color4Byte();
    this.colorList.push(c);
    return c;
  }

  /**
   * 색상 리스트를 반환한다.
   *
   * @return 색상 리스트
   */
  public getColorList(): Color4Byte[] {
    return this.colorList;
  }

  /**
   * 번짐 중심을 반환한다.
   *
   * @return 번짐 중심
   */
  public getBlurringCenter(): number {
    return this.blurringCenter;
  }

  /**
   * 번짐 중심을 설정한다.
   *
   * @param blurringCenter 번짐 중심
   */
  public setBlurringCenter(blurringCenter: number): void {
    this.blurringCenter = blurringCenter;
  }

  public copy(from: GradientFill): void {
    this.gradientType = from.gradientType;
    this.startAngle = from.startAngle;
    this.centerX = from.centerX;
    this.centerY = from.centerY;
    this.blurringDegree = from.blurringDegree;

    this.changePointList.length = 0;
    for (const integer of from.changePointList) {
      this.changePointList.push(integer);
    }

    this.colorList.length = 0;
    for (const color4Byte of from.colorList) {
      this.colorList.push(color4Byte.clone());
    }

    this.blurringCenter = from.blurringCenter;
  }
}
