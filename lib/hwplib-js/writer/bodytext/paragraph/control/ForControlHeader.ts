import type { ControlHeader } from "../../../../object/bodytext/control/ControlHeader.js";
import type { CtrlHeaderHeader } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderHeader.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraphList } from "../ForParagraphList.js";
import { ForListHeaderForHeaderFooter } from "./headerfooter/ForListHeaderForHeaderFooter.js";

/**
 * 머리말 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlHeader {
  /**
   * 머리말 컨트롤을 쓴다.
   *
   * @param h  머리말 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(h: ControlHeader, sw: StreamWriter): void {
    ForControlHeader.ctrlHeader(h.getHeader(), sw);

    sw.upRecordLevel();

    ForListHeaderForHeaderFooter.write(h.getListHeader(), sw);
    ForParagraphList.write(h.getParagraphList(), sw);

    sw.downRecordLevel();
  }

  /**
   * 머리말 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  머리말 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderHeader, sw: StreamWriter): void {
    ForControlHeader.recordHeader(sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getApplyPage()!);
    sw.writeSInt4(h.getCreateIndex());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, 12);
  }
}
