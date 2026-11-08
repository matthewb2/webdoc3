import { LineSegItem } from "./LineSegItem.js";

/**
 * 문단의 레이아웃 레코드
 *
 * @author neolord
 */
export class ParaLineSeg {
  /**
   * 각 줄의 align 정보의 리스트
   */
  private lineSegItemList: LineSegItem[];

  /**
   * 생성자
   */
  constructor() {
    this.lineSegItemList = [];
  }

  /**
   * 각 줄의 align 정보에 대한 객체를 새로 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 각 줄의 align 정보에 대한 객체
   */
  addNewLineSegItem(): LineSegItem {
    const plsi = new LineSegItem();
    this.lineSegItemList.push(plsi);
    return plsi;
  }

  /**
   * 각 줄의 align 정보의 리스트를 반환한다.
   *
   * @return 각 줄의 align 정보의 리스트
   */
  getLineSegItemList(): LineSegItem[] {
    return this.lineSegItemList;
  }

  clone(): ParaLineSeg {
    const cloned = new ParaLineSeg();

    for (const lineSegItem of this.lineSegItemList) {
      cloned.lineSegItemList.push(lineSegItem.clone());
    }

    return cloned;
  }
}
