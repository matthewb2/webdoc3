import type { Section } from "../../object/bodytext/Section.js";
import type { BatangPageInfo } from "../../object/bodytext/control/sectiondefine/BatangPageInfo.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";
import { ForBatangPageInfo } from "./paragraph/control/secd/ForBatangPageInfo.js";
import { ForParagraphList } from "./ForParagraphList.js";

/**
 * 구역 스트림을 읽기 위한 객체
 *
 * @author 박성균
 */
export class ForSection {
  /**
   * 구역 스트림을 읽는다.
   *
   * @param s  구역 객체
   * @param sr 스트림 리더
   */
  public static read(s: Section, sr: StreamReader): void {
    ForParagraphList.read(s, sr);
    if (sr.isEndOfStream() || sr.getCurrentRecordHeader().getTagID() !== HWPTag.LIST_HEADER) return;

    s.createLastBatangPageInfo();
    ForSection.batangPageInfo(s.getLastBatangPageInfo()!, sr);

    if (sr.isEndOfStream() || sr.getCurrentRecordHeader().getTagID() !== HWPTag.LIST_HEADER) return;

    s.createAnyBatangPageInfo();
    ForSection.batangPageInfo(s.getAnyBatangPageInfo()!, sr);
  }

  /**
   * 마지막 바탕쪽을 읽는다.
   *
   * @param lastBatangPageInfo 마지막 바탕쪽 객체
   * @param sr                 스트림 리더
   */
  private static batangPageInfo(lastBatangPageInfo: BatangPageInfo, sr: StreamReader): void {
    ForBatangPageInfo.read(lastBatangPageInfo, sr);
  }
}
