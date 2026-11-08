import { ForParagraphList } from "../../../../ForParagraphList.js";
import type { Caption } from "../../../../../../object/bodytext/control/gso/caption/Caption.js";
import type { ListHeaderForCaption } from "../../../../../../object/bodytext/control/gso/caption/ListHeaderForCaption.js";
import type { StreamReader } from "../../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 캡션 정보을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForCaption {
  /**
   * 캡션 정보을 읽는다.
   *
   * @param caption 캡션 정보
   * @param sr      스트림 리더
   */
  public static read(caption: Caption, sr: StreamReader): void {
    ForCaption.listHeader(caption.getListHeader(), sr);
    ForParagraphList.read(caption.getParagraphList(), sr);
  }

  /**
   * 캡션 정보의 문단 리스트 헤더 레코드를 읽는다.
   *
   * @param listHeader 캡션 정보의 문단 리스트 헤더 레코드
   * @param sr         스트림 리더
   */
  private static listHeader(
    listHeader: ListHeaderForCaption,
    sr: StreamReader,
  ): void {
    listHeader.setParaCount(sr.readSInt4());
    listHeader.getProperty().setValue(sr.readUInt4());
    listHeader.getCaptionProperty().setValue(sr.readUInt4());
    listHeader.setCaptionWidth(sr.readUInt4());
    listHeader.setSpaceBetweenCaptionAndFrame(sr.readUInt2());
    listHeader.setTextWidth(sr.readUInt4());
    // 버전에 따라 8bytes가 있을 수 있음.
    sr.skipToEndRecord();
  }
}
