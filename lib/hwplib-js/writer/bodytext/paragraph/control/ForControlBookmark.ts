import type { ControlBookmark } from "../../../../object/bodytext/control/ControlBookmark.js";
import type { CtrlHeaderBookmark } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderBookmark.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForCtrlData } from "./bookmark/ForCtrlData.js";

/**
 * 첵갈피 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlBookmark {
  /**
   * 책갈피 컨트롤을 쓴다.
   *
   * @param b  책갈피 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(b: ControlBookmark, sw: StreamWriter): void {
    ForControlBookmark.ctrlHeader(b.getHeader(), sw);

    sw.upRecordLevel();

    ForCtrlData.write(b.getCtrlData(), sw);

    sw.downRecordLevel();
  }

  /**
   * 책갈피 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  책갈피 컨트롤의 컨트롤 헤더 레코
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderBookmark, sw: StreamWriter): void {
    ForControlBookmark.recordHeader(sw);
    sw.writeUInt4(h.getCtrlId());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, 4);
  }
}
