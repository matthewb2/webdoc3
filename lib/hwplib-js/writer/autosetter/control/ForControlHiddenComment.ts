import type { ControlHiddenComment } from "../../../object/bodytext/control/ControlHiddenComment.js";
import { ForParagraphList } from "../ForParagraphList.js";
import type { InstanceID } from "../InstanceID.js";

/**
 * 숨은 설명 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlHiddenComment {
  /**
   * 숨은 설명 컨트롤을 자동 설정한다.
   *
   * @param hc  숨은 설명 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(hc: ControlHiddenComment, iid: InstanceID): void {
    ForControlHiddenComment.listHeader(hc);
    ForParagraphList.autoSet(hc.getParagraphList(), iid);
  }

  /**
   * 리스트 헤더 레코드를 자동 설정한다.
   *
   * @param hc 숨은 설명 컨트롤
   */
  private static listHeader(hc: ControlHiddenComment): void {
    hc.getListHeader().setParaCount(hc.getParagraphList().getParagraphCount());
  }
}
