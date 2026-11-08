import type { Caption } from "../../../../../object/bodytext/control/gso/caption/Caption.js";
import { ForParagraphList } from "../../../ForParagraphList.js";
import type { InstanceID } from "../../../InstanceID.js";

/**
 * 캡션 정보을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForCaption {
  /**
   * 캡션 정보을 저장 설정한다.
   *
   * @param c   캡션 정보 객체
   * @param iid 인스턴스 id
   */
  public static autoSet(c: Caption | null, iid: InstanceID): void {
    if (c === null) {
      return;
    }
    ForCaption.listHeader(c);
    ForParagraphList.autoSet(c.getParagraphList(), iid);
  }

  /**
   * 리스트 헤더 레코드를 자동설정한다.
   *
   * @param c 캡션 정보 객체
   */
  private static listHeader(c: Caption): void {
    c.getListHeader().setParaCount(c.getParagraphList().getParagraphCount());
  }
}
