import type { ControlAdditionalText } from "../../../../object/bodytext/control/ControlAdditionalText.js";
import type { CtrlHeaderAdditionalText } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderAdditionalText.js";
import { AdditionalTextPosition } from "../../../../object/bodytext/control/ctrlheader/additionaltext/AdditionalTextPosition.js";
import { Alignment } from "../../../../object/docinfo/parashape/Alignment.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 덧말 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlAdditionalText {
  /**
   * 덧말 컨트롤을 읽는다.
   *
   * @param at 덧말 컨트롤
   * @param sr 스트림 리더
   */
  public static read(at: ControlAdditionalText, sr: StreamReader): void {
    ForControlAdditionalText.ctrlHeader(at.getHeader(), sr);
  }

  /**
   * 덧말 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   *
   * @param h  덧말 컨트롤의 컨트롤 헤더 레코드
   * @param sr 스트림 리더
   */
  private static ctrlHeader(h: CtrlHeaderAdditionalText, sr: StreamReader): void {
    h.getMainText().setBytes(sr.readHWPString());
    h.getSubText().setBytes(sr.readHWPString());
    h.setPosition(AdditionalTextPosition.valueOf(sr.readUInt4()));
    h.setFsizeratio(sr.readUInt4());
    h.setOption(sr.readUInt4());
    h.setStyleId(sr.readUInt4());
    h.setAlignment(Alignment.valueOf(sr.readUInt4()));
  }
}
