import { ControlType } from "../ControlType.js";
import { PageNumberPositionHeaderProperty } from "./pagenumberposition/PageNumberPositionHeaderProperty.js";
import { HWPString } from "../../../etc/HWPString.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 쪽 번호 위치 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderPageNumberPosition extends CtrlHeader {
  /**
   * 속성
   */
  private property: PageNumberPositionHeaderProperty;
  /**
   * 번호
   */
  private number = 0;
  /**
   * 사용자 기호
   */
  private userSymbol: HWPString;
  /**
   * 얖 장식 문자
   */
  private beforeDecorationLetter: HWPString;
  /**
   * 뒤 장식 문자
   */
  private afterDecorationLetter: HWPString;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.PageNumberPosition);

    this.property = new PageNumberPositionHeaderProperty();
    this.userSymbol = new HWPString();
    this.beforeDecorationLetter = new HWPString();
    this.afterDecorationLetter = new HWPString();
  }

  /**
   * 쪽 번호 위치 컨트롤의 속성 객체를 반환한다.
   *
   * @return 쪽 번호 위치 컨트롤의 속성 객체
   */
  getProperty(): PageNumberPositionHeaderProperty {
    return this.property;
  }

  /**
   * 번호를 반환한다.
   *
   * @return 번호
   */
  getNumber(): number {
    return this.number;
  }

  /**
   * 번호를 설정한다.
   *
   * @param number 번호
   */
  setNumber(number: number): void {
    this.number = number;
  }

  /**
   * 사용자 기호를 반환한다.
   *
   * @return 사용자 기호
   */
  getUserSymbol(): HWPString {
    return this.userSymbol;
  }

  /**
   * 얖 장식 문자를 반환한다.
   *
   * @return 얖 장식 문자
   */
  getBeforeDecorationLetter(): HWPString {
    return this.beforeDecorationLetter;
  }

  /**
   * 뒤 장식 문자를 반환한다.
   *
   * @return 뒤 장식 문자
   */
  getAfterDecorationLetter(): HWPString {
    return this.afterDecorationLetter;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderPageNumberPosition;
    this.property.copy(from2.property);
    this.number = from2.number;
    this.userSymbol = from2.userSymbol;
    this.beforeDecorationLetter = from2.beforeDecorationLetter;
    this.afterDecorationLetter = from2.afterDecorationLetter;
  }
}
