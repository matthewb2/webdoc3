import { ControlType } from "../ControlType.js";
import type { HWPString } from "../../../etc/HWPString.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 글자 겸침 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderOverlappingLetter extends CtrlHeader {
  /**
   * 겹침 글자 리스트
   */
  private overlappingLetterList: HWPString[];
  /**
   * 테두리 타입
   */
  private borderType = 0;
  /**
   * 내부 글자 크기
   */
  private internalFontSize = 0;
  /**
   * 테두리 내부 글자 펼침
   */
  private expendInsideLetter = 0;
  /**
   * 테두리 내부 글자의 글자모양 id 리스트
   */
  private charShapeIdList: number[];

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.OverlappingLetter);

    this.overlappingLetterList = [];
    this.charShapeIdList = [];
  }

  /**
   * 겹쳐지는 글자를 리스트에 추가한다.
   *
   * @param overlappingLetter 겹쳐지는 글자
   */
  addOverlappingLetter(overlappingLetter: HWPString): void {
    this.overlappingLetterList.push(overlappingLetter);
  }

  /**
   * 겹침 글자 리스트를 반환한다.
   *
   * @return 겹침 글자 리스트
   */
  getOverlappingLetterList(): HWPString[] {
    return this.overlappingLetterList;
  }

  /**
   * 테두리 타입을 반환한다.
   *
   * @return 테두리 타입
   */
  getBorderType(): number {
    return this.borderType;
  }

  /**
   * 테두리 타입를 설정한다.
   *
   * @param borderType 테두리 타입
   */
  setBorderType(borderType: number): void {
    this.borderType = borderType;
  }

  /**
   * 내부 글자 크기를 반환한다.
   *
   * @return 내부 글자 크기
   */
  getInternalFontSize(): number {
    return this.internalFontSize;
  }

  /**
   * 내부 글자 크기를 설정한다.
   *
   * @param internalFontSize 내부 글자 크기
   */
  setInternalFontSize(internalFontSize: number): void {
    this.internalFontSize = internalFontSize;
  }

  /**
   * 테두리 내부 글자 펼침을 반환한다.
   *
   * @return 테두리 내부 글자 펼침
   */
  getExpendInsideLetter(): number {
    return this.expendInsideLetter;
  }

  /**
   * 테두리 내부 글자 펼침을 설정한다.
   *
   * @param expendInsideLetter 테두리 내부 글자 펼침
   */
  setExpendInsideLetter(expendInsideLetter: number): void {
    this.expendInsideLetter = expendInsideLetter;
  }

  /**
   * 테두리 내부 글자의 글자모양 id를 리스트에 추가한다.
   *
   * @param charShapeId 테두리 내부 글자의 글자모양 id
   */
  addCharShapeId(charShapeId: number): void {
    this.charShapeIdList.push(charShapeId);
  }

  /**
   * 테두리 내부 글자의 글자모양 id 리스트를 반환한다.
   *
   * @return 테두리 내부 글자의 글자모양 id 리스트
   */
  getCharShapeIdList(): number[] {
    return this.charShapeIdList;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderOverlappingLetter;
    this.overlappingLetterList.length = 0;
    for (const str of from2.overlappingLetterList) {
      this.overlappingLetterList.push(str.clone());
    }

    this.borderType = from2.borderType;
    this.internalFontSize = from2.internalFontSize;
    this.expendInsideLetter = from2.expendInsideLetter;

    this.charShapeIdList.length = 0;
    for (const lng of from2.charShapeIdList) {
      this.charShapeIdList.push(lng);
    }
  }
}
