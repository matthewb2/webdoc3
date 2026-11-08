import { ControlType } from "../ControlType.js";
import { AutoNumberHeaderProperty } from "./autonumber/AutoNumberHeaderProperty.js";
import { HWPString } from "../../../etc/HWPString.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 자동번호 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderAutoNumber extends CtrlHeader {
  /**
   * 속성
   */
  private property: AutoNumberHeaderProperty;
  /**
   * 번호
   */
  private number = 0;
  /**
   * 사용자 기호
   */
  private userSymbol: HWPString;
  /**
   * 앞 장식 문자
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
    super(ControlType.AutoNumber);

    this.property = new AutoNumberHeaderProperty();
    this.userSymbol = new HWPString();
    this.beforeDecorationLetter = new HWPString();
    this.afterDecorationLetter = new HWPString();
  }

  /**
   * 자동번호 컨트롤의 속성 객체를 반환한다.
   *
   * @return 자동번호 컨트롤의 속성 객체
   */
  getProperty(): AutoNumberHeaderProperty {
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
   * 앞 장식 문자를 반환한다.
   *
   * @return 앞 장식 문자
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
    const from2 = from as CtrlHeaderAutoNumber;
    this.property.copy(from2.property);
    this.number = from2.number;
    this.userSymbol.copy(from2.userSymbol);
    this.beforeDecorationLetter.copy(from2.beforeDecorationLetter);
    this.afterDecorationLetter.copy(from2.afterDecorationLetter);
  }
}
