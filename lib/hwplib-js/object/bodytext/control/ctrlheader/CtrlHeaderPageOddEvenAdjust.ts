import { ControlType } from "../ControlType.js";
import { PageOddEvenAdjustHeaderProperty } from "./pageoddevenadjust/PageOddEvenAdjustHeaderProperty.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 홀/짝수 조정(페이지 번호 제어) 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderPageOddEvenAdjust extends CtrlHeader {
  /**
   * 속성
   */
  private property: PageOddEvenAdjustHeaderProperty;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.PageOddEvenAdjust);

    this.property = new PageOddEvenAdjustHeaderProperty();
  }

  /**
   * 홀/짝수 조정(페이지 번호 제어) 컨트롤의 속성 객체를 반환한다.
   *
   * @return 홀/짝수 조정(페이지 번호 제어) 컨트롤의 속성 객체
   */
  getProperty(): PageOddEvenAdjustHeaderProperty {
    return this.property;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderPageOddEvenAdjust;
    this.property.copy(from2.property);
  }
}
