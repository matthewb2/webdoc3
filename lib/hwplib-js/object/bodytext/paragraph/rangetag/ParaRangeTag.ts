import { RangeTagItem } from "./RangeTagItem.js";

/**
 * 문단의 영역 태그에 대한 레코드
 *
 * @author neolord
 */
export class ParaRangeTag {
  /**
   * 영역 태그 정보에 대한 객체의 리스트
   */
  private rangeTagItemList: RangeTagItem[];

  /**
   * 생성자
   */
  constructor() {
    this.rangeTagItemList = [];
  }

  /**
   * 새로운 영역 태그 정보의 객체를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 영역 태그 정보에 대한 객체
   */
  addNewRangeTagItem(): RangeTagItem {
    const rt = new RangeTagItem();
    this.rangeTagItemList.push(rt);
    return rt;
  }

  /**
   * 영역 태그 정보에 대한 객체의 리스트를 반환한다.
   *
   * @return 영역 태그 정보에 대한 객체의 리스트
   */
  getRangeTagItemList(): RangeTagItem[] {
    return this.rangeTagItemList;
  }

  clone(): ParaRangeTag {
    const cloned = new ParaRangeTag();

    for (const rangeTagItem of this.rangeTagItemList) {
      cloned.rangeTagItemList.push(rangeTagItem.clone());
    }

    return cloned;
  }
}
