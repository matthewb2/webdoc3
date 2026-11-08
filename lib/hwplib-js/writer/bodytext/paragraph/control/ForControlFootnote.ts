import type { ControlFootnote } from "../../../../object/bodytext/control/ControlFootnote.js";
import type { CtrlHeaderFootnote } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderFootnote.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraphList } from "../ForParagraphList.js";
import { ForListHeaderForFootnodeEndnote } from "./endnote/ForListHeaderForFootnodeEndnote.js";

/**
 * 각주 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlFootnote {
  /**
   * 각주 컨트롤을 쓴다.
   *
   * @param fn 각주 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(fn: ControlFootnote, sw: StreamWriter): void {
    ForControlFootnote.ctrlHeader(fn.getHeader(), sw);

    sw.upRecordLevel();

    ForListHeaderForFootnodeEndnote.write(fn.getListHeader(), sw);
    ForParagraphList.write(fn.getParagraphList(), sw);

    sw.downRecordLevel();
  }

  /**
   * 각주 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  각주 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderFootnote, sw: StreamWriter): void {
    ForControlFootnote.recordHeader(sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getNumber());
    sw.writeWChar(h.getBeforeDecorationLetter().getBytes());
    sw.writeWChar(h.getAfterDecorationLetter().getBytes());
    sw.writeUInt4(h.getNumberShape()!);
    sw.writeUInt4(h.getInstanceId());
  }

  /**
   * 컨트롤 헤더 레코드를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, 20);
  }
}
