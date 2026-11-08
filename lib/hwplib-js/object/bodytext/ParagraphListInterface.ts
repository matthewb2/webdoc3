import type { Paragraph } from "./paragraph/Paragraph.js";

/**
 * 문단 리스트 인터페이스
 *
 * Java `Iterable<Paragraph>`를 TypeScript `Iterable<Paragraph>`로 매핑한다.
 *
 * @author neolord
 */
export interface ParagraphListInterface extends Iterable<Paragraph> {
  /**
   * 새로운 문단를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 문단
   */
  addNewParagraph(): Paragraph;

  /**
   * 문단 개수를 반환한다.
   *
   * @return 문단 개수
   */
  getParagraphCount(): number;

  /**
   * index 번째의 문단을 반환한다.
   *
   * @param index 찾고자 하는 문단의 순번
   * @return index 번째의 문단
   */
  getParagraph(index: number): Paragraph;

  /**
   * 문단 배열을 리턴한다.
   *
   * @return 문단 배열
   */
  getParagraphs(): Paragraph[];

  /**
   * index 번째의 문단을 삭제한다.
   *
   * @param index 삭제할 문단의 순번
   */
  deleteParagraph(index: number): void;

  /**
   * 모든 문단을 삭제한다.
   */
  deleteAllParagraphs(): void;

  /**
   * 문단을 삽입한다.
   *
   * @param index 삽입할 위치
   * @param para  문단
   */
  insertParagraph(index: number, para: Paragraph): void;

  /**
   * index 번째의 문단을 새로 생성하여 삽입한다.
   *
   * @param index 상입하고자 하는 문단의 순번
   * @return 새로 삽입된 문단
   */
  insertNewParagraph(index: number): Paragraph;
}
