import type { ControlNewNumber } from "../../../../object/bodytext/control/ControlNewNumber.js";
import type { CtrlHeaderNewNumber } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderNewNumber.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 새 번호 지정 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlNewNumber {
  /**
   * 새 번호 지정 컨트롤을 읽는다.
   *
   * @param nwno 새 번호 지정 컨트롤
   * @param sr   스트림 리더
   */
  public static read(nwno: ControlNewNumber, sr: StreamReader): void {
    ForControlNewNumber.ctrlHeader(nwno.getHeader(), sr);
  }

  /**
   * 새 번호 지정 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   *
   * @param header 새 번호 지정 컨트롤의 컨트롤 헤더 레코드
   * @param sr     스트림 리더
   */
  private static ctrlHeader(header: CtrlHeaderNewNumber, sr: StreamReader): void {
    header.getProperty().setValue(sr.readUInt4());
    header.setNumber(sr.readUInt2());
  }
}
