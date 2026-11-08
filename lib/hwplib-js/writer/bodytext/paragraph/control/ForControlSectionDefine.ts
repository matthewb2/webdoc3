import type { ControlSectionDefine } from "../../../../object/bodytext/control/ControlSectionDefine.js";
import type { CtrlHeaderSectionDefine } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderSectionDefine.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForCtrlData } from "./bookmark/ForCtrlData.js";
import { ForBatangPageInfo } from "./secd/ForBatangPageInfo.js";
import { ForFootEndNoteShape } from "./secd/ForFootEndNoteShape.js";
import { ForPageBorderFill } from "./secd/ForPageBorderFill.js";
import { ForPageDef } from "./secd/ForPageDef.js";

/**
 * 구역 정의 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlSectionDefine {
  /**
   * 구역 정의 컨트롤을 쓴다.
   *
   * @param sd 구역 정의 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(sd: ControlSectionDefine, sw: StreamWriter): void {
    ForControlSectionDefine.ctrlHeader(sd.getHeader(), sw);

    sw.upRecordLevel();

    ForControlSectionDefine.ctrlData(sd, sw);
    ForPageDef.write(sd.getPageDef(), sw);
    ForFootEndNoteShape.write(sd.getFootNoteShape(), sw);
    ForFootEndNoteShape.write(sd.getEndNoteShape(), sw);
    ForPageBorderFill.write(sd.getBothPageBorderFill(), sw);
    ForPageBorderFill.write(sd.getEvenPageBorderFill(), sw);
    ForPageBorderFill.write(sd.getOddPageBorderFill(), sw);
    ForControlSectionDefine.batangPageInfoList(sd, sw);

    sw.downRecordLevel();
  }

  /**
   * 구역 정의 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  구역 정의 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderSectionDefine, sw: StreamWriter): void {
    ForControlSectionDefine.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());

    sw.writeUInt4(h.getProperty().getValue());
    sw.writeUInt2(h.getColumnGap());
    sw.writeUInt2(h.getVerticalLineAlign());
    sw.writeUInt2(h.getHorizontalLineAlign());
    sw.writeUInt4(h.getDefaultTabGap());
    sw.writeUInt2(sw.correctParaShapeId(sw.correctParaShapeId(h.getNumberParaShapeId())));
    sw.writeUInt2(h.getPageStartNumber());
    sw.writeUInt2(h.getImageStartNumber());
    sw.writeUInt2(h.getTableStartNumber());
    sw.writeUInt2(h.getEquationStartNumber());
    if (sw.getFileVersion()!.isOver(5, 0, 1, 2)) {
      sw.writeUInt2(h.getDefaultLanguage());
    }
    sw.writeZero(8);
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(h: CtrlHeaderSectionDefine, sw: StreamWriter): void {
    const size = sw.getFileVersion()!.isOver(5, 0, 1, 2) ? 38 : 36;
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, size);
  }

  /**
   * 바탕쪽 정보를 쓴다.
   *
   * @param sd 구역 정의 컨트롤
   * @param sw 스트림 라이터
   */
  private static batangPageInfoList(sd: ControlSectionDefine, sw: StreamWriter): void {
    for (const bpi of sd.getBatangPageInfoList()) {
      ForBatangPageInfo.write(bpi, sw);
    }
  }

  /**
   * 컨트롤 데이터(??)를 쓴다.
   *
   * @param sd 구역 정의 컨트롤
   * @param sw 스트림 라이터
   */
  private static ctrlData(sd: ControlSectionDefine, sw: StreamWriter): void {
    if (sd.getCtrlData() !== null) {
      ForCtrlData.write(sd.getCtrlData(), sw);
    }
  }
}
