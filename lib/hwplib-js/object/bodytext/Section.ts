import { BatangPageInfo } from "./control/sectiondefine/BatangPageInfo.js";
import { Paragraph } from "./paragraph/Paragraph.js";
import type { ParagraphListInterface } from "./ParagraphListInterface.js";

/**
 * 문단 구역(섹션)를 나타내는 객체. HWP 파일내의 "BodyText" storage 안에 "Section[번호]" stream에
 * 저장된다.
 *
 * @author neolord
 */
export class Section implements ParagraphListInterface {
  /**
   * 문단 리스트
   */
  private paragraphList: Paragraph[];
  /**
   * 마지막 바탕쪽 정보
   */
  private lastBatangPageInfo: BatangPageInfo | null;
  /**
   * 임의의 바탕쪽 정보
   */
  private anyBatangPageInfo: BatangPageInfo | null;

  /**
   * 생성자
   */
  constructor() {
    this.paragraphList = [];
    this.lastBatangPageInfo = null;
    this.anyBatangPageInfo = null;
  }

  /**
   * 새로운 문단를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 문단
   */
  addNewParagraph(): Paragraph {
    const p = new Paragraph();
    this.paragraphList.push(p);
    return p;
  }

  /**
   * 문단 개수를 반환한다.
   *
   * @return 문단 개수
   */
  getParagraphCount(): number {
    return this.paragraphList.length;
  }

  /**
   * index 번째의 문단을 반환한다.
   *
   * @param index 찾고자 하는 문단의 순번
   * @return index 번째의 문단
   */
  getParagraph(index: number): Paragraph {
    return this.paragraphList[index]!;
  }

  getParagraphs(): Paragraph[] {
    return this.paragraphList.slice();
  }

  /**
   * index 번째의 문단을 삭제한다.
   *
   * @param index 삭제할 문단의 순번
   */
  deleteParagraph(index: number): void {
    this.paragraphList.splice(index, 1);
  }

  deleteAllParagraphs(): void {
    this.paragraphList.length = 0;
  }

  insertParagraph(index: number, para: Paragraph): void {
    this.paragraphList.splice(index, 0, para);
  }

  insertNewParagraph(index: number): Paragraph {
    const p = new Paragraph();
    this.paragraphList.splice(index, 0, p);
    return p;
  }

  /**
   * Iterator<Paragraph> 객체를 반환한다.
   *
   * @return Iterator<Paragraph> 객체
   */
  iterator(): Iterator<Paragraph> {
    return this.paragraphList[Symbol.iterator]();
  }

  [Symbol.iterator](): Iterator<Paragraph> {
    return this.paragraphList[Symbol.iterator]();
  }

  getLastParagraph(): Paragraph | null {
    if (this.paragraphList.length > 0) {
      return this.paragraphList[this.paragraphList.length - 1]!;
    }
    return null;
  }

  /**
   * 마지막 바탕쪽 정보 객체를 생성한다.
   */
  createLastBatangPageInfo(): void {
    this.lastBatangPageInfo = new BatangPageInfo();
  }

  /**
   * 마지막 바탕쪽 정보를 리턴한다.
   *
   * @return 마지막 바탕쪽 정보
   */
  getLastBatangPageInfo(): BatangPageInfo | null {
    return this.lastBatangPageInfo;
  }

  /**
   * 임의의 바탕쪽 정보 객체를 생성한다.
   */
  createAnyBatangPageInfo(): void {
    this.anyBatangPageInfo = new BatangPageInfo();
  }

  /**
   * 임의의 바탕쪽 정보를 리턴한다.
   *
   * @return 마지막 바탕쪽 정보
   */
  getAnyBatangPageInfo(): BatangPageInfo | null {
    return this.anyBatangPageInfo;
  }

  clone(): Section {
    const cloned = new Section();

    cloned.paragraphList.length = 0;
    for (const paragraph of this.paragraphList) {
      cloned.paragraphList.push(paragraph.clone());
    }

    if (this.lastBatangPageInfo !== null) {
      cloned.lastBatangPageInfo = this.lastBatangPageInfo.clone();
    } else {
      cloned.lastBatangPageInfo = null;
    }

    if (this.anyBatangPageInfo !== null) {
      cloned.anyBatangPageInfo = this.anyBatangPageInfo.clone();
    } else {
      cloned.anyBatangPageInfo = null;
    }

    return cloned;
  }
}
