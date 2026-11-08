import type { ControlTable } from "../../../../object/bodytext/control/ControlTable.js";
import type { Cell } from "../../../../object/bodytext/control/table/Cell.js";
import type { Row } from "../../../../object/bodytext/control/table/Row.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "./bookmark/ForCtrlData.js";
import { ForCaption } from "./gso/part/ForCaption.js";
import { ForCtrlHeaderGso } from "./gso/part/ForCtrlHeaderGso.js";
import { ForCell } from "./tbl/ForCell.js";
import { ForTable } from "./tbl/ForTable.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 표 컨트롤을 읽기 위한 객체
 *
 * @author 박성균
 */
export class ForControlTable {
  /**
   * 표 컨트롤
   */
  private table!: ControlTable;
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 표 컨트롤을 읽는다.
   *
   * @param table 표 컨트롤 객체
   * @param sr    스트림 리더
   */
  public read(table: ControlTable, sr: StreamReader): void {
    this.table = table;
    this.sr = sr;

    this.ctrlHeader();
    this.ctrlData();
    this.caption();
    this.tableRecord();
    this.rows();
  }

  /**
   * 표 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   */
  private ctrlHeader(): void {
    ForCtrlHeaderGso.read(this.table.getHeader(), this.sr);
  }

  /**
   * 컨트롤 데이터를 읽는다.
   */
  private ctrlData(): void {
    this.sr.readRecordHeader();
    if (this.sr.getCurrentRecordHeader().getTagID() === HWPTag.CTRL_DATA) {
      this.table.createCtrlData();
      ForCtrlData.read(this.table.getCtrlData()!, this.sr);
    }
  }

  /**
   * 캡션 정보를 읽는다.
   */
  private caption(): void {
    if (this.sr.isImmediatelyAfterReadingHeader() === false) {
      this.sr.readRecordHeader();
    }
    if (this.sr.getCurrentRecordHeader().getTagID() === HWPTag.LIST_HEADER) {
      this.table.createCaption();
      ForCaption.read(this.table.getCaption()!, this.sr);
    }
  }

  /**
   * 표 정보 레코드를 읽는다.
   */
  private tableRecord(): void {
    if (this.sr.isImmediatelyAfterReadingHeader() === false) {
      this.sr.readRecordHeader();
    }
    if (this.sr.getCurrentRecordHeader().getTagID() === HWPTag.TABLE) {
      ForTable.read(this.table.getTable(), this.sr);
    }
  }

  /**
   * 행들을 읽는다.
   */
  private rows(): void {
    const rowCount = this.table.getTable().getRowCount();
    const cellCountOfRow = this.table.getTable().getCellCountOfRowList();
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const r = this.table.addNewRow();
      this.row(r, cellCountOfRow[rowIndex]!);
    }
  }

  /**
   * 하나의 행 안에 셀들을 읽는다.
   *
   * @param r         행
   * @param cellCount 행에 포함된 셀 개수
   */
  private row(r: Row, cellCount: number): void {
    for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
      const c: Cell = r.addNewCell();
      ForCell.read(c, this.sr);
    }
  }
}
