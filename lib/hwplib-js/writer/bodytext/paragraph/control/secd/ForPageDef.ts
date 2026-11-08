import type { PageDef } from "../../../../../object/bodytext/control/sectiondefine/PageDef.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 용지 설정 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForPageDef {
  /**
   * 용지 설정 레코드를 쓴다.
   *
   * @param pd 용지 설정 레코드
   * @param sw 스트림 라이터
   */
  public static write(pd: PageDef | null, sw: StreamWriter): void {
    if (pd === null) {
      return;
    }

    ForPageDef.recordHeader(sw);

    sw.writeUInt4(pd.getPaperWidth());
    sw.writeUInt4(pd.getPaperHeight());
    sw.writeUInt4(pd.getLeftMargin());
    sw.writeUInt4(pd.getRightMargin());
    sw.writeUInt4(pd.getTopMargin());
    sw.writeUInt4(pd.getBottomMargin());
    sw.writeUInt4(pd.getHeaderMargin());
    sw.writeUInt4(pd.getFooterMargin());
    sw.writeUInt4(pd.getGutterMargin());
    sw.writeUInt4(pd.getProperty().getValue());
  }

  /**
   * 용지 설정 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.PAGE_DEF, 40);
  }
}
