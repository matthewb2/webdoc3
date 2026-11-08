import { LineInfoProperty } from "../shapecomponent/lineinfo/LineInfoProperty.js";
import { InnerMargin } from "./picture/InnerMargin.js";
import { PictureEffect } from "./picture/PictureEffect.js";
import { PositionXY } from "./polygon/PositionXY.js";
import { PictureInfo } from "../../../../docinfo/borderfill/fillinfo/PictureInfo.js";
import { Color4Byte } from "../../../../etc/Color4Byte.js";

/**
 * 그림 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentPicture`.
 *
 * @author neolord
 */
export class ShapeComponentPicture {
  /**
   * 테두리 색
   */
  private borderColor: Color4Byte;
  /**
   * 테두리 두꼐
   */
  private borderThickness: number = 0;
  /**
   * 테두리 속성
   */
  private borderProperty: LineInfoProperty;
  /**
   * left,top 좌표
   */
  private leftTop: PositionXY;
  /**
   * right,top 좌표
   */
  private rightTop: PositionXY;
  /**
   * left, bottom 좌표
   */
  private leftBottom: PositionXY;
  /**
   * right, bottom 좌표
   */
  private rightBottom: PositionXY;
  /**
   * 자르기 한 후 사각형의 left좌표
   */
  private leftAfterCutting: number = 0;
  /**
   * 자르기 한 후 사각형의 top좌표
   */
  private topAfterCutting: number = 0;
  /**
   * 자르기 한 후 사각형의 right좌표
   */
  private rightAfterCutting: number = 0;
  /**
   * 자르기 한 후 사각형의 bottom좌표
   */
  private bottomAfterCutting: number = 0;
  /**
   * 안쪽 여백 정보
   */
  private innerMargin: InnerMargin;
  /**
   * 그림 정보
   */
  private pictureInfo: PictureInfo;
  /**
   * 테두리 투명도
   */
  private borderTransparency: number = 0;
  /**
   * 문서 내 각 개체에 대한 고유 아이디
   */
  private instanceId: number = 0;
  /**
   * 그림 효과 정보
   */
  private pictureEffect: PictureEffect;
  /**
   * 이미지 너비 (??)
   */
  private imageWidth: number = 0;
  /**
   * 이미지 높이 (??)
   */
  private imageHeight: number = 0;

  /**
   * 생성자
   */
  public constructor() {
    this.borderColor = new Color4Byte();
    this.borderProperty = new LineInfoProperty();
    this.leftTop = new PositionXY();
    this.rightTop = new PositionXY();
    this.leftBottom = new PositionXY();
    this.rightBottom = new PositionXY();
    this.innerMargin = new InnerMargin();
    this.pictureInfo = new PictureInfo();
    this.pictureEffect = new PictureEffect();
  }

  /**
   * 테두리 색상 객체를 반환한다.
   *
   * @return 테두리 색상 객체
   */
  public getBorderColor(): Color4Byte {
    return this.borderColor;
  }

  /**
   * 테두리 두꼐를 반환한다.
   *
   * @return 테두리 두꼐
   */
  public getBorderThickness(): number {
    return this.borderThickness;
  }

  /**
   * 테두리 두꼐를 설정한다.
   *
   * @param borderThickness 테두리 두꼐
   */
  public setBorderThickness(borderThickness: number): void {
    this.borderThickness = borderThickness;
  }

  /**
   * 테두리 선의 속성 객체를 반환한다.
   *
   * @return 테두리 선의 속성 객체
   */
  public getBorderProperty(): LineInfoProperty {
    return this.borderProperty;
  }

  /**
   * left,top 좌표 객체를 반환한다.
   *
   * @return left, top 좌표 객체
   */
  public getLeftTop(): PositionXY {
    return this.leftTop;
  }

  /**
   * right,top 좌표 객체를 반환한다.
   *
   * @return right, top 좌표 객체
   */
  public getRightTop(): PositionXY {
    return this.rightTop;
  }

  /**
   * left, bottom 좌표 객체를 반환한다.
   *
   * @return left, bottom 좌표 객체
   */
  public getLeftBottom(): PositionXY {
    return this.leftBottom;
  }

  /**
   * right, bottom 좌표 객체를 반환한다.
   *
   * @return right, bottom 좌표 객체
   */
  public getRightBottom(): PositionXY {
    return this.rightBottom;
  }

  /**
   * 자르기 한 후 사각형의 left좌표를 반환한다.
   *
   * @return 자르기 한 후 사각형의 left좌표
   */
  public getLeftAfterCutting(): number {
    return this.leftAfterCutting;
  }

  /**
   * 자르기 한 후 사각형의 left좌표를 설정한다.
   *
   * @param leftAfterCutting 자르기 한 후 사각형의 left좌표
   */
  public setLeftAfterCutting(leftAfterCutting: number): void {
    this.leftAfterCutting = leftAfterCutting;
  }

  /**
   * 자르기 한 후 사각형의 top좌표를 반환한다.
   *
   * @return 자르기 한 후 사각형의 top좌표
   */
  public getTopAfterCutting(): number {
    return this.topAfterCutting;
  }

  /**
   * 자르기 한 후 사각형의 top좌표를 설정한다.
   *
   * @param topAfterCutting 자르기 한 후 사각형의 top좌표
   */
  public setTopAfterCutting(topAfterCutting: number): void {
    this.topAfterCutting = topAfterCutting;
  }

  /**
   * 자르기 한 후 사각형의 right좌표를 반환한다.
   *
   * @return 자르기 한 후 사각형의 right좌표
   */
  public getRightAfterCutting(): number {
    return this.rightAfterCutting;
  }

  /**
   * 자르기 한 후 사각형의 right좌표를 설정한다.
   *
   * @param rightAfterCutting 자르기 한 후 사각형의 right좌표
   */
  public setRightAfterCutting(rightAfterCutting: number): void {
    this.rightAfterCutting = rightAfterCutting;
  }

  /**
   * 자르기 한 후 사각형의 bottom좌표를 반환한다.
   *
   * @return 자르기 한 후 사각형의 bottom좌표
   */
  public getBottomAfterCutting(): number {
    return this.bottomAfterCutting;
  }

  /**
   * 자르기 한 후 사각형의 bottom좌표를 설정한다.
   *
   * @param bottomAfterCutting 자르기 한 후 사각형의 bottom좌표
   */
  public setBottomAfterCutting(bottomAfterCutting: number): void {
    this.bottomAfterCutting = bottomAfterCutting;
  }

  /**
   * 안쪽 여백 정보 객체를 반환한다.
   *
   * @return 안쪽 여백 정보 객체
   */
  public getInnerMargin(): InnerMargin {
    return this.innerMargin;
  }

  /**
   * 그림 정보 객체를 반환한다.
   *
   * @return 그림 정보 객체
   */
  public getPictureInfo(): PictureInfo {
    return this.pictureInfo;
  }

  /**
   * 테두리 투명도를 반환한다.
   *
   * @return 테두리 투명도
   */
  public getBorderTransparency(): number {
    return this.borderTransparency;
  }

  /**
   * 테두리 투명도를 설정한다.
   *
   * @param borderTransparency 테두리 투명도
   */
  public setBorderTransparency(borderTransparency: number): void {
    this.borderTransparency = borderTransparency;
  }

  /**
   * 문서 내 각 개체에 대한 고유 아이디를 반환한다.
   *
   * @return 문서 내 각 개체에 대한 고유 아이디
   */
  public getInstanceId(): number {
    return this.instanceId;
  }

  /**
   * 문서 내 각 개체에 대한 고유 아이디를 설정한다.
   *
   * @param instanceId 문서 내 각 개체에 대한 고유 아이디
   */
  public setInstanceId(instanceId: number): void {
    this.instanceId = instanceId;
  }

  /**
   * 그림 효과 정보 객체를 반환한다.
   *
   * @return 그림 효과 정보 객체
   */
  public getPictureEffect(): PictureEffect {
    return this.pictureEffect;
  }

  /**
   * 이미지 폭을 반환한다.(??)
   *
   * @return 이미지 폭
   */
  public getImageWidth(): number {
    return this.imageWidth;
  }

  /**
   * 이미지 폭을 설정한다. (??)
   *
   * @param imageWidth 이미지 폭
   */
  public setImageWidth(imageWidth: number): void {
    this.imageWidth = imageWidth;
  }

  /**
   * 이미지 높이를 반환한다. (??)
   *
   * @return 이미지 높이
   */
  public getImageHeight(): number {
    return this.imageHeight;
  }

  /**
   * 이미지 높이를 설정한다. (??)
   *
   * @param imageHeight 이미지 높이
   */
  public setImageHeight(imageHeight: number): void {
    this.imageHeight = imageHeight;
  }

  public copy(from: ShapeComponentPicture): void {
    this.borderColor.copy(from.borderColor);
    this.borderThickness = from.borderThickness;
    this.borderProperty.copy(from.borderProperty);
    this.leftTop.copy(from.leftTop);
    this.rightTop.copy(from.rightTop);
    this.leftBottom.copy(from.leftBottom);
    this.rightBottom.copy(from.rightBottom);
    this.leftAfterCutting = from.leftAfterCutting;
    this.topAfterCutting = from.topAfterCutting;
    this.rightAfterCutting = from.rightAfterCutting;
    this.bottomAfterCutting = from.bottomAfterCutting;
    this.innerMargin.copy(from.innerMargin);
    this.pictureInfo.copy(from.pictureInfo);
    this.borderTransparency = from.borderTransparency;
    this.instanceId = from.instanceId;
    this.pictureEffect.copy(from.pictureEffect);
    this.imageWidth = from.imageWidth;
    this.imageHeight = from.imageHeight;
  }
}
