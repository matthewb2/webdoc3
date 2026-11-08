import { PageBorderFillProperty } from "./PageBorderFillProperty.js";

/**
 * 쪽 테두리/배경 정보에 대한 레코드
 * Ported from hwplib's `object.bodytext.control.sectiondefine.PageBorderFill`.
 *
 * @author neolord
 */
export class PageBorderFill {
  /**
   * 속성
   */
  private property: PageBorderFillProperty;
  /**
   * 테두리/배경 위치 왼쪽 간격
   */
  private leftGap: number = 0;
  /**
   * 테두리/배경 위치 오른쪽 간격
   */
  private rightGap: number = 0;
  /**
   * 테두리/배경 위치 위쪽 간격
   */
  private topGap: number = 0;
  /**
   * 테두리/배경 위치 아래쪽 간격
   */
  private bottomGap: number = 0;
  /**
   * 참조된 테두리/배경의 id
   */
  private borderFillId: number = 0;

  /**
   * 생성자
   */
  public constructor() {
    this.property = new PageBorderFillProperty();
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  public getProperty(): PageBorderFillProperty {
    return this.property;
  }

  /**
   * 테두리/배경 위치 왼쪽 간격을 반환한다.
   *
   * @return 테두리/배경 위치 왼쪽 간격
   */
  public getLeftGap(): number {
    return this.leftGap;
  }

  /**
   * 테두리/배경 위치 왼쪽 간격을 설정한다.
   *
   * @param leftGap 테두리/배경 위치 왼쪽 간격
   */
  public setLeftGap(leftGap: number): void {
    this.leftGap = leftGap;
  }

  /**
   * 테두리/배경 위치 오른쪽 간격을 반환한다.
   *
   * @return 테두리/배경 위치 오른쪽 간격
   */
  public getRightGap(): number {
    return this.rightGap;
  }

  /**
   * 테두리/배경 위치 오른쪽 간격을 설정한다.
   *
   * @param rightGap 테두리/배경 위치 오른쪽 간격
   */
  public setRightGap(rightGap: number): void {
    this.rightGap = rightGap;
  }

  /**
   * 테두리/배경 위치 위쪽 간격을 반환한다.
   *
   * @return 테두리/배경 위치 위쪽 간격
   */
  public getTopGap(): number {
    return this.topGap;
  }

  /**
   * 테두리/배경 위치 위쪽 간격을 설정한다.
   *
   * @param topGap 테두리/배경 위치 위쪽 간격
   */
  public setTopGap(topGap: number): void {
    this.topGap = topGap;
  }

  /**
   * 테두리/배경 위치 아래쪽 간격을 반환한다.
   *
   * @return 테두리/배경 위치 아래쪽 간격
   */
  public getBottomGap(): number {
    return this.bottomGap;
  }

  /**
   * 테두리/배경 위치 아래쪽 간격을 설정한다.
   *
   * @param bottomGap 테두리/배경 위치 아래쪽 간격
   */
  public setBottomGap(bottomGap: number): void {
    this.bottomGap = bottomGap;
  }

  /**
   * 참조된 테두리/배경의 id를 반환한다.
   *
   * @return 참조된 테두리/배경의 id
   */
  public getBorderFillId(): number {
    return this.borderFillId;
  }

  /**
   * 참조된 테두리/배경의 id를 설정한다.
   *
   * @param borderFillId 참조된 테두리/배경의 id
   */
  public setBorderFillId(borderFillId: number): void {
    this.borderFillId = borderFillId;
  }

  public copy(from: PageBorderFill): void {
    this.property.copy(from.property);
    this.leftGap = from.leftGap;
    this.rightGap = from.rightGap;
    this.topGap = from.topGap;
    this.bottomGap = from.bottomGap;
    this.borderFillId = from.borderFillId;
  }
}
