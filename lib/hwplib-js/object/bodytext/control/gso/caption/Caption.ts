import { ParagraphList } from "../../../paragraph/ParagraphList.js";
import { ListHeaderForCaption } from "./ListHeaderForCaption.js";

/**
 * 캡션 정보을 나타내는 객체
 *
 * @author neolord
 */
export class Caption {
  /**
   * 문단 리스트 헤더
   */
  private listHeader: ListHeaderForCaption;
  /**
   * 문단 리스트
   */
  private paragraphList: ParagraphList;

  /**
   * 생성자
   */
  constructor() {
    this.listHeader = new ListHeaderForCaption();
    this.paragraphList = new ParagraphList();
  }

  /**
   * 문단 리스트 헤더를 반환한다.
   *
   * @return 문단 리스트 헤더
   */
  getListHeader(): ListHeaderForCaption {
    return this.listHeader;
  }

  /**
   * 문단 리스트를 반환한다.
   *
   * @return 문단 리스트
   */
  getParagraphList(): ParagraphList {
    return this.paragraphList;
  }

  copy(from: Caption): void {
    this.listHeader.copy(from.listHeader);
    this.paragraphList.copy(from.paragraphList);
  }
}
