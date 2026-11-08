import type { ControlNewNumber } from "../../../../object/bodytext/control/ControlNewNumber.js";
import type { CtrlHeaderNewNumber } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderNewNumber.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 새 번호 지정 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlNewNumber {
  /**
   * 새 번호 지정 컨트롤을 쓴다.
   *
   * @param nn 새 번호 지정 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(nn: ControlNewNumber, sw: StreamWriter): void {
    ForControlNewNumber.ctrlHeader(nn.getHeader(), sw);
  }

  /**
   * 새 번호 지정 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  새 번호 지정 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderNewNumber, sw: StreamWriter): void {
    ForControlNewNumber.recordHeader(sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getProperty().getValue());
    sw.writeUInt2(h.getNumber());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, 10);
  }
}
