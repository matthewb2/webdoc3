import { HWPTag } from "../../../../../../object/etc/HWPTag.js";
import { BitFlag } from "../../../../../../util/binary/BitFlag.js";
import type { CtrlHeaderGso } from "../../../../../../object/bodytext/control/ctrlheader/CtrlHeaderGso.js";
import type { StreamWriter } from "../../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 그리기 개체의 컨트롤 헤더 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForCtrlHeaderGso {
  /**
   * 그리기 개체의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  그리기 개체의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  public static write(h: CtrlHeaderGso, sw: StreamWriter): void {
    ForCtrlHeaderGso.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getProperty().getValue());
    sw.writeUInt4(h.getyOffset());
    sw.writeUInt4(h.getxOffset());
    sw.writeUInt4(h.getWidth());
    sw.writeUInt4(h.getHeight());
    sw.writeSInt4(h.getzOrder());
    sw.writeUInt2(h.getOutterMarginLeft());
    sw.writeUInt2(h.getOutterMarginRight());
    sw.writeUInt2(h.getOutterMarginTop());
    sw.writeUInt2(h.getOutterMarginBottom());
    sw.writeUInt4(h.getInstanceId());
    let temp = 0;
    temp = BitFlag.set(temp, 0, h.isPreventPageDivide());
    sw.writeSInt4(temp);
    sw.writeHWPString(h.getExplanation());
    if (h.getUnknown() !== null) {
      sw.writeBytes(h.getUnknown()!);
    }
  }

  /**
   * 그리기 개체의 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  그리기 개체의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(h: CtrlHeaderGso, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, ForCtrlHeaderGso.getSize(h));
  }

  /**
   * 그리기 개체의 컨트롤 헤더 레코드의 크기를 반환한다.
   *
   * @param h 그리기 개체의 컨트롤 헤더 레코드
   * @return 그리기 개체의 컨트롤 헤더 레코드의 크기
   */
  private static getSize(h: CtrlHeaderGso): number {
    let size = 0;
    size += 44;
    size += h.getExplanation().getWCharsSize();
    if (h.getUnknown() !== null) {
      size += h.getUnknown()!.length;
    }
    return size;
  }
}
