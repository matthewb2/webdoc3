import type { ControlPageHide } from "../../../../object/bodytext/control/ControlPageHide.js";
import type { CtrlHeaderPageHide } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderPageHide.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 감추기 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlPageHide {
  /**
   * 감추기 컨트롤을 읽는다.
   *
   * @param pghd 감추기 컨트롤
   * @param sr   스트림 리더
   */
  public static read(pghd: ControlPageHide, sr: StreamReader): void {
    ForControlPageHide.ctrlHeader(pghd.getHeader(), sr);
  }

  /**
   * 감추기 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   *
   * @param header 감추기 컨트롤의 컨트롤 헤더 레코드
   * @param sr     스트림 리더
   */
  private static ctrlHeader(header: CtrlHeaderPageHide, sr: StreamReader): void {
    header.getProperty().setValue(sr.readUInt4());
  }
}
