import { Cell } from "./Cell.js";

/**
 * 표의 행을 나타내는 객체
 *
 * @author neolord
 */
export class Row {
  /**
   * 셀 리스트
   */
  private cellList: Cell[];

  /**
   * 생성자
   */
  public constructor() {
    this.cellList = [];
  }

  /**
   * 새로운 셀 객체를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 셀 객체
   */
  public addNewCell(): Cell {
    const c = new Cell();
    this.cellList.push(c);
    return c;
  }

  /**
   * 셀 리스트를 반환한다.
   *
   * @return 셀 리스트
   */
  public getCellList(): Cell[] {
    return this.cellList;
  }

  public clone(): Row {
    const cloned = new Row();
    for (const cell of this.cellList) {
      cloned.cellList.push(cell.clone());
    }
    return cloned;
  }
}
