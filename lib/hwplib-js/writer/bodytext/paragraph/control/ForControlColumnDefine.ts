import type { ControlColumnDefine } from "../../../../object/bodytext/control/ControlColumnDefine.js";
import type { CtrlHeaderColumnDefine } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderColumnDefine.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForCtrlData } from "./bookmark/ForCtrlData.js";

/**
 * 단 정의 컨트롤를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlColumnDefine {
  /**
   * 단 정의 컨트롤를 쓴다.
   *
   * @param cd 단 정의 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(cd: ControlColumnDefine, sw: StreamWriter): void {
    ForControlColumnDefine.ctrlHeader(cd.getHeader(), sw);

    sw.upRecordLevel();

    ForCtrlData.write(cd.getCtrlData(), sw);

    sw.downRecordLevel();
  }

  /**
   * 단 정의 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  단 정의 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderColumnDefine, sw: StreamWriter): void {
    ForControlColumnDefine.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt2(h.getProperty().getValue());

    const columnCount = h.getProperty().getColumnCount();
    const sameWidth = h.getProperty().isSameWidth();
    if (columnCount < 2 || sameWidth === true) {
      sw.writeUInt2(h.getGapBetweenColumn());
      sw.writeUInt2(h.getProperty2());
    } else {
      sw.writeUInt2(h.getProperty2());
      ForControlColumnDefine.columnInfos(h, sw);
    }

    sw.writeUInt1(h.getDivideLine().getType()!);
    sw.writeUInt1(h.getDivideLine().getThickness()!);
    sw.writeUInt4(h.getDivideLine().getColor().getValue());
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(h: CtrlHeaderColumnDefine, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, ForControlColumnDefine.getSize(h));
  }

  /**
   * 컨트롤 헤더 레코드의 크기를 반환한다.
   *
   * @param h 컨트롤 헤더 레코드
   * @return 컨트롤 헤더 레코드의 크기
   */
  private static getSize(h: CtrlHeaderColumnDefine): number {
    let size = 0;
    size += 6;

    const columnCount = h.getProperty().getColumnCount();
    const sameWidth = h.getProperty().isSameWidth();
    if (columnCount < 2 || sameWidth === true) {
      size += 4;
    } else {
      size += 2 + columnCount * 4;
    }
    size += 6;
    return size;
  }

  /**
   * 컨트롤 헤더 레코드의 단 정보 부분를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static columnInfos(h: CtrlHeaderColumnDefine, sw: StreamWriter): void {
    const count = h.getProperty().getColumnCount();
    for (let index = 0; index < count; index++) {
      const ci = h.getColumnInfoList()[index]!;
      sw.writeUInt2(ci.getWidth());
      sw.writeUInt2(ci.getGap());
    }
  }
}
