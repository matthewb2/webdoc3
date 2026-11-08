import { Memo } from "./paragraph/memo/Memo.js";
import { Section } from "./Section.js";

/**
 * 본문를 나타나는 객체. HWP파일 내에 "BodyText" storage에 저장된다.
 *
 * @author neolord
 */
export class BodyText {
  /**
   * 문서 영역(섹션) 리스트
   */
  private sectionList: Section[];

  /**
   * 메모 리스트
   */
  private memoList: Memo[] | null = null;

  /**
   * 생성자
   */
  constructor() {
    this.sectionList = [];
  }

  /**
   * 새로운 문서 영역(섹션)을 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 문서 영역(섹션)
   */
  addNewSection(): Section {
    const s = new Section();
    this.sectionList.push(s);
    return s;
  }

  /**
   * 문서 영역(섹션) 리스트를 반환한다.
   *
   * @return 문서 영역(섹션) 리스트
   */
  getSectionList(): Section[] {
    return this.sectionList;
  }

  getLastSection(): Section | null {
    if (this.sectionList.length === 0) {
      return null;
    }
    return this.sectionList[this.sectionList.length - 1]!;
  }

  /**
   * 새로운 메모을 생성하여 반환한다.
   *
   * @return 새로 생성된 메모
   */
  addNewMemo(): Memo {
    if (this.memoList === null) {
      this.memoList = [];
    }

    const m = new Memo();
    this.memoList.push(m);
    return m;
  }

  /**
   * 메모 리스트를 반환한다.
   *
   * @return 메모 리스트
   */
  getMemoList(): Memo[] | null {
    return this.memoList;
  }

  copy(from: BodyText): void {
    this.sectionList.length = 0;
    for (const section of from.sectionList) {
      this.sectionList.push(section.clone());
    }

    if (from.memoList !== null) {
      this.memoList = [];
      for (const memo of from.memoList) {
        this.memoList.push(memo.clone());
      }
    } else {
      this.memoList = null;
    }
  }
}
