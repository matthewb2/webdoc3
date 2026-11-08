import { ListHeaderForCell } from "./ListHeaderForCell.js";
import { ParagraphList } from "../../paragraph/ParagraphList.js";

/**
 * 표의 셀을 나타내는 객체
 *
 * @author neolord
 */
export class Cell {
  /**
   * 문단 리스트 헤더
   */
  private listHeader: ListHeaderForCell;
  /**
   * 문단 리스트
   */
  private paragraphList: ParagraphList;

  /**
   * 생성자
   */
  public constructor() {
    this.listHeader = new ListHeaderForCell();
    this.paragraphList = new ParagraphList();
  }

  /**
   * 문단 리스트 헤더를 반환한다.
   *
   * @return 문단 리스트 헤더
   */
  public getListHeader(): ListHeaderForCell {
    return this.listHeader;
  }

  /**
   * 문단 리스트를 반환한다.
   *
   * @return 문단 리스트
   */
  public getParagraphList(): ParagraphList {
    return this.paragraphList;
  }

  public clone(): Cell {
    const cloned = new Cell();
    cloned.listHeader.copy(this.listHeader);
    cloned.paragraphList.copy(this.paragraphList);
    return cloned;
  }
}
