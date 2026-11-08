import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * 감추기 컨트롤의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class PageHideHeaderProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * 파일에 저장되는 정수값을 설정한다.
   *
   * @param value 파일에 저장되는 정수값
   */
  public setValue(value: number): void {
    this.value = value;
  }

  /**
   * 머리말 숨김 여부를 반환한다. (0 bit)
   *
   * @return 머리말 숨김 여부
   */
  public isHideHeader(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 머리말 숨김 여부를 설정한다. (0 bit)
   *
   * @param hideHeader 머리말 숨김 여부
   */
  public setHideHeader(hideHeader: boolean): void {
    this.value = BitFlag.set(this.value, 0, hideHeader);
  }

  /**
   * 꼬리말 숨김 여부를 반환한다. (1 bit)
   *
   * @return 꼬리말 숨김 여부
   */
  public isHideFooter(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 꼬리말 숨김 여부를 설정한다. (1 bit)
   *
   * @param hideFooter 꼬리말 숨김 여부
   */
  public setHideFooter(hideFooter: boolean): void {
    this.value = BitFlag.set(this.value, 1, hideFooter);
  }

  /**
   * 바탕 쪽 숨김 여부를 반환한다. (2 bit)
   *
   * @return 바탕 쪽 숨김 여부
   */
  public isHideBatangPage(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 바탕 쪽 숨김 여부를 설정한다. (2 bit)
   *
   * @param hideBatangPage 바탕 쪽 숨김 여부
   */
  public setHideBatangPage(hideBatangPage: boolean): void {
    this.value = BitFlag.set(this.value, 2, hideBatangPage);
  }

  /**
   * 테두리 숨김 여부를 반환하다. (3 bit)
   *
   * @return 테두리 숨김 여부
   */
  public isHideBorder(): boolean {
    return BitFlag.get(this.value, 3);
  }

  /**
   * 테두리 숨김 여부를 설정한다. (3 bit)
   *
   * @param hideBorder 테두리 숨김 여부
   */
  public setHideBorder(hideBorder: boolean): void {
    this.value = BitFlag.set(this.value, 3, hideBorder);
  }

  /**
   * 배경 숨김 여부를 반환하다. (4 bit)
   *
   * @return 배경 숨김 여부
   */
  public isHideFill(): boolean {
    return BitFlag.get(this.value, 4);
  }

  /**
   * 배경 숨김 여부를 설정한다. (4 bit)
   *
   * @param hideFill 테두리 숨김 여부
   */
  public setHideFill(hideFill: boolean): void {
    this.value = BitFlag.set(this.value, 4, hideFill);
  }

  /**
   * 페이지 번호 숨김 여부를 반환한다. (5 bit)
   *
   * @return 페이지 번호 숨김 여부
   */
  public isHidePageNumber(): boolean {
    return BitFlag.get(this.value, 5);
  }

  /**
   * 페이지 번호 숨김 여부를 설정한다. (5 bit)
   *
   * @param hidePageNumber 페이지 번호 숨김 여부
   */
  public setHidePageNumber(hidePageNumber: boolean): void {
    this.value = BitFlag.set(this.value, 5, hidePageNumber);
  }

  public copy(from: PageHideHeaderProperty): void {
    this.value = from.value;
  }
}
