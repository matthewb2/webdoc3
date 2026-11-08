import { HWPTag } from "../../../../../../object/etc/HWPTag.js";
import { ForParagraphList } from "../../../ForParagraphList.js";
import type { Caption } from "../../../../../../object/bodytext/control/gso/caption/Caption.js";
import type { ListHeaderForCaption } from "../../../../../../object/bodytext/control/gso/caption/ListHeaderForCaption.js";
import type { StreamWriter } from "../../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 캡션 정보을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForCaption {
  /**
   * 캡션 정보를 쓴다.
   *
   * @param c  캡션 정보 객체
   * @param sw 스트림 라이터
   */
  public static write(c: Caption | null, sw: StreamWriter): void {
    if (c === null) {
      return;
    }

    ForCaption.listHeader(c.getListHeader(), sw);
    ForParagraphList.write(c.getParagraphList(), sw);
  }

  /**
   * 캡션 정보의 리스트 헤더 레코드를 쓴다.
   *
   * @param lh 캡션 정보의 리스트 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static listHeader(
    lh: ListHeaderForCaption,
    sw: StreamWriter,
  ): void {
    ForCaption.recordHeader(sw);

    sw.writeSInt4(lh.getParaCount());
    sw.writeUInt4(lh.getProperty().getValue());
    sw.writeUInt4(lh.getCaptionProperty().getValue());
    sw.writeUInt4(lh.getCaptionWidth());
    sw.writeUInt2(lh.getSpaceBetweenCaptionAndFrame());
    sw.writeUInt4(lh.getTextWidth());
    sw.writeZero(8);
  }

  /**
   * 리스트 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.LIST_HEADER, 30);
  }
}
