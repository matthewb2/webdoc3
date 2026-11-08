import type { ControlAdditionalText } from "../../../../object/bodytext/control/ControlAdditionalText.js";
import type { CtrlHeaderAdditionalText } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderAdditionalText.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 덧말 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlAdditionalText {
  /**
   * 덧말 컨트롱을 쓴다.
   *
   * @param at 덧말 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(at: ControlAdditionalText, sw: StreamWriter): void {
    ForControlAdditionalText.ctrlHeader(at.getHeader(), sw);
  }

  /**
   * 덧말 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderAdditionalText, sw: StreamWriter): void {
    ForControlAdditionalText.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());
    sw.writeHWPString(h.getMainText());
    sw.writeHWPString(h.getSubText());
    sw.writeUInt4(h.getPosition()!);
    sw.writeUInt4(h.getFsizeratio());
    sw.writeUInt4(h.getOption());
    sw.writeUInt4(h.getStyleId());
    sw.writeUInt4(h.getAlignment()!);
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(h: CtrlHeaderAdditionalText, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, ForControlAdditionalText.getSize(h));
  }

  /**
   * 컨트롤 헤더 레코드의 크기를 반환한다.
   *
   * @param h 컨트롤 헤더 레코드
   * @return 컨트롤 헤더 레코드의 크기
   */
  private static getSize(h: CtrlHeaderAdditionalText): number {
    let size = 0;
    size += 4;
    size += h.getMainText().getWCharsSize();
    size += h.getSubText().getWCharsSize();
    size += 20;
    return size;
  }
}
