import type { ListHeaderForHeaderFooter } from "../../../../../object/bodytext/control/headerfooter/ListHeaderForHeaderFooter.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 머리말/꼬리말 컨트롤의 리스트 헤더 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForListHeaderForHeaderFooter {
  /**
   * 머리말/꼬리말 컨트롤의 리스트 헤더 레코드를 쓴다.
   *
   * @param lh 머리말/꼬리말 컨트롤의 리스트 헤더 레코드
   * @param sw 스트림 라이터
   */
  public static write(lh: ListHeaderForHeaderFooter, sw: StreamWriter): void {
    ForListHeaderForHeaderFooter.recordHeader(sw);

    sw.writeSInt4(lh.getParaCount());
    sw.writeUInt4(lh.getProperty().getValue());
    sw.writeUInt4(lh.getTextWidth());
    sw.writeUInt4(lh.getTextHeight());
    sw.writeZero(18);
  }

  /**
   * 머리말/꼬리말 컨트롤의 리스트 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.LIST_HEADER, 34);
  }
}
