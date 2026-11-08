import { ListHeaderForBatangPage } from "./ListHeaderForBatangPage.js";
import { ParagraphList } from "../../paragraph/ParagraphList.js";

/**
 * 바탕 페이지 정보를 나타내는 객체
 * Ported from hwplib's `object.bodytext.control.sectiondefine.BatangPageInfo`.
 *
 * @author neolord
 */
export class BatangPageInfo {
  /**
   * 문단 리스트 헤더
   */
  private listHeader: ListHeaderForBatangPage;
  /**
   * 문단 리스트
   */
  private paragraphList: ParagraphList;

  /**
   * 생성자
   */
  public constructor() {
    this.listHeader = new ListHeaderForBatangPage();
    this.paragraphList = new ParagraphList();
  }

  /**
   * 문단 리스트 헤더를 반환한다.
   *
   * @return 문단 리스트 헤더
   */
  public getListHeader(): ListHeaderForBatangPage {
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

  public clone(): BatangPageInfo {
    const cloned = new BatangPageInfo();
    cloned.listHeader.copy(this.listHeader);
    cloned.paragraphList.copy(this.paragraphList);
    return cloned;
  }
}
