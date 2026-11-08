import { ParameterSet } from "../../../../../object/bodytext/control/bookmark/ParameterSet.js";
import { ParameterType } from "../../../../../object/bodytext/control/bookmark/ParameterType.js";
import type { Cell } from "../../../../../object/bodytext/control/table/Cell.js";
import type { ListHeaderForCell } from "../../../../../object/bodytext/control/table/ListHeaderForCell.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";
import { ForParagraphList } from "../../../ForParagraphList.js";
import { ForParameterSet } from "../bookmark/ForParameterSet.js";

/**
 * 표의 셀을 읽기 위한 객체
 *
 * @author 박성균
 */
export class ForCell {
  /**
   * 표의 셀을 읽는다.
   *
   * @param cell 표의 셀
   * @param sr   스트림 리더
   */
  public static read(cell: Cell, sr: StreamReader): void {
    if (sr.isImmediatelyAfterReadingHeader() === false) {
      sr.readRecordHeader();
    }
    if (sr.getCurrentRecordHeader().getTagID() === HWPTag.LIST_HEADER) {
      ForCell.listHeader(cell.getListHeader(), sr);
    } else {
      throw new Error("cell's list header does not exist.");
    }
    ForParagraphList.read(cell.getParagraphList(), sr);
  }

  /**
   * 셀의 문단 리스트 헤더 레코드를 읽는다.
   *
   * @param lh 셀의 문단 리스트 헤더 레코드
   * @param sr 스트림 리더
   */
  private static listHeader(lh: ListHeaderForCell, sr: StreamReader): void {
    lh.setParaCount(sr.readSInt4());
    lh.getProperty().setValue(sr.readUInt4());
    lh.setColIndex(sr.readUInt2());
    lh.setRowIndex(sr.readUInt2());
    lh.setColSpan(sr.readUInt2());
    lh.setRowSpan(sr.readUInt2());
    lh.setWidth(sr.readUInt4());
    lh.setHeight(sr.readUInt4());
    lh.setLeftMargin(sr.readUInt2());
    lh.setRightMargin(sr.readUInt2());
    lh.setTopMargin(sr.readUInt2());
    lh.setBottomMargin(sr.readUInt2());
    lh.setBorderFillId(sr.readUInt2());
    lh.setTextWidth(sr.readUInt4());
    if (sr.getCurrentRecordHeader().getSize() > sr.getCurrentPositionAfterHeader()) {
      const flag = sr.readUInt1();
      if (flag === 0xff) {
        ForCell.fieldName(lh, sr);
      }
      ForCell.unknownRestBytes(sr);
    }
  }

  /**
   * 필드 이름을 읽는다.
   *
   * @param lh 셀의 문단 리스트 헤더 레코드
   * @param sr 스트림 리더
   */
  private static fieldName(lh: ListHeaderForCell, sr: StreamReader): void {
    const ps = new ParameterSet();
    ForParameterSet.read(ps, sr);

    if (ps.getId() === 0x21b) {
      for (const pi of ps.getParameterItemList()) {
        if (pi.getId() === 0x4000 && pi.getType() === ParameterType.String) {
          lh.setFieldName(pi.getValue_BSTR());
        }
      }
    }
  }

  /**
   * 알려지지 않은 나머지 바이트를 처리한다.
   *
   * @param sr 스트림 리더
   */
  private static unknownRestBytes(sr: StreamReader): void {
    sr.skipToEndRecord();
  }
}
