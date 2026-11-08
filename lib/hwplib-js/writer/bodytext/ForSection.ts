import type { Section } from "../../object/bodytext/Section.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";
import { ForBatangPageInfo } from "./paragraph/control/secd/ForBatangPageInfo.js";
import { ForParagraphList } from "./paragraph/ForParagraphList.js";

/**
 * 구역을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForSection {
  /**
   * 구역을 쓴다.
   *
   * @param s  구역
   * @param sw 스트림 라이터
   */
  public static write(s: Section, sw: StreamWriter): void {
    ForParagraphList.write(s, sw);
    if (s.getLastBatangPageInfo() !== null) {
      sw.upRecordLevel();
      ForBatangPageInfo.write(s.getLastBatangPageInfo()!, sw);
      sw.downRecordLevel();
    }
  }
}
