import { ListHeaderProperty } from "../gso/textbox/ListHeaderProperty.js";

/**
 * 숨은 설명을 위한 문단 리스트 헤더
 *
 * @author neolord
 */
export class ListHeaderForHiddenComment {
  /**
   * 문단 개수
   */
  private paraCount = 0;
  /**
   * 속성
   */
  private property: ListHeaderProperty;

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

  public copy(from: ListHeaderForHiddenComment): void {
    this.paraCount = from.paraCount;
    this.property.copy(from.property);
  }
}
