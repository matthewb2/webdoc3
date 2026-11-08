import { ListHeaderProperty } from "../../control/gso/textbox/ListHeaderProperty.js";

/**
 * 메모를 위한 문단 리스트 헤더 레코드
 *
 * @author neolord
 */
export class ListHeaderForMemo {
  /**
   * 문단 개수
   */
  private paraCount = 0;
  /**
   * 속성
   */
  private property: ListHeaderProperty;
  /**
   * 텍스트 영역의 폭
   */
  private textWidth = 0;
  /**
   * 텍스트 영역의 높이
   */
  private textHeight = 0;

  /**
   * 생성자
   */
  constructor() {
    this.property = new ListHeaderProperty();
  }

  /**
   * 문단 개수를 반환한다.
   *
   * @return 문단 개수
   */
  getParaCount(): number {
    return this.paraCount;
  }

  /**
   * 문단 개수를 설정한다.
   *
   * @param paraCount 문단 개수
   */
  setParaCount(paraCount: number): void {
    this.paraCount = paraCount;
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  getProperty(): ListHeaderProperty {
    return this.property;
  }

  /**
   * 텍스트 영역의 폭을 반환한다.
   *
   * @return 텍스트 영역의 폭
   */
  getTextWidth(): number {
    return this.textWidth;
  }

  /**
   * 텍스트 영역의 폭을 설정한다.
   *
   * @param textWidth 텍스트 영역의 폭
   */
  setTextWidth(textWidth: number): void {
    this.textWidth = textWidth;
  }

  /**
   * 텍스트 영역의 높이를 반환한다.
   *
   * @return 텍스트 영역의 높이
   */
  getTextHeight(): number {
    return this.textHeight;
  }

  /**
   * 텍스트 영역의 높이를 설정한다.
   *
   * @param textHeight 텍스트 영역의 높이
   */
  setTextHeight(textHeight: number): void {
    this.textHeight = textHeight;
  }

  copy(from: ListHeaderForMemo): void {
    this.paraCount = from.paraCount;
    this.property.copy(from.property);
    this.textWidth = from.textWidth;
    this.textHeight = from.textHeight;
  }
}
