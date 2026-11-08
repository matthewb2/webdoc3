import type { ControlField } from "../../../../object/bodytext/control/ControlField.js";
import { ControlType } from "../../../../object/bodytext/control/ControlType.js";
import type { CtrlHeaderField } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderField.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "./bookmark/ForCtrlData.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 필드 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlField {
  /**
   * 필드 컨트롤을 읽는다.
   *
   * @param field 필드 컨트롤
   * @param sr    스트림 리더
   */
  public static read(field: ControlField, sr: StreamReader): void {
    ForControlField.ctrlHeader(field.getHeader(), sr);
    ForControlField.ctrlData(field, sr);
  }

  /**
   * 필드 컨트롤의 컨트롤 헤더 레코드을 읽는다.
   *
   * @param h  필드 컨트롤의 컨트롤 헤더
   * @param sr 스트림 리더
   */
  private static ctrlHeader(h: CtrlHeaderField, sr: StreamReader): void {
    h.getProperty().setValue(sr.readUInt4());
    h.setEtcProperty(sr.readUInt1());
    h.getCommand().setBytes(sr.readHWPString());
    h.setInstanceId(sr.readUInt4());

    if (
      sr.isEndOfRecord() === false &&
      h.getCtrlId() === ControlType.getCtrlId(ControlType.FIELD_UNKNOWN)
    ) {
      h.setMemoIndex(sr.readSInt4());
    }

    if (sr.isEndOfRecord()) return;

    ForControlField.unknownBytes(sr);
  }

  /**
   * 알려지지 않은 byte을 처리한다.
   *
   * @param sr 스트림 리더
   */
  private static unknownBytes(sr: StreamReader): void {
    sr.skipToEndRecord();
  }

  /**
   * 컨트롤 데이터 레코드를 읽는다.
   *
   * @param field 필드 컨트롤
   * @param sr    스트림 리더
   */
  private static ctrlData(field: ControlField, sr: StreamReader): void {
    const rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.CTRL_DATA) {
      field.createCtrlData();
      ForCtrlData.read(field.getCtrlData()!, sr);
    }
  }
}
