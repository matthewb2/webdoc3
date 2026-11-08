import type { CtrlHeaderGso } from "../../../../../object/bodytext/control/ctrlheader/CtrlHeaderGso.js";
import type { Caption } from "../../../../../object/bodytext/control/gso/caption/Caption.js";
import type { InstanceID } from "../../../InstanceID.js";

/**
 * 그리기 개체의 컨트롤 헤더 레코드를 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForCtrlHeaderGso {
  /**
   * 그리기 개체의 컨트롤 헤더 레코드를 자동 설정한다.
   *
   * @param h   그리기 개체의 컨트롤 헤더 레코드
   * @param iid 인스턴스 아이디
   */
  public static autoSet(h: CtrlHeaderGso | null, c: Caption | null, iid: InstanceID): void {
    if (h === null) {
      return;
    }
    h.setInstanceId(iid.get());

    if (c !== null) {
      h.getProperty().setHasCaption(true);
    } else {
      h.getProperty().setHasCaption(false);
    }
  }
}
