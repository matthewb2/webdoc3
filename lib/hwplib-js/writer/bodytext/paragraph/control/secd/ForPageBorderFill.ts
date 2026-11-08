import type { PageBorderFill } from "../../../../../object/bodytext/control/sectiondefine/PageBorderFill.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 쪽 테두리/배경 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForPageBorderFill {
  /**
   * 쪽 테두리/배경 레코드를 쓴다.
   *
   * @param pbf 쪽 테두리/배경 레코드
   * @param sw  스트림 라이터
   */
  public static write(pbf: PageBorderFill | null, sw: StreamWriter): void {
    if (pbf === null) {
      return;
    }

    ForPageBorderFill.recordHeader(sw);

    sw.writeUInt4(pbf.getProperty().getValue());
    sw.writeUInt2(pbf.getLeftGap());
    sw.writeUInt2(pbf.getRightGap());
    sw.writeUInt2(pbf.getTopGap());
    sw.writeUInt2(pbf.getBottomGap());
    sw.writeUInt2(pbf.getBorderFillId());
  }

  /**
   * 쪽 테두리/배경 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.PAGE_BORDER_FILL, 14);
  }
}
