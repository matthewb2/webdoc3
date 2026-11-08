import type { ControlPageHide } from "../../../../object/bodytext/control/ControlPageHide.js";
import type { CtrlHeaderPageHide } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderPageHide.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 감추기 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlPageHide {
  /**
   * 감추기 컨트롤을 쓴다.
   *
   * @param ph 감추기 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(ph: ControlPageHide, sw: StreamWriter): void {
    ForControlPageHide.ctrlHeader(ph.getHeader(), sw);
  }

  /**
   * 감추기 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  감추기 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderPageHide, sw: StreamWriter): void {
    ForControlPageHide.recordHeader(sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getProperty().getValue());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, 8);
  }
}
