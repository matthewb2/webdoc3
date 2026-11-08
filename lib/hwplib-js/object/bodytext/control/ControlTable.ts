import type { CtrlHeader } from "./ctrlheader/CtrlHeader.js";
import { CtrlHeaderGso } from "./ctrlheader/CtrlHeaderGso.js";
import { Caption } from "./gso/caption/Caption.js";
import { Row } from "./table/Row.js";
import { Table } from "./table/Table.js";
import { Control } from "./Control.js";
import { ControlType } from "./ControlType.js";

/**
 * Table (표) control, ported from hwplib's `object.bodytext.control.ControlTable`.
 */
export class ControlTable extends Control {
  /**
   * Caption.
   */
  private caption: Caption | null = null;
  /**
   * Table information.
   */
  private table: Table;
  /**
   * Row list.
   */
  private rowList: Row[];

  /**
   * @param header control header
   */
  constructor(header: CtrlHeader = new CtrlHeaderGso(ControlType.Table)) {
    super(header);

    this.caption = null;
    this.table = new Table();
    this.rowList = [];
  }

  /**
   * Returns the control header for the drawing object.
   *
   * @return control header for the drawing object
   */
  getHeader(): CtrlHeaderGso {
    return this.header as CtrlHeaderGso;
  }

  /**
   * Creates the caption object.
   */
  createCaption(): void {
    this.caption = new Caption();
  }

  /**
   * Deletes the caption object.
   */
  deleteCaption(): void {
    this.caption = null;
  }

  /**
   * Returns the caption object.
   *
   * @return caption object
   */
  getCaption(): Caption | null {
    return this.caption;
  }

  /**
   * Returns the table information object.
   *
   * @return table information object
   */
  getTable(): Table {
    return this.table;
  }

  /**
   * Creates a new row object and adds it to the list.
   *
   * @return the newly created row object
   */
  addNewRow(): Row {
    const r = new Row();
    this.rowList.push(r);
    return r;
  }

  /**
   * Returns the row list.
   *
   * @return row list
   */
  getRowList(): Row[] {
    return this.rowList;
  }

  override clone(): Control {
    const cloned = new ControlTable();
    cloned.copyControlPart(this);

    if (this.caption !== null) {
      cloned.createCaption();
      cloned.caption!.copy(this.caption);
    } else {
      cloned.caption = null;
    }

    cloned.table.copy(this.table);

    for (const row of this.rowList) {
      cloned.rowList.push(row.clone());
    }

    return cloned;
  }
}
