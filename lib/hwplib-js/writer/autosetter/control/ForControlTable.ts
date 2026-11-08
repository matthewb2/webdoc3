import type { ControlTable } from "../../../object/bodytext/control/ControlTable.js";
import type { Cell } from "../../../object/bodytext/control/table/Cell.js";
import { ForParagraphList } from "../ForParagraphList.js";
import type { InstanceID } from "../InstanceID.js";
import { ForCaption } from "./gso/part/ForCaption.js";
import { ForCtrlHeaderGso } from "./gso/part/ForCtrlHeaderGso.js";

/**
 * 표 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlTable {
  /**
   * 표 컨트롤을 자동 설정한다.
   *
   * @param t   표 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(t: ControlTable, iid: InstanceID): void {
    ForCtrlHeaderGso.autoSet(t.getHeader(), t.getCaption(), iid);
    ForCaption.autoSet(t.getCaption(), iid);
    ForControlTable.table(t);
    ForControlTable.cells(t, iid);
  }

  /**
   * 표 정보 객체를 자동 설정한다.
   *
   * @param t 표 컨트롤
   */
  private static table(t: ControlTable): void {
    const tbl = t.getTable();
    tbl.setRowCount(t.getRowList().length);

    tbl.getCellCountOfRowList().length = 0;
    for (const r of t.getRowList()) {
      tbl.getCellCountOfRowList().push(r.getCellList().length);
    }
  }

  /**
   * 셀들을 자동 설정한다.
   *
   * @param t   표 컨트롤
   * @param iid 인스턴스 id
   */
  private static cells(t: ControlTable, iid: InstanceID): void {
    for (const r of t.getRowList()) {
      for (const c of r.getCellList()) {
        ForControlTable.listHeader(c);
        ForParagraphList.autoSet(c.getParagraphList(), iid);
      }
    }
  }

  /**
   * 셀의 리스트 헤더 레코드를 자동 설정한다.
   *
   * @param c 셀 객체
   */
  private static listHeader(c: Cell): void {
    c.getListHeader().setParaCount(c.getParagraphList().getParagraphCount());
  }
}
