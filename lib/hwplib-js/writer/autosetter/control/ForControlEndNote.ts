import type { ControlEndnote } from "../../../object/bodytext/control/ControlEndnote.js";
import { ForParagraphList } from "../ForParagraphList.js";
import type { InstanceID } from "../InstanceID.js";

/**
 * 미주 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlEndNote {
  /**
   * 미주 컨트롤을 자동 설정한다.
   *
   * @param en  미주 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(en: ControlEndnote, iid: InstanceID): void {
    ForControlEndNote.listHeader(en);
    ForParagraphList.autoSet(en.getParagraphList(), iid);
  }

  /**
   * 리스트 헤더 레코드를 자동 설정한다.
   *
   * @param en 미주 컨트롤
   */
  private static listHeader(en: ControlEndnote): void {
    en.getListHeader().setParaCount(en.getParagraphList().getParagraphCount());
  }
}
