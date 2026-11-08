import type { ControlTable } from "../../../../object/bodytext/control/ControlTable.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForCaption } from "./gso/part/ForCaption.js";
import { ForCtrlHeaderGso } from "./gso/part/ForCtrlHeaderGso.js";
import { ForCell } from "./tbl/ForCell.js";
import { ForTable } from "./tbl/ForTable.js";

/**
 * 표 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlTable {
  /**
   * 표 컨트롤을 쓴다.
   *
   * @param t  표 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(t: ControlTable, sw: StreamWriter): void {
    ForCtrlHeaderGso.write(t.getHeader(), sw);

    sw.upRecordLevel();

    ForCaption.write(t.getCaption(), sw);
    ForTable.write(t.getTable(), sw);
    ForControlTable.rows(t, sw);

    sw.downRecordLevel();
  }

  /**
   * 표 컨트롤에 포함된 셀들을 쓴다.
   *
   * @param t  표 컨트롤
   * @param sw 스트림 라이터
   */
  private static rows(t: ControlTable, sw: StreamWriter): void {
    for (const r of t.getRowList()) {
      for (const c of r.getCellList()) {
        ForCell.write(c, sw);
      }
    }
  }
}
