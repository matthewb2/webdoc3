import type { ListHeaderForHiddenComment } from "../../../../../object/bodytext/control/hiddencomment/ListHeaderForHiddenComment.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 숨은 설명 컨트롤의 리스트 헤더 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForListHeaderForHiddenComment {
  /**
   * 숨은 설명 컨트롤의 리스트 헤더 레코드를 쓴다.
   *
   * @param lh 숨은 설명 컨트롤의 리스트 헤더 레코드
   * @param sw 스트림 라이터
   */
  public static write(lh: ListHeaderForHiddenComment, sw: StreamWriter): void {
    ForListHeaderForHiddenComment.recordHeader(sw);

    sw.writeSInt4(lh.getParaCount());
    sw.writeUInt4(lh.getProperty().getValue());
    sw.writeZero(8);
  }

  /**
   * 숨은 설명 컨트롤의 리스트 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.LIST_HEADER, 16);
  }
}
