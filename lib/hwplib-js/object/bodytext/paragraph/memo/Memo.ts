import { ParagraphList } from "../ParagraphList.js";
import { ListHeaderForMemo } from "./ListHeaderForMemo.js";
import { MemoList } from "./MemoList.js";

export class Memo {
  /**
   * 메모 리스트 레코드
   */
  private memoList: MemoList;
  /**
   * 메모를 위한 리스트 헤더 레코드
   */
  private listHeader: ListHeaderForMemo;
  /**
   * 문단 리스트
   */
  private paragraphList: ParagraphList;

  /**
   * 생성자
   */
  constructor() {
    this.memoList = new MemoList();
    this.listHeader = new ListHeaderForMemo();
    this.paragraphList = new ParagraphList();
  }

  /**
   * 메모 리스트 레코드를 반환한다.
   *
   * @return 메모 리스트 레코드
   */
  getMemoList(): MemoList {
    return this.memoList;
  }

  /**
   * 메모를 위한 리스트 헤더 레코드를 반환한다.
   *
   * @return 메모를 위한 리스트 헤더 레코드
   */
  getListHeader(): ListHeaderForMemo {
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

  clone(): Memo {
    const cloned = new Memo();
    cloned.memoList.copy(this.memoList);
    cloned.listHeader.copy(this.listHeader);
    cloned.paragraphList.copy(this.paragraphList);
    return cloned;
  }
}
