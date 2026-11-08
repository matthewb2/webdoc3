import type { ControlHiddenComment } from "../../../../object/bodytext/control/ControlHiddenComment.js";
import type { CtrlHeader } from "../../../../object/bodytext/control/ctrlheader/CtrlHeader.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraphList } from "../ForParagraphList.js";
import { ForListHeaderForHiddenComment } from "./hiddencomment/ForListHeaderForHiddenComment.js";

/**
 * 숨은 설명 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlHiddenComment {
  /**
   * 숨은 설명 컨트롤을 쓴다.
   *
   * @param hc 숨은 설명 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(hc: ControlHiddenComment, sw: StreamWriter): void {
    ForControlHiddenComment.ctrlHeader(hc.getHeader(), sw);

    sw.upRecordLevel();

    ForListHeaderForHiddenComment.write(hc.getListHeader(), sw);
    ForParagraphList.write(hc.getParagraphList(), sw);

    sw.downRecordLevel();
  }

  /**
   * 숨은 설명 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  숨은 설명 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeader, sw: StreamWriter): void {
    ForControlHiddenComment.recordHeader(sw);
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
