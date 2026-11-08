import type { ControlEndnote } from "../../../../object/bodytext/control/ControlEndnote.js";
import type { CtrlHeaderEndnote } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderEndnote.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraphList } from "../ForParagraphList.js";
import { ForListHeaderForFootnodeEndnote } from "./endnote/ForListHeaderForFootnodeEndnote.js";

/**
 * 미주 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlEndnote {
  /**
   * 미주 컨트롤을 쓴다.
   *
   * @param en 미주 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(en: ControlEndnote, sw: StreamWriter): void {
    ForControlEndnote.ctrlHeader(en.getHeader(), sw);

    sw.upRecordLevel();

    ForListHeaderForFootnodeEndnote.write(en.getListHeader(), sw);
    ForParagraphList.write(en.getParagraphList(), sw);

    sw.downRecordLevel();
  }

  /**
   * 미주 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  미주 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 헤더
   */
  private static ctrlHeader(h: CtrlHeaderEndnote, sw: StreamWriter): void {
    ForControlEndnote.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getNumber());
    sw.writeWChar(h.getBeforeDecorationLetter().getBytes());
    sw.writeWChar(h.getAfterDecorationLetter().getBytes());
    sw.writeUInt4(h.getNumberShape()!);
    sw.writeUInt4(h.getInstanceId());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 헤더
   */
  private static recordHeader(h: CtrlHeaderEndnote, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, 20);
  }
}
