import type { ParagraphListInterface } from "../../object/bodytext/ParagraphListInterface.js";
import { ForParagraph } from "./ForParagraph.js";
import type { InstanceID } from "./InstanceID.js";

/**
 * 문단 리스트 객체를 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForParagraphList {
  /**
   * 문단 리스트를 자동 설정한다.
   *
   * @param pli 문단 리스트 객체
   * @param iid 인스턴스 id
   */
  public static autoSet(pli: ParagraphListInterface, iid: InstanceID): void {
    const count = pli.getParagraphCount();
    for (let index = 0; index < count; index++) {
      const p = pli.getParagraph(index);
      if (index === count - 1) {
        ForParagraph.autoSet(p, true, iid);
      } else {
        ForParagraph.autoSet(p, false, iid);
      }
    }
  }
}
