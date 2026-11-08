import type { ControlFooter } from "../../../object/bodytext/control/ControlFooter.js";
import { ForParagraphList } from "../ForParagraphList.js";
import type { InstanceID } from "../InstanceID.js";

/**
 * 꼬리말 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlFooter {
  /**
   * 꼬리말 컨트롤을 자동 설정한다.
   *
   * @param f   꼬리말 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(f: ControlFooter, iid: InstanceID): void {
    ForControlFooter.listHeader(f);
    ForParagraphList.autoSet(f.getParagraphList(), iid);
  }

  /**
   * 리스트 헤더 레코드를 자동 설정한다.
   *
   * @param f 꼬리말 컨트롤
   */
  private static listHeader(f: ControlFooter): void {
    f.getListHeader().setParaCount(f.getParagraphList().getParagraphCount());
  }
}
