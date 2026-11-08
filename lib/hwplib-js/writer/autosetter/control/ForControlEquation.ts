import type { ControlEquation } from "../../../object/bodytext/control/ControlEquation.js";
import type { InstanceID } from "../InstanceID.js";
import { ForCaption } from "./gso/part/ForCaption.js";
import { ForCtrlHeaderGso } from "./gso/part/ForCtrlHeaderGso.js";

/**
 * 수식 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlEquation {
  /**
   * 수식 컨트롤을 자동 설정한다.
   *
   * @param eq  수식 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(eq: ControlEquation, iid: InstanceID): void {
    ForCtrlHeaderGso.autoSet(eq.getHeader(), eq.getCaption(), iid);
    ForCaption.autoSet(eq.getCaption(), iid);
  }
}
