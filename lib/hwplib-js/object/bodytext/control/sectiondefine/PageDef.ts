import { PageDefProperty } from "./PageDefProperty.js";

/**
 * 용지 설정에 대한 레코드
 * Ported from hwplib's `object.bodytext.control.sectiondefine.PageDef`.
 *
 * @author neolord
 */
export class PageDef {
  /**
   * 용지 가로 크기
   */
  private paperWidth: number = 0;
  /**
   * 용지 세로 크기
   */
  private paperHeight: number = 0;
  /**
   * 용지 왼쪽 여백
   */
  private leftMargin: number = 0;
  /**
   * 용지 오른쪽 여백
   */
  private rightMargin: number = 0;
  /**
   * 용지 위쪽 여백
   */
  private topMargin: number = 0;
  /**
   * 용지 아래쪽 여백
   */
  private bottomMargin: number = 0;
  /**
   * 머리말 여백
   */
  private headerMargin: number = 0;
  /**
   * 꼬리말 여백
   */
  private footerMargin: number = 0;
  /**
   * 제본 여백
   */
  private gutterMargin: number = 0;
  /**
   * 속성
   */
  private property: PageDefProperty;

  /**
   * 생상자
   */
  public constructor() {
    this.property = new PageDefProperty();
  }

  /**
   * 용지 가로 크기를 반환한다.
   *
   * @return 용지 가로 크기
   */
  public getPaperWidth(): number {
    return this.paperWidth;
  }

  /**
   * 용지 가로 크기를 설정한다.
   *
   * @param paperWidth 용지 가로 크기
   */
  public setPaperWidth(paperWidth: number): void {
    this.paperWidth = paperWidth;
  }

  /**
   * 용지 세로 크기를 반환한다.
   *
   * @return 용지 세로 크기
   */
  public getPaperHeight(): number {
    return this.paperHeight;
  }

  /**
   * 용지 세로 크기를 설정한다.
   *
   * @param paperHeight 용지 세로 크기
   */
  public setPaperHeight(paperHeight: number): void {
    this.paperHeight = paperHeight;
  }

  /**
   * 용지 왼쪽 여백의 크기를 반환한다.
   *
   * @return 용지 왼쪽 여백의 크기
   */
  public getLeftMargin(): number {
    return this.leftMargin;
  }

  /**
   * 용지 왼쪽 여백의 크기를 설정한다.
   *
   * @param leftMargin 용지 왼쪽 여백의 크기
   */
  public setLeftMargin(leftMargin: number): void {
    this.leftMargin = leftMargin;
  }

  /**
   * 용지 오른쪽 여백의 크기를 반환한다.
   *
   * @return 용지 오른쪽 여백의 크기
   */
  public getRightMargin(): number {
    return this.rightMargin;
  }

  /**
   * 용지 오른쪽 여백의 크기를 설정한다.
   *
   * @param rightMargin 용지 오른쪽 여백의 크기
   */
  public setRightMargin(rightMargin: number): void {
    this.rightMargin = rightMargin;
  }

  /**
   * 용지 위쪽 여백의 크기를 반환한다.
   *
   * @return 용지 위쪽 여백의 크기
   */
  public getTopMargin(): number {
    return this.topMargin;
  }

  /**
   * 용지 위쪽 여백의 크기를 설정한다.
   *
   * @param topMargin 용지 위쪽 여백의 크기
   */
  public setTopMargin(topMargin: number): void {
    this.topMargin = topMargin;
  }

  /**
   * 용지 아래쪽 여백의 크기를 반환한다.
   *
   * @return 용지 아래쪽 여백의 크기
   */
  public getBottomMargin(): number {
    return this.bottomMargin;
  }

  /**
   * 용지 아래쪽 여백의 크기를 설정한다.
   *
   * @param bottomMargin 용지 아래쪽 여백의 크기
   */
  public setBottomMargin(bottomMargin: number): void {
    this.bottomMargin = bottomMargin;
  }

  /**
   * 머리말 여백의 크기를 반환한다.
   *
   * @return 머리말 여백의 크기
   */
  public getHeaderMargin(): number {
    return this.headerMargin;
  }

  /**
   * 머리말 여백의 크기를 설정한다.
   *
   * @param headerMargin 머리말 여백의 크기
   */
  public setHeaderMargin(headerMargin: number): void {
    this.headerMargin = headerMargin;
  }

  /**
   * 꼬리말 여백의 크기를 반환한다.
   *
   * @return 꼬리말 여백의 크기
   */
  public getFooterMargin(): number {
    return this.footerMargin;
  }

  /**
   * 꼬리말 여백의 크기를 설정한다.
   *
   * @param footerMargin 꼬리말 여백의 크기
   */
  public setFooterMargin(footerMargin: number): void {
    this.footerMargin = footerMargin;
  }

  /**
   * 제본 여백의 크기를 반환한다.
   *
   * @return 제본 여백의 크기
   */
  public getGutterMargin(): number {
    return this.gutterMargin;
  }

  /**
   * 제본 여백의 크기를 설정한다.
   *
   * @param gutterMargin 제본 여백의 크기
   */
  public setGutterMargin(gutterMargin: number): void {
    this.gutterMargin = gutterMargin;
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  public getProperty(): PageDefProperty {
    return this.property;
  }

  public copy(from: PageDef): void {
    this.paperWidth = from.paperWidth;
    this.paperHeight = from.paperHeight;
    this.leftMargin = from.leftMargin;
    this.rightMargin = from.rightMargin;
    this.topMargin = from.topMargin;
    this.bottomMargin = from.bottomMargin;
    this.headerMargin = from.headerMargin;
    this.footerMargin = from.footerMargin;
    this.gutterMargin = from.gutterMargin;
    this.property.copy(from.property);
  }
}
