import { ListHeaderProperty } from "../textbox/ListHeaderProperty.js";
import { ListHeaderCaptionProperty } from "./ListHeaderCaptionProperty.js";

/**
 * 캡션을 위한 문단 리스트 헤더 레코드
 *
 * @author neolord
 */
export class ListHeaderForCaption {
  /**
   * 문단 개수
   */
  private paraCount = 0;
  /**
   * 속성
   */
  private property: ListHeaderProperty;
  /**
   * caption 속성
   */
  private captionProperty: ListHeaderCaptionProperty;
  /**
   * 캡션 폭(세로 방향일 때만 사용)
   */
  private captionWidth = 0;
  /**
   * 캡션과 틀 사이 간격
   */
  private spaceBetweenCaptionAndFrame = 0;
  /**
   * 텍스트의 최대 길이(=객체 폭)
   */
  private textWidth = 0;

  /**
   * 생성자
   */
  constructor() {
    this.property = new ListHeaderProperty();
    this.captionProperty = new ListHeaderCaptionProperty();
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
   * caption 속성 객체를 반환한다.
   *
   * @return caption 속성 객체
   */
  getCaptionProperty(): ListHeaderCaptionProperty {
    return this.captionProperty;
  }

  /**
   * 캡션 폭을 반환한다. (세로 방향일 때만 사용)
   *
   * @return 캡션 폭
   */
  getCaptionWidth(): number {
    return this.captionWidth;
  }

  /**
   * 캡션 폭을 설정한다.
   *
   * @param captionWidth 캡션 폭
   */
  setCaptionWidth(captionWidth: number): void {
    this.captionWidth = captionWidth;
  }

  /**
   * 캡션과 틀 사이 간격의 크기를 반환한다.
   *
   * @return 캡션과 틀 사이 간격의 크기
   */
  getSpaceBetweenCaptionAndFrame(): number {
    return this.spaceBetweenCaptionAndFrame;
  }

  /**
   * 캡션과 틀 사이 간격의 크기를 설정한다.
   *
   * @param spaceBetweenCaptionAndFrame 캡션과 틀 사이 간격의 크기
   */
  setSpaceBetweenCaptionAndFrame(spaceBetweenCaptionAndFrame: number): void {
    this.spaceBetweenCaptionAndFrame = spaceBetweenCaptionAndFrame;
  }

  /**
   * 텍스트의 폭를 반환한다.
   *
   * @return 텍스트의 폭
   */
  getTextWidth(): number {
    return this.textWidth;
  }

  /**
   * 텍스트의 폭를 설정한다.
   *
   * @param textWidth 텍스트의 폭
   */
  setTextWidth(textWidth: number): void {
    this.textWidth = textWidth;
  }

  copy(from: ListHeaderForCaption): void {
    this.paraCount = from.paraCount;
    this.property.copy(from.property);
    this.captionProperty.copy(from.captionProperty);
    this.captionWidth = from.captionWidth;
    this.spaceBetweenCaptionAndFrame = from.spaceBetweenCaptionAndFrame;
    this.textWidth = from.textWidth;
  }
}
