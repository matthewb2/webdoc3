import type { ControlIndexMark } from "../../../../object/bodytext/control/ControlIndexMark.js";
import type { CtrlHeaderIndexMark } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderIndexMark.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 찾아보기 표식 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlIndexMark {
  /**
   * 찾아보기 표식 컨트롤을 읽는다.
   *
   * @param idxm 찾아보기 표식 컨트롤
   * @param sr   스트림 리더
   */
  public static read(idxm: ControlIndexMark, sr: StreamReader): void {
    ForControlIndexMark.ctrlHeader(idxm.getHeader(), sr);
  }

  /**
   * 찾아보기 표시 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   *
   * @param header 찾아보기 표시 컨트롤의 컨트롤 헤더 레코드
   * @param sr     스트림 리더
   */
  private static ctrlHeader(header: CtrlHeaderIndexMark, sr: StreamReader): void {
    header.getKeyword1().setBytes(sr.readHWPString());
    header.getKeyword2().setBytes(sr.readHWPString());
    if (sr.isEndOfRecord() === false) {
      sr.skipToEndRecord();
    }
  }
}
