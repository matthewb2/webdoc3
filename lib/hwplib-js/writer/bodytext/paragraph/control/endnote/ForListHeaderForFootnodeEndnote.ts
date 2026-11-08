import type { ListHeaderForFootnodeEndnote } from "../../../../../object/bodytext/control/footnoteendnote/ListHeaderForFootnodeEndnote.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 미주/각주 컨트롤의 리스트 헤더 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForListHeaderForFootnodeEndnote {
  /**
   * 미주/각주 컨트롤의 리스트 헤더 레코드를 쓴다.
   *
   * @param lh 미주/각주 컨트롤의 리스트 헤더 레코드
   * @param sw 스트림 라이터
   */
  public static write(lh: ListHeaderForFootnodeEndnote, sw: StreamWriter): void {
    ForListHeaderForFootnodeEndnote.recordHeader(sw);

    sw.writeSInt4(lh.getParaCount());
    sw.writeUInt4(lh.getProperty().getValue());
    sw.writeZero(8);
  }

  /**
   * 리스트 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.LIST_HEADER, 16);
  }
}
