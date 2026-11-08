import type { BatangPageInfo } from "../../../../../object/bodytext/control/sectiondefine/BatangPageInfo.js";
import type { ListHeaderForBatangPage } from "../../../../../object/bodytext/control/sectiondefine/ListHeaderForBatangPage.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";
import { ForParagraphList } from "../../../ForParagraphList.js";

/**
 * 바탕쪽 정보를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForBatangPageInfo {
  /**
   * 바탕쪽 정보를 읽는다.
   *
   * @param bpi 바탕쪽 정보
   * @param sr  스트림 리더
   */
  public static read(bpi: BatangPageInfo, sr: StreamReader): void {
    ForBatangPageInfo.listHeader(bpi.getListHeader(), sr);
    ForParagraphList.read(bpi.getParagraphList(), sr);
  }

  /**
   * 바탕쪽의 문단 리스트 헤더 레코드를 읽는다.
   *
   * @param lh 바탕쪽의 문단 리스트 헤더 레코드
   * @param sr 스트림 리더
   */
  private static listHeader(lh: ListHeaderForBatangPage, sr: StreamReader): void {
    lh.setParaCount(sr.readSInt4());
    lh.getProperty().setValue(sr.readUInt4());
    lh.setTextWidth(sr.readUInt4());
    lh.setTextHeight(sr.readUInt4());
    sr.skipToEndRecord();
  }
}
