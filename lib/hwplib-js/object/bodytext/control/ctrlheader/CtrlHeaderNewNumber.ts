import { ControlType } from "../ControlType.js";
import { NewNumberHeaderProperty } from "./newnumber/NewNumberHeaderProperty.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 새 번호 지정 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderNewNumber extends CtrlHeader {
  /**
   * 속성
   */
  private property: NewNumberHeaderProperty;
  /**
   * 번호
   */
  private number = 0;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.NewNumber);

    this.property = new NewNumberHeaderProperty();
  }

  /**
   * 새 번호 지정 컨트롤의 속성 객체를 반환한다.
   *
   * @return 새 번호 지정 컨트롤의 속성 객체
   */
  getProperty(): NewNumberHeaderProperty {
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

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderNewNumber;
    this.property.copy(from2.property);
    this.number = from2.number;
  }
}
