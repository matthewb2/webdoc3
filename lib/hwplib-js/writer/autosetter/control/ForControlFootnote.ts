import type { ControlFootnote } from "../../../object/bodytext/control/ControlFootnote.js";
import type { CtrlHeaderFootnote } from "../../../object/bodytext/control/ctrlheader/CtrlHeaderFootnote.js";
import { ForParagraphList } from "../ForParagraphList.js";
import type { InstanceID } from "../InstanceID.js";

/**
 * 각주 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlFootnote {
  /**
   * 각주 컨트롤을 자동 설정한다.
   *
   * @param fn  각주 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(fn: ControlFootnote, iid: InstanceID): void {
    ForControlFootnote.ctrlHeader(fn.getHeader(), iid);
    ForControlFootnote.listHeader(fn);
    ForParagraphList.autoSet(fn.getParagraphList(), iid);
  }

  /**
   * 컨트롤 헤더 레코드를 자동 설정한다.
   *
   * @param h   컨트롤 헤더 레코드
   * @param iid 인스턴스 id
   */
  private static ctrlHeader(h: CtrlHeaderFootnote, iid: InstanceID): void {
    h.setInstanceId(iid.get());
  }

  /**
   * 리스트 헤더 레코드를 자동 설정한다.
   *
   * @param fn 각주 컨트롤
   */
  private static listHeader(fn: ControlFootnote): void {
    fn.getListHeader().setParaCount(fn.getParagraphList().getParagraphCount());
  }
}
