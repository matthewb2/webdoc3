import { ParameterSet } from "../../../../../object/bodytext/control/bookmark/ParameterSet.js";
import type { Cell } from "../../../../../object/bodytext/control/table/Cell.js";
import type { ListHeaderForCell } from "../../../../../object/bodytext/control/table/ListHeaderForCell.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraphList } from "../../ForParagraphList.js";
import { ForParameterSet } from "../bookmark/ForParameterSet.js";

/**
 * 표 컨트롤의 셀을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForCell {
  /**
   * 표 컨트롤의 셀을 쓴다.
   *
   * @param c  셀 객체
   * @param sw 스트림 라이터
   */
  public static write(c: Cell, sw: StreamWriter): void {
    ForCell.listHeader(c.getListHeader(), sw);
    ForParagraphList.write(c.getParagraphList(), sw);
  }

  /**
   * 셀의 리스트 헤더 레코드를 쓴다.
   *
   * @param lh 셀의 리스트 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static listHeader(lh: ListHeaderForCell, sw: StreamWriter): void {
    const psFieldName = ParameterSet.createForFieldName(lh.getFieldName());
    ForCell.recordHeader(psFieldName, sw);

    sw.writeSInt4(lh.getParaCount());
    sw.writeUInt4(lh.getProperty().getValue());
    sw.writeUInt2(lh.getColIndex());
    sw.writeUInt2(lh.getRowIndex());
    sw.writeUInt2(lh.getColSpan());
    sw.writeUInt2(lh.getRowSpan());
    sw.writeUInt4(lh.getWidth());
    sw.writeUInt4(lh.getHeight());
    sw.writeUInt2(lh.getLeftMargin());
    sw.writeUInt2(lh.getRightMargin());
    sw.writeUInt2(lh.getTopMargin());
    sw.writeUInt2(lh.getBottomMargin());
    sw.writeUInt2(lh.getBorderFillId());
    sw.writeUInt4(lh.getTextWidth());
    if (psFieldName !== null) {
      const flag = 0xff;
      sw.writeUInt1(flag);

      ForParameterSet.write(psFieldName, sw);
    } else {
      const flag = 0x0;
      sw.writeUInt1(flag);
    }
    sw.writeZero(8);
  }

  /**
   * 셀의 리스트 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param psFieldName 필드 이름을 위한 파라미터 셋
   * @param sw          스트림 라이터
   */
  private static recordHeader(psFieldName: ParameterSet | null, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.LIST_HEADER, ForCell.getSize(psFieldName));
  }

  /**
   * 셀의 리스트 헤더 레코드의 크기를 반환한다.
   *
   * @param psFieldName 필드 이름을 위한 파라미터 셋
   * @return 셀의 리스트 헤더 레코드의 크기
   */
  private static getSize(psFieldName: ParameterSet | null): number {
    let size = 0;
    size += 38;

    if (psFieldName !== null) {
      size += 1;
      size += ForParameterSet.getSize(psFieldName);
    } else {
      size += 1;
    }
    size += 8;
    return size;
  }
}
