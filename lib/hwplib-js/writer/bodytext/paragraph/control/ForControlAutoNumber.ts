import type { ControlAutoNumber } from "../../../../object/bodytext/control/ControlAutoNumber.js";
import type { CtrlHeaderAutoNumber } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderAutoNumber.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 자동 번호 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlAutoNumber {
  /**
   * 자동 번호 컨트롤을 쓴다.
   *
   * @param an 자동 번호 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(an: ControlAutoNumber, sw: StreamWriter): void {
    ForControlAutoNumber.ctrlHeader(an.getHeader(), sw);
  }

  /**
   * 자동 번호 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  자동 번호 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderAutoNumber, sw: StreamWriter): void {
    ForControlAutoNumber.recordHeader(sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getProperty().getValue());
    sw.writeUInt2(h.getNumber());
    sw.writeWChar(h.getUserSymbol().getBytes());
    sw.writeWChar(h.getBeforeDecorationLetter().getBytes());
    sw.writeWChar(h.getAfterDecorationLetter().getBytes());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, 16);
  }
}
