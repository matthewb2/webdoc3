import { ParagraphList } from "../../../paragraph/ParagraphList.js";
import { ListHeaderForTextBox } from "./ListHeaderForTextBox.js";

/**
 * 글상자을 나타내는 객체
 *
 * @author neolord
 */
export class TextBox {
  /**
   * 문단 리스트 헤더
   */
  private listHeader: ListHeaderForTextBox;
  /**
   * 문단 리스트
   */
  private paragraphList: ParagraphList;

  /**
   * 생성자
   */
  constructor() {
    this.listHeader = new ListHeaderForTextBox();
    this.paragraphList = new ParagraphList();
  }

  /**
   * 문단 리스트 헤더 객체를 반환한다.
   *
   * @return 문단 리스트 헤더 객체
   */
  getListHeader(): ListHeaderForTextBox {
    return this.listHeader;
  }

  /**
   * 문단 리스트 객체를 반환한다.
   *
   * @return 문단 리스트 객체
   */
  getParagraphList(): ParagraphList {
    return this.paragraphList;
  }

  copy(from: TextBox): void {
    this.listHeader.copy(from.listHeader);
    this.paragraphList.copy(from.paragraphList);
  }
}
