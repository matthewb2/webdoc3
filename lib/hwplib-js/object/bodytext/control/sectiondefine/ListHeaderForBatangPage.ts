import { ListHeaderProperty } from "../gso/textbox/ListHeaderProperty.js";

/**
 * 바탕쪽을 위한 문단 리스트 헤더 레코드
 * Ported from hwplib's `object.bodytext.control.sectiondefine.ListHeaderForBatangPage`.
 *
 * @author neolord
 */
export class ListHeaderForBatangPage {
  /**
   * 문단 개수
   */
  private paraCount: number = 0;
  /**
   * 속성
   */
  private property: ListHeaderProperty;
  /**
   * 텍스트 영역의 폭
   */
  private textWidth: number = 0;
  /**
   * 텍스트 영역의 높이
   */
  private textHeight: number = 0;

  /**
   * 생성자
   */
  public constructor() {
    this.property = new ListHeaderProperty();
  }

  /**
   * 문단 개수를 반환한다.
   *
   * @return 문단 개수
   */
  public getParaCount(): number {
    return this.paraCount;
  }

  /**
   * 문단 개수를 설정한다.
   *
   * @param paraCount 문단 개수
   */
  public setParaCount(paraCount: number): void {
    this.paraCount = paraCount;
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  public getProperty(): ListHeaderProperty {
    return this.property;
  }

  /**
   * 텍스트 영역의 폭을 반환한다.
   *
   * @return 텍스트 영역의 폭
   */
  public getTextWidth(): number {
    return this.textWidth;
  }

  /**
   * 텍스트 영역의 폭을 설정한다.
   *
   * @param textWidth 텍스트 영역의 폭
   */
  public setTextWidth(textWidth: number): void {
    this.textWidth = textWidth;
  }

  /**
   * 텍스트 영역의 높이를 반환한다.
   *
   * @return 텍스트 영역의 높이
   */
  public getTextHeight(): number {
    return this.textHeight;
  }

  /**
   * 텍스트 영역의 높이를 설정한다.
   *
   * @param textHeight 텍스트 영역의 높이
   */
  public setTextHeight(textHeight: number): void {
    this.textHeight = textHeight;
  }

  public copy(from: ListHeaderForBatangPage): void {
    this.paraCount = from.paraCount;
    this.property.copy(from.property);
    this.textWidth = from.textWidth;
    this.textHeight = from.textHeight;
  }
}
