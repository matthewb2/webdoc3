import type { ControlAutoNumber } from "../../../../object/bodytext/control/ControlAutoNumber.js";
import type { CtrlHeaderAutoNumber } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderAutoNumber.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 자동 번호 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlAutoNumber {
  /**
   * 자동 번호 컨트롤을 읽는다.
   *
   * @param an 자동번호 컨트롤
   * @param sr 스트림 리더
   */
  public static read(an: ControlAutoNumber, sr: StreamReader): void {
    ForControlAutoNumber.ctrlHeader(an.getHeader(), sr);
  }

  /**
   * 자동 번호 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   *
   * @param h  자동 번호 컨트롤의 컨트롤 헤더 레코드
   * @param sr 스트림 리더
   */
  private static ctrlHeader(h: CtrlHeaderAutoNumber, sr: StreamReader): void {
    h.getProperty().setValue(sr.readUInt4());
    h.setNumber(sr.readUInt2());
    h.getUserSymbol().setBytes(sr.readWChar());
    h.getBeforeDecorationLetter().setBytes(sr.readWChar());
    h.getAfterDecorationLetter().setBytes(sr.readWChar());
  }
}
