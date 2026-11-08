import type { LayoutCompatibility } from "../../object/docinfo/LayoutCompatibility.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 레이아웃 호환 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForLayoutCompatibility {
  /**
   * 레이아웃 호환 레코드를 쓴다.
   *
   * @param lc 레이아웃 호환 레코드
   * @param sw 스트림 라이터
   */
  public static write(lc: LayoutCompatibility, sw: StreamWriter): void {
    ForLayoutCompatibility.recordHeader(sw);

    sw.writeUInt4(lc.getLetterLevelFormat());
    sw.writeUInt4(lc.getParagraphLevelFormat());
    sw.writeUInt4(lc.getSectionLevelFormat());
    sw.writeUInt4(lc.getObjectLevelFormat());
    sw.writeUInt4(lc.getFieldLevelFormat());
  }

  /**
   * 레이아웃 호환 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이더
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.LAYOUT_COMPATIBILITY, 20);
  }
}
