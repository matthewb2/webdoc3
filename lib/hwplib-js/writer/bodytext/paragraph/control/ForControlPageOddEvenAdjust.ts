import type { ControlPageOddEvenAdjust } from "../../../../object/bodytext/control/ControlPageOddEvenAdjust.js";
import type { CtrlHeaderPageOddEvenAdjust } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderPageOddEvenAdjust.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 홀/짝수 조정(페이지 번호 제어) 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlPageOddEvenAdjust {
  /**
   * 홀/짝수 조정(페이지 번호 제어) 컨트롤을 쓴다.
   *
   * @param pgoea 홀/짝수 조정(페이지 번호 제어) 컨트롤
   * @param sw    스트림 라이터
   */
  public static write(pgoea: ControlPageOddEvenAdjust, sw: StreamWriter): void {
    ForControlPageOddEvenAdjust.ctrlHeader(pgoea.getHeader(), sw);
  }

  /**
   * 홀/짝수 조정(페이지 번호 제어) 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  홀/짝수 조정(페이지 번호 제어) 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderPageOddEvenAdjust, sw: StreamWriter): void {
    ForControlPageOddEvenAdjust.recordHeader(sw);
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
