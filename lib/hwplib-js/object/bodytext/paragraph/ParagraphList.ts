import type { ParagraphListInterface } from "../ParagraphListInterface.js";
import { Paragraph } from "./Paragraph.js";

/**
 * 문단 리스트를 나타내는 객체
 *
 * @author neolord
 */
export class ParagraphList implements ParagraphListInterface {
  /**
   * 문단 리스트
   */
  private readonly paragraphList: Paragraph[];

  /**
   * 생성자
   */
  constructor() {
    this.paragraphList = [];
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
   * 문단를 리스트에 추가한다.
   * @param para 추가할 문단.
   */
  addParagraph(para: Paragraph): void {
    this.paragraphList.push(para);
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

  /**
   * 모든 문단을 삭제한다.
   */
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

  /**
   * 문단 리스트의 일반 문자열을 반환한다.
   *
   * @return 문단 리스트의 일반 문자열
   */
  getNormalString(): string {
    let sb = "";
    for (const p of this.paragraphList) {
      sb += String(p.getNormalString());
      sb += "\n";
    }
    return sb;
  }

  copy(from: ParagraphList): void {
    this.paragraphList.length = 0;
    for (const paragraph of from.paragraphList) {
      this.paragraphList.push(paragraph.clone());
    }
  }
}
