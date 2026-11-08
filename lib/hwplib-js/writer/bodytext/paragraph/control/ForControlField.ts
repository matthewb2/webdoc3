import type { ControlField } from "../../../../object/bodytext/control/ControlField.js";
import { ControlType } from "../../../../object/bodytext/control/ControlType.js";
import type { CtrlHeaderField } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderField.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForCtrlData } from "./bookmark/ForCtrlData.js";

/**
 * 필드 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlField {
  /**
   * 필드 컨트롤을 쓴다.
   *
   * @param f  필드 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(f: ControlField, sw: StreamWriter): void {
    ForControlField.ctrlHeader(f.getHeader(), sw);
    sw.upRecordLevel();

    ForCtrlData.write(f.getCtrlData(), sw);

    sw.downRecordLevel();
  }

  /**
   * 필드 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  필드 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderField, sw: StreamWriter): void {
    ForControlField.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getProperty().getValue());
    sw.writeUInt1(h.getEtcProperty());
    sw.writeHWPString(h.getCommand());
    sw.writeUInt4(h.getInstanceId());

    if (h.getCtrlId() === ControlType.getCtrlId(ControlType.FIELD_UNKNOWN)) {
      sw.writeSInt4(h.getMemoIndex());
    } else {
      sw.writeZero(4);
    }
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(h: CtrlHeaderField, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, ForControlField.getSize(h));
  }

  /**
   * 컨트롤 헤더 레코드의 크기를 반환한다.
   *
   * @param h 컨트롤 헤더 레코드
   * @return 컨트롤 헤더 레코드의 크기
   */
  private static getSize(h: CtrlHeaderField): number {
    let size = 0;
    size += 9;
    size += h.getCommand().getWCharsSize();
    size += 8;
    return size;
  }
}
