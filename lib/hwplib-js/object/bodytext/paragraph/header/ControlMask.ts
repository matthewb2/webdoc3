import { BitFlag } from "../../../../util/binary/BitFlag.js";

/**
 * 문단에 포함된 컨트롤의 종류를 나타내는 객체
 *
 * @author neolord
 */
export class ControlMask {
  /**
   * 파일에 저장되는 값 (unsigned 4 byte)
   */
  private value = 0;

  /**
   * 생성자
   */
  constructor() {}

  /**
   * 파일에 저장되는 값을 반환한다.
   *
   * @return 파일에 저장되는 값
   */
  getValue(): number {
    return this.value;
  }

  /**
   * 파일에 저장되는 값을 설정한다.
   *
   * @param value 파일에 저장되는 값
   */
  setValue(value: number): void {
    this.value = value;
  }

  /**
   * 문단이 구역/단 정의 컨트롤을 가졌는지 여부를 반환한다. (2 bit)
   *
   * @return 문단이 구역/단 정의 컨트롤을 가졌는지 여부
   */
  hasSectColDef(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 문단이 구역/단 정의 컨트롤을 가졌는지 여부를 설정한다. (2 bit)
   *
   * @param hasSectColDef 문단이 구역/단 정의 컨트롤을 가졌는지 여부
   */
  setHasSectColDef(hasSectColDef: boolean): void {
    this.value = BitFlag.set(this.value, 2, hasSectColDef);
  }

  /**
   * 필드 시작 컨트롤을 가졌는지 여부를 반환한다. (3 bit)
   *
   * @return 필드 시작 컨트롤을 가졌는지 여부
   */
  hasFieldStart(): boolean {
    return BitFlag.get(this.value, 3);
  }

  /**
   * 필드 시작 컨트롤을 가졌는지 여부를 설정한다. (3 bit)
   *
   * @param hasFieldStart 필드 시작 컨트롤을 가졌는지 여부
   */
  setHasFieldStart(hasFieldStart: boolean): void {
    this.value = BitFlag.set(this.value, 3, hasFieldStart);
  }

  /**
   * 필드 끝 컨트롤을 가졌는지 여부를 반환한다. (4 bit)
   *
   * @return 필드 끝 컨트롤을 가졌는지 여부
   */
  hasFieldEnd(): boolean {
    return BitFlag.get(this.value, 4);
  }

  /**
   * 필드 끝 컨트롤을 가졌는지 여부를 설정한다. (4 bit)
   *
   * @param hasFieldEnd 필드 끝 컨트롤을 가졌는지 여부
   */
  setHasFieldEnd(hasFieldEnd: boolean): void {
    this.value = BitFlag.set(this.value, 4, hasFieldEnd);
  }

  /**
   * Title Mark를 가졌는지 여부를 반환한다.
   *
   * @return Title Mark를 가졌는지 여부
   */
  hasTitleMark(): boolean {
    return BitFlag.get(this.value, 8);
  }

  /**
   * Title Mark를 가졌는지 여부를 설정한다.
   *
   * @param hasTitleMark Title Mark를 가졌는지 여부
   */
  setHasTitleMark(hasTitleMark: boolean): void {
    this.value = BitFlag.set(this.value, 8, hasTitleMark);
  }

  /**
   * 탭을 가졌는지 여부를 반환한다. (9 bit)
   *
   * @return 탭을 가졌는지 여부
   */
  hasTab(): boolean {
    return BitFlag.get(this.value, 9);
  }

  /**
   * 탭을 가졌는지 여부를 설정한다. (9 bit)
   *
   * @param hasTab 탭을 가졌는지 여부
   */
  setHasTab(hasTab: boolean): void {
    this.value = BitFlag.set(this.value, 9, hasTab);
  }

  /**
   * 강제 줄 나눔을 가졌는지 여부를 반환한다. (10 bit)
   *
   * @return 강제 줄 나눔을 가졌는지 여부
   */
  hasLineBreak(): boolean {
    return BitFlag.get(this.value, 10);
  }

  /**
   * 강제 줄 나눔을 가졌는지 여부를 설정한다. (10 bit)
   *
   * @param hasLineBreak 강제 줄 나눔을 가졌는지 여부
   */
  setHasLineBreak(hasLineBreak: boolean): void {
    this.value = BitFlag.set(this.value, 10, hasLineBreak);
  }

  /**
   * 그리기 객체 또는 표 객체를 가졌는지 여부를 반환한다. (11 bit)
   *
   * @return 그리기 객체 또는 표 객체를 가졌는지 여부
   */
  hasGsoTable(): boolean {
    return BitFlag.get(this.value, 11);
  }

  /**
   * 그리기 객체 또는 표 객체를 가졌는지 여부를 설정한다. (11 bit)
   *
   * @param hasObjectTable 그리기 객체 또는 표 객체를 가졌는지 여부
   */
  setHasGsoTable(hasObjectTable: boolean): void {
    this.value = BitFlag.set(this.value, 11, hasObjectTable);
  }

  /**
   * 그림 객체를 가졌는지 여부를 반환한다. (12 bit)
   *
   * @return 그림 객체를 가졌는지 여부
   */
  hasPicture(): boolean {
    return BitFlag.get(this.value, 12);
  }

  /**
   * 그림 객체를 가졌는지 여부를 설정한다. (12 bit)
   *
   * @param hasPicture 그림 객체를 가졌는지 여부
   */
  setHasPicture(hasPicture: boolean): void {
    this.value = BitFlag.set(this.value, 12, hasPicture);
  }

  /**
   * 문단 나누기를 가졌는지 여부를 반환한다. (13 bit)
   *
   * @return 문단 나누기를 가졌는지 여부
   */
  hasParaBreak(): boolean {
    return BitFlag.get(this.value, 13);
  }

  /**
   * 문단 나누기를 가졌는지 여부를 설정한다. (13 bit)
   *
   * @param hasParaBreak 문단 나누기를 가졌는지 여부
   */
  setHasParaBreak(hasParaBreak: boolean): void {
    this.value = BitFlag.set(this.value, 13, hasParaBreak);
  }

  /**
   * 숨은 설명을 가졌는지 여부를 반환한다. (15 bit)
   *
   * @return 숨은 설명을 가졌는지 여부
   */
  hasHiddenComment(): boolean {
    return BitFlag.get(this.value, 15);
  }

  /**
   * 숨은 설명을 가졌는지 여부를 설정한다. (15 bit)
   *
   * @param hasHiddenComment 숨은 설명을 가졌는지 여부
   */
  setHasHiddenComment(hasHiddenComment: boolean): void {
    this.value = BitFlag.set(this.value, 15, hasHiddenComment);
  }

  /**
   * 머리말 또는 꼬리말을 가졌는지 여부를 반환한다. (16 bit)
   *
   * @return 머리말 또는 꼬리말을 가졌는지 여부
   */
  hasHeaderFooter(): boolean {
    return BitFlag.get(this.value, 16);
  }

  /**
   * 머리말 또는 꼬리말을 가졌는지 여부를 설정한다. (16 bit)
   *
   * @param hasHeaderFooter 머리말 또는 꼬리말을 가졌는지 여부
   */
  setHasHeaderFooter(hasHeaderFooter: boolean): void {
    this.value = BitFlag.set(this.value, 16, hasHeaderFooter);
  }

  /**
   * 각주 또는 미주를 가졌는지 여부를 반환한다. (17 bit)
   *
   * @return 각주 또는 미주를 가졌는지 여부
   */
  hasFootnoteEndnote(): boolean {
    return BitFlag.get(this.value, 17);
  }

  /**
   * 각주 또는 미주를 가졌는지 여부를 설정한다. (17 bit)
   *
   * @param hasFootnoteEndnote 각주 또는 미주를 가졌는지 여부
   */
  setHasFootnoteEndnote(hasFootnoteEndnote: boolean): void {
    this.value = BitFlag.set(this.value, 17, hasFootnoteEndnote);
  }

  /**
   * 자동 번호를 가져쓴지 여부를 반환한다. (18 bit)
   *
   * @return 자동 번호를 가져쓴지 여부
   */
  hasAutoNumber(): boolean {
    return BitFlag.get(this.value, 18);
  }

  /**
   * 자동 번호를 가져쓴지 여부를 설정한다. (18 bit)
   *
   * @param hasAutoNumber 자동 번호를 가져쓴지 여부
   */
  setHasAutoNumber(hasAutoNumber: boolean): void {
    this.value = BitFlag.set(this.value, 18, hasAutoNumber);
  }

  /**
   * 페이지 컨트롤(감추기, 새 번호로 시작 등)을 가졌는지 여부를 반환한다. (21 bit)
   *
   * @return 페이지 컨트롤(감추기, 새 번호로 시작 등)을 가졌는지 여부
   */
  hasPageControl(): boolean {
    return BitFlag.get(this.value, 21);
  }

  /**
   * 페이지 컨트롤(감추기, 새 번호로 시작 등)을 가졌는지 여부를 설정한다. (21 bit)
   *
   * @param hasPageControl 페이지 컨트롤(감추기, 새 번호로 시작 등)을 가졌는지 여부
   */
  setHasPageControl(hasPageControl: boolean): void {
    this.value = BitFlag.set(this.value, 21, hasPageControl);
  }

  /**
   * 책갈피/찾이보기 표시를 가졌는지 여부를 반환한다. (22 bit)
   *
   * @return 책갈피/찾이보기 표시를 가졌는지 여부
   */
  hasBookmark(): boolean {
    return BitFlag.get(this.value, 22);
  }

  /**
   * 책갈피/찾이보기 표시를 가졌는지 여부를 설정한다. (22 bit)
   *
   * @param hasBookmark 책갈피/찾이보기 표시를 가졌는지 여부
   */
  setHasBookmark(hasBookmark: boolean): void {
    this.value = BitFlag.set(this.value, 22, hasBookmark);
  }

  /**
   * 덧말/글자 겹침을 가졌는지 여부를 반환한다. (23 bit)
   *
   * @return 덧말/글자 겹침를 가졌는지 여부
   */
  hasAdditionalTextOverlappingLetter(): boolean {
    return BitFlag.get(this.value, 23);
  }

  /**
   * 덧말/글자 겹침을 가졌는지 여부를 설정한다. (23 bit)
   *
   * @param hasAdditionalTextOverlappingLetter 덧말/글자 겹침를 가졌는지 여부
   */
  setHasAdditionalTextOverlappingLetter(hasAdditionalTextOverlappingLetter: boolean): void {
    this.value = BitFlag.set(this.value, 23, hasAdditionalTextOverlappingLetter);
  }

  /**
   * 하이픈을 가졌는지 여부를 반환한다. (24 bit)
   *
   * @return 하이픈을 가졌는지 여부
   */
  hasHyphen(): boolean {
    return BitFlag.get(this.value, 24);
  }

  /**
   * 하이픈을 가졌는지 여부를 설정한다. (24 bit)
   *
   * @param hasHyphen 하이픈을 가졌는지 여부
   */
  setHasHyphen(hasHyphen: boolean): void {
    this.value = BitFlag.set(this.value, 24, hasHyphen);
  }

  /**
   * 묶음 빈칸을 가졌는지 여부를 반환한다. (30 bit)
   *
   * @return 묶음 빈칸을 가졌는지 여부
   */
  hasBundleBlank(): boolean {
    return BitFlag.get(this.value, 30);
  }

  /**
   * 묶음 빈칸을 가졌는지 여부를 설정한다. (30 bit)
   *
   * @param hasBundleBlank 묶음 빈칸을 가졌는지 여부
   */
  setHasBundleBlank(hasBundleBlank: boolean): void {
    this.value = BitFlag.set(this.value, 30, hasBundleBlank);
  }

  /**
   * 고정 폭 빈칸을 가졌는지 여부를 반환한다. (31 bit)
   *
   * @return 고정 폭 빈칸을 가졌는지 여부
   */
  hasFixWidthBlank(): boolean {
    return BitFlag.get(this.value, 31);
  }

  /**
   * 고정 폭 빈칸을 가졌는지 여부를 설정한다. (31 bit)
   *
   * @param hasFixWidthBlank 고정 폭 빈칸을 가졌는지 여부
   */
  setHasFixWidthBlank(hasFixWidthBlank: boolean): void {
    this.value = BitFlag.set(this.value, 31, hasFixWidthBlank);
  }

  copy(from: ControlMask): void {
    this.value = from.value;
  }
}
