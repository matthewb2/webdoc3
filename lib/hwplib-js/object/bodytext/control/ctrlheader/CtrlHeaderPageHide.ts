import { ControlType } from "../ControlType.js";
import { PageHideHeaderProperty } from "./pagehide/PageHideHeaderProperty.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 감추기 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderPageHide extends CtrlHeader {
  /**
   * 속성
   */
  private property: PageHideHeaderProperty;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.PageHide);

    this.property = new PageHideHeaderProperty();
  }

  /**
   * 감추기 컨트롤의 속성 객체를 반환한다.
   *
   * @return 감추기 컨트롤의 속성 객체
   */
  getProperty(): PageHideHeaderProperty {
    return this.property;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderPageHide;
    this.property.copy(from2.property);
  }
}
