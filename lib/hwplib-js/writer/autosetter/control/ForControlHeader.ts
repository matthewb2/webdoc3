import type { ControlHeader } from "../../../object/bodytext/control/ControlHeader.js";
import { ForParagraphList } from "../ForParagraphList.js";
import type { InstanceID } from "../InstanceID.js";

/**
 * 머리말 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlHeader {
  /**
   * 머리말 컨트롤을 자동 설정한다.
   *
   * @param h   머리말 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(h: ControlHeader, iid: InstanceID): void {
    ForControlHeader.listHeader(h);
    ForParagraphList.autoSet(h.getParagraphList(), iid);
  }

  /**
   * 리스트 헤더 레코드를 자동 설정한다.
   *
   * @param h 머리말 컨트롤
   */
  private static listHeader(h: ControlHeader): void {
    h.getListHeader().setParaCount(h.getParagraphList().getParagraphCount());
  }
}
