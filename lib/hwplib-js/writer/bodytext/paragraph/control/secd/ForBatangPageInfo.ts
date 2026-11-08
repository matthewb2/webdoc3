import type { BatangPageInfo } from "../../../../../object/bodytext/control/sectiondefine/BatangPageInfo.js";
import type { ListHeaderForBatangPage } from "../../../../../object/bodytext/control/sectiondefine/ListHeaderForBatangPage.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraphList } from "../../ForParagraphList.js";

/**
 * 바탕쪽 정보를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForBatangPageInfo {
  /**
   * 바탕쪽 정보를 쓴다.
   *
   * @param bpi 바탕쪽 정보
   * @param sw  스트림 라이터
   */
  public static write(bpi: BatangPageInfo, sw: StreamWriter): void {
    ForBatangPageInfo.listHeader(bpi.getListHeader(), sw);
    ForParagraphList.write(bpi.getParagraphList(), sw);
  }

  /**
   * 바탕쪽 정보의 리스트 헤더 레코드를 쓴다.
   *
   * @param lh 바탕쪽 정보의 리스트 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static listHeader(lh: ListHeaderForBatangPage, sw: StreamWriter): void {
    ForBatangPageInfo.recordHeader(sw);

    sw.writeSInt4(lh.getParaCount());
    sw.writeUInt4(lh.getProperty().getValue());
    sw.writeUInt4(lh.getTextWidth());
    sw.writeUInt4(lh.getTextHeight());
    sw.writeZero(18);
  }

  /**
   * 바탕쪽 정보의 리스트 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.LIST_HEADER, 34);
  }
}
