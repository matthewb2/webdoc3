import type { ControlFooter } from "../../../../object/bodytext/control/ControlFooter.js";
import type { CtrlHeaderFooter } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderFooter.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraphList } from "../ForParagraphList.js";
import { ForListHeaderForHeaderFooter } from "./headerfooter/ForListHeaderForHeaderFooter.js";

/**
 * 꼬리말 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlFooter {
  /**
   * 꼬리말 컨트롤을 쓴다.
   *
   * @param f  꼬리말 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(f: ControlFooter, sw: StreamWriter): void {
    ForControlFooter.ctrlHeader(f.getHeader(), sw);

    sw.upRecordLevel();

    ForListHeaderForHeaderFooter.write(f.getListHeader(), sw);
    ForParagraphList.write(f.getParagraphList(), sw);

    sw.downRecordLevel();
  }

  /**
   * 꼬리말 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h
   * @param sw
   */
  private static ctrlHeader(h: CtrlHeaderFooter, sw: StreamWriter): void {
    ForControlFooter.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getApplyPage()!);
    sw.writeSInt4(h.getCreateIndex());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(h: CtrlHeaderFooter, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, 12);
  }
}
