import { PositionXY } from "./polygon/PositionXY.js";
import type { TextArtAlign } from "./textart/TextArtAlign.js";
import type { TextArtShape } from "./textart/TextArtShape.js";
import type { FontType } from "../../../../docinfo/facename/FontType.js";
import { Color4Byte } from "../../../../etc/Color4Byte.js";
import { HWPString } from "../../../../etc/HWPString.js";

/**
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentTextArt`.
 */
export class ShapeComponentTextArt {
  /**
   * x1
   */
  private x1: number = 0;
  /**
   * y1
   */
  private y1: number = 0;
  /**
   * x2
   */
  private x2: number = 0;
  /**
   * y2
   */
  private y2: number = 0;
  /**
   * x3
   */
  private x3: number = 0;
  /**
   * y3
   */
  private y3: number = 0;
  /**
   * x4
   */
  private x4: number = 0;
  /**
   * y4
   */
  private y4: number = 0;
  /**
   * 내용
   */
  private content: HWPString;
  /**
   * 글꼴이름
   */
  private fontName: HWPString;
  /**
   * 글꼴스타일
   */
  private fontStyle: HWPString;
  /**
   * 글꼴 타입
   */
  private fontType: FontType | null = null;
  /**
   * 글맵시 모양
   */
  private textArtShape: TextArtShape | null = null;
  /**
   * 줄 간격
   */
  private lineSpace: number = 0;
  /**
   * 글자 간격
   */
  private charSpace: number = 0;
  /**
   * 문단 정렬
   */
  private paraAlignment: TextArtAlign | null = null;
  /**
   * 그림자 타입 = 0: 없음, 1:비연속
   */
  private shadowType: number = 0;
  /**
   * 그림자 x offset
   */
  private shadowOffsetX: number = 0;
  /**
   * 그림자 y offset
   */
  private shadowOffsetY: number = 0;
  /**
   * 그림자 색상
   */
  private shadowColor: Color4Byte;
  /**
   * outline list ??
   */
  private outlinePointList: PositionXY[];

  public constructor() {
    this.content = new HWPString();
    this.fontName = new HWPString();
    this.fontStyle = new HWPString();
    this.shadowColor = new Color4Byte();
    this.outlinePointList = [];
  }

  /**
   * x1 값을 반환한다.
   *
   * @return x1 값
   */
  public getX1(): number {
    return this.x1;
  }

  /**
   * x1 값을 설정한다.
   *
   * @param x1 x1 값
   */
  public setX1(x1: number): void {
    this.x1 = x1;
  }

  /**
   * y1 값을 반환한다.
   *
   * @return y1 값
   */
  public getY1(): number {
    return this.y1;
  }

  /**
   * y1 값을 설정한다.
   *
   * @param y1 y1 값
   */
  public setY1(y1: number): void {
    this.y1 = y1;
  }

  /**
   * x2 값을 반환한다.
   *
   * @return x2 값
   */
  public getX2(): number {
    return this.x2;
  }

  /**
   * x2 값을 설정한다.
   *
   * @param x2 x2 값
   */
  public setX2(x2: number): void {
    this.x2 = x2;
  }

  /**
   * y2 값을 반환한다.
   *
   * @return y2 값
   */
  public getY2(): number {
    return this.y2;
  }

  /**
   * y2 값을 설정한다.
   *
   * @param y2 y2 값
   */
  public setY2(y2: number): void {
    this.y2 = y2;
  }

  /**
   * x3 값을 반환한다.
   *
   * @return x3 값
   */
  public getX3(): number {
    return this.x3;
  }

  /**
   * x3 값을 설정한다.
   *
   * @param x3 x3 값
   */
  public setX3(x3: number): void {
    this.x3 = x3;
  }

  /**
   * y3 값을 반환한다.
   *
   * @return y3 값
   */
  public getY3(): number {
    return this.y3;
  }

  /**
   * y3 값을 설정한다.
   *
   * @param y3 y3 값
   */
  public setY3(y3: number): void {
    this.y3 = y3;
  }

  /**
   * x4 값을 반환한다.
   *
   * @return x4 값
   */
  public getX4(): number {
    return this.x4;
  }

  /**
   * x4 값을 설정한다.
   *
   * @param x4 x4 값
   */
  public setX4(x4: number): void {
    this.x4 = x4;
  }

  /**
   * y4 값을 반환한다.
   *
   * @return y4 값
   */
  public getY4(): number {
    return this.y4;
  }

  /**
   * y4 값을 설정한다.
   *
   * @param y4 y4 값
   */
  public setY4(y4: number): void {
    this.y4 = y4;
  }

  /**
   * 내용을 반환한다.
   *
   * @return 내용
   */
  public getContent(): HWPString {
    return this.content;
  }

  /**
   * 글꼴 이름을 반환한다.
   *
   * @return 글꼴 이름
   */
  public getFontName(): HWPString {
    return this.fontName;
  }

  /**
   * 글꼴 스타일을 반환한다.
   *
   * @return 글꼴 스타일
   */
  public getFontStyle(): HWPString {
    return this.fontStyle;
  }

  /**
   * 글꼴 타입을 반환한다.
   *
   * @return 글꼴 타입
   */
  public getFontType(): FontType | null {
    return this.fontType;
  }

  /**
   * 글꼴 타입을 설정한다.
   *
   * @param fontType 글꼴 타입
   */
  public setFontType(fontType: FontType | null): void {
    this.fontType = fontType;
  }

  /**
   * 글맵시 모양을 반환한다.
   *
   * @return 글맵시 모양
   */
  public getTextArtShape(): TextArtShape | null {
    return this.textArtShape;
  }

  /**
   * 글맵시 모양을 설정한다.
   *
   * @param textArtShape 글맵시 모양
   */
  public setTextArtShape(textArtShape: TextArtShape | null): void {
    this.textArtShape = textArtShape;
  }

  /**
   * 줄 간격을 반환한다.
   *
   * @return 줄 간격
   */
  public getLineSpace(): number {
    return this.lineSpace;
  }

  /**
   * 줄 간격을 설정한다.
   *
   * @param lineSpace 줄 간격
   */
  public setLineSpace(lineSpace: number): void {
    this.lineSpace = lineSpace;
  }

  /**
   * 글자 간격을 반환한다.
   *
   * @return 글자 간격
   */
  public getCharSpace(): number {
    return this.charSpace;
  }

  /**
   * 글자 간격을 설정한다.
   *
   * @param charSpace 글자 간격
   */
  public setCharSpace(charSpace: number): void {
    this.charSpace = charSpace;
  }

  /**
   * 문단 정렬을 반환한다.
   *
   * @return 문단 정렬 = 0:왼쪽, 1:오른쪽, 2:중앙, 3:양끝, 4:양끝(끝줄 포함)
   */
  public getParaAlignment(): TextArtAlign | null {
    return this.paraAlignment;
  }

  /**
   * 문단 정렬을 설정한다.
   *
   * @param paraAlignment 문단 정렬 = 0:왼쪽, 1:오른쪽, 2:중앙, 3:양끝, 4:양끝(끝줄 포함)
   */
  public setParaAlignment(paraAlignment: TextArtAlign | null): void {
    this.paraAlignment = paraAlignment;
  }

  /**
   * 그림자 타입을 반환한다.
   *
   * @return 그림자 타입 = 0: 없음, 1:비연속
   */
  public getShadowType(): number {
    return this.shadowType;
  }

  /**
   * 그림자 타입을 설정한다.
   *
   * @param shadowType 그림자 타입 = 0: 없음, 1:비연속
   */
  public setShadowType(shadowType: number): void {
    this.shadowType = shadowType;
  }

  /**
   * 그림자 x 오프셋을 반환한다.
   *
   * @return 그림자 x 오프셋
   */
  public getShadowOffsetX(): number {
    return this.shadowOffsetX;
  }

  /**
   * 그림자 x 오프셋을 설정한다.
   *
   * @param shadowOffsetX 그림자 x 오프셋
   */
  public setShadowOffsetX(shadowOffsetX: number): void {
    this.shadowOffsetX = shadowOffsetX;
  }

  /**
   * 그림자 y 오프셋을 반환한다.
   *
   * @return 그림자 y 오프셋
   */
  public getShadowOffsetY(): number {
    return this.shadowOffsetY;
  }

  /**
   * 그림자 y 오프셋을 설정한다.
   *
   * @param shadowOffsetY 그림자 y 오프셋
   */
  public setShadowOffsetY(shadowOffsetY: number): void {
    this.shadowOffsetY = shadowOffsetY;
  }

  /**
   * 그림자 색상을 반환한다.
   *
   * @return 그림자 색상
   */
  public getShadowColor(): Color4Byte {
    return this.shadowColor;
  }

  /**
   * outline list을 반환한다.
   *
   * @return outline list
   */
  public getOutlinePointList(): PositionXY[] {
    return this.outlinePointList;
  }

  public copy(from: ShapeComponentTextArt): void {
    this.x1 = from.x1;
    this.y1 = from.y1;
    this.x2 = from.x2;
    this.y2 = from.y2;
    this.x3 = from.x3;
    this.y3 = from.y3;
    this.x4 = from.x4;
    this.y4 = from.y4;
    this.content.copy(from.content);
    this.fontName.copy(from.fontName);
    this.fontStyle.copy(from.fontStyle);
    this.fontType = from.fontType;
    this.textArtShape = from.textArtShape;
    this.lineSpace = from.lineSpace;
    this.charSpace = from.charSpace;
    this.paraAlignment = from.paraAlignment;
    this.shadowType = from.shadowType;
    this.shadowOffsetX = from.shadowOffsetX;
    this.shadowOffsetY = from.shadowOffsetY;
    this.shadowColor.copy(from.shadowColor);
    for (const positionXY of from.outlinePointList) {
      const clonedPositionXY = new PositionXY();
      clonedPositionXY.copy(positionXY);

      this.outlinePointList.push(clonedPositionXY);
    }
  }
}
