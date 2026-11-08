import type { ControlIndexMark } from "../../../../object/bodytext/control/ControlIndexMark.js";
import type { CtrlHeaderIndexMark } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderIndexMark.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 찾아보기 표식 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlIndexMark {
  /**
   * 찾아보기 표식 컨트롤을 쓴다.
   *
   * @param im 찾아보기 표식 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(im: ControlIndexMark, sw: StreamWriter): void {
    ForControlIndexMark.ctrlHeader(im.getHeader(), sw);
  }

  /**
   * 찾아보기 표식 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  찾아보기 표식 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderIndexMark, sw: StreamWriter): void {
    ForControlIndexMark.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeHWPString(h.getKeyword1());
    sw.writeHWPString(h.getKeyword2());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(h: CtrlHeaderIndexMark, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, ForControlIndexMark.getSize(h));
  }

  /**
   * 컨트롤 헤더 레코드의 크기를 반환한다.
   *
   * @param h 컨트롤 헤더 레코드
   * @return 컨트롤 헤더 레코드의 크기
   */
  private static getSize(h: CtrlHeaderIndexMark): number {
    let size = 0;
    size += 4;
    size += h.getKeyword1().getWCharsSize();
    size += h.getKeyword2().getWCharsSize();
    return size;
  }
}
