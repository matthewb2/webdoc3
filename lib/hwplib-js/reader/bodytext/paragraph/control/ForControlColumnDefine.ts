import type { ControlColumnDefine } from "../../../../object/bodytext/control/ControlColumnDefine.js";
import type { CtrlHeaderColumnDefine } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderColumnDefine.js";
import { BorderThickness } from "../../../../object/docinfo/borderfill/BorderThickness.js";
import { BorderType } from "../../../../object/docinfo/borderfill/BorderType.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 단 정의 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlColumnDefine {
  /**
   * 단 정의 컨트롤을 읽는다.
   *
   * @param cd 단 정의 컨트롤
   * @param sr 스트림 리더
   */
  public static read(cd: ControlColumnDefine, sr: StreamReader): void {
    ForControlColumnDefine.ctrlHeader(cd.getHeader(), sr);
  }

  /**
   * 단 정의 컨트롤 헤더 레코드를 읽는다.
   *
   * @param h  단 정의 컨트롤의 컨트롤 헤더 레코드
   * @param sr 스트림 리더
   */
  private static ctrlHeader(h: CtrlHeaderColumnDefine, sr: StreamReader): void {
    h.getProperty().setValue(sr.readUInt2());

    const count = h.getProperty().getColumnCount();
    const sameWidth = h.getProperty().isSameWidth();
    if (count < 2 || sameWidth === true) {
      h.setGapBetweenColumn(sr.readUInt2());
      h.setProperty2(sr.readUInt2());
    } else {
      h.setProperty2(sr.readUInt2());
      ForControlColumnDefine.columnInfos(h, sr);
    }

    h.getDivideLine().setType(BorderType.valueOf(sr.readUInt1()));
    h.getDivideLine().setThickness(BorderThickness.valueOf(sr.readUInt1()));
    h.getDivideLine().getColor().setValue(sr.readUInt4());

    sr.skipToEndRecord();
  }

  /**
   * 단 정의 컨트롤의 컨트롤 헤더 레코드의 단 정보 부분를 읽는다.
   *
   * @param h  단 정의 컨트롤의 컨트롤 헤더 레코드
   * @param sr 스트림 리더
   */
  private static columnInfos(h: CtrlHeaderColumnDefine, sr: StreamReader): void {
    const count = h.getProperty().getColumnCount();
    for (let index = 0; index < count; index++) {
      const ci = h.addNewColumnInfo();
      ci.setWidth(sr.readUInt2());
      ci.setGap(sr.readUInt2());
    }
  }
}
