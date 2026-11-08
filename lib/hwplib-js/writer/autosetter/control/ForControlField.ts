import type { ControlField } from "../../../object/bodytext/control/ControlField.js";
import type { CtrlHeaderField } from "../../../object/bodytext/control/ctrlheader/CtrlHeaderField.js";
import type { InstanceID } from "../InstanceID.js";

/**
 * 필드 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlField {
  /**
   * 필드 컨트롤을 자동 설정한다.
   *
   * @param f   필드 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(f: ControlField, iid: InstanceID): void {
    ForControlField.ctrlHeader(f.getHeader(), iid);
  }

  /**
   * 컨트롤 헤더 레코드를 자동 설정한다.
   *
   * @param h   컨트롤 헤더
   * @param iid 인스턴스 id
   */
  private static ctrlHeader(h: CtrlHeaderField, iid: InstanceID): void {
    h.setInstanceId(iid.get());
  }
}
