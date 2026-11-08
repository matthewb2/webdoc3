import { StartPageNumberType } from "./StartPageNumberType.js";
import { TextDirection } from "./TextDirection.js";
import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * 구역 정의 컨트롤의 속성 객체
 *
 * @author neoloed
 */
export class SectionDefineHeaderProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * 파일에 저장되는 정수값을 설정한다.
   *
   * @param value 파일에 저장되는 정수값
   */
  public setValue(value: number): void {
    this.value = value;
  }

  /**
   * 머리말을 감출지 여부를 반환한다. (0 bit)
   *
   * @return 머리말을 감출지 여부
   */
  public isHideHeader(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 머리말을 감출지 여부를 설정한다. (0 bit)
   *
   * @param hideHeader 머리말을 감출지 여부
   */
  public setHideHeader(hideHeader: boolean): void {
    this.value = BitFlag.set(this.value, 0, hideHeader);
  }

  /**
   * 꼬리말을 감출지 여부를 반환한다. (1 bit)
   *
   * @return 꼬리말을 감출지 여부
   */
  public isHideFooter(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 꼬리말을 감출지 여부를 반환한다. (1 bit)
   *
   * @param hideFooter 꼬리말을 감출지 여부
   */
  public setHideFooter(hideFooter: boolean): void {
    this.value = BitFlag.set(this.value, 1, hideFooter);
  }

  /**
   * 바탕쪽을 감출지 여부를 반환한다. (2 bit)
   *
   * @return 바탕쪽을 감출지 여부
   */
  public isHideBatangPage(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 바탕쪽을 감출지 여부를 설정한다. (2 bit)
   *
   * @param hideBatangPage 바탕쪽을 감출지 여부
   */
  public setHideBatangPage(hideBatangPage: boolean): void {
    this.value = BitFlag.set(this.value, 2, hideBatangPage);
  }

  /**
   * 테두리를 감출지 여부를 반환한다. (3 bit)
   *
   * @return 테두리를 감출지 여부
   */
  public isHideBorder(): boolean {
    return BitFlag.get(this.value, 3);
  }

  /**
   * 테두리를 감출지 여부를 설정한다. (3 bit)
   *
   * @param hideBorder 테두리를 감출지 여부
   */
  public setHideBorder(hideBorder: boolean): void {
    this.value = BitFlag.set(this.value, 3, hideBorder);
  }

  /**
   * 배경을 감출지 여부를 반환한다. (4 bit)
   *
   * @return 배경을 감출지 여부
   */
  public isHideBackground(): boolean {
    return BitFlag.get(this.value, 4);
  }

  /**
   * 배경을 감출지 여부를 설정한다. (4 bit)
   *
   * @param hideBackground 배경을 감출지 여부
   */
  public setHideBackground(hideBackground: boolean): void {
    this.value = BitFlag.set(this.value, 4, hideBackground);
  }

  /**
   * 쪽 번호 위치를 감출지 여부를 반환한다. (5 bit)
   *
   * @return 쪽 번호 위치를 감출지 여부
   */
  public isHidePageNumberPosition(): boolean {
    return BitFlag.get(this.value, 5);
  }

  /**
   * 쪽 번호 위치를 감출지 여부를 설정한다. (5 bit)
   *
   * @param hidePageNumberPosition 쪽 번호 위치를 감출지 여부
   */
  public setHidePageNumberPosition(hidePageNumberPosition: boolean): void {
    this.value = BitFlag.set(this.value, 5, hidePageNumberPosition);
  }

  /**
   * 구역의 첫 쪽에만 테두리 표시 여부를 반환한다. (8 bit)
   *
   * @return 구역의 첫 쪽에만 테두리 표시 여부
   */
  public isDisplayBorderAtFirstPageOfSection(): boolean {
    return BitFlag.get(this.value, 8);
  }

  /**
   * 구역의 첫 쪽에만 테두리 표시 여부를 설정한다. (8 bit)
   *
   * @param displayBorderAtFirstPageOfSection 구역의 첫 쪽에만 테두리 표시 여부
   */
  public setDisplayBorderAtFirstPageOfSection(
    displayBorderAtFirstPageOfSection: boolean,
  ): void {
    this.value = BitFlag.set(this.value, 8, displayBorderAtFirstPageOfSection);
  }

  /**
   * 구역의 첫 쪽에만 배경 표시 여부를 반환한다. (9 bit)
   *
   * @return 구역의 첫 쪽에만 배경 표시 여부
   */
  public isDisplayBackgroundAtFirstPageOfSection(): boolean {
    return BitFlag.get(this.value, 9);
  }

  /**
   * 구역의 첫 쪽에만 배경 표시 여부를 설정한다. (9 bit)
   *
   * @param displayBackgroundAtFirstPageOfSection 구역의 첫 쪽에만 배경 표시 여부
   */
  public setDisplayBackgroundAtFirstPageOfSection(
    displayBackgroundAtFirstPageOfSection: boolean,
  ): void {
    this.value = BitFlag.set(this.value, 9, displayBackgroundAtFirstPageOfSection);
  }

  /**
   * 텍스트 방향을 반환한다. (16~18 bit)
   *
   * @return 텍스트 방향
   */
  public getTextDirection(): TextDirection {
    return TextDirection.valueOf(BitFlag.getRange(this.value, 16, 18));
  }

  /**
   * 텍스트 방향을 설정한다. (16~18 bit)
   *
   * @param textDirection 텍스트 방향
   */
  public setTextDirection(textDirection: TextDirection): void {
    this.value = BitFlag.setRange(this.value, 16, 18, textDirection);
  }

  /**
   * 빈 줄 감춤 여부를 반환한다. (19 bit)
   *
   * @return 빈 줄 감춤 여부
   */
  public isHideEmptyLine(): boolean {
    return BitFlag.get(this.value, 19);
  }

  /**
   * 빈 줄 감춤 여부를 설정한다. (19 bit)
   *
   * @param hideEmptyLine 빈 줄 감춤 여부
   */
  public setHideEmptyLine(hideEmptyLine: boolean): void {
    this.value = BitFlag.set(this.value, 19, hideEmptyLine);
  }

  /**
   * 시작 쪽번호 타입을 반환한다. (20~21 bit)
   *
   * @return 시작 쪽번호 타입
   */
  public getStartPageNumberType(): StartPageNumberType {
    return StartPageNumberType.valueOf(BitFlag.getRange(this.value, 20, 21));
  }

  /**
   * 시작 쪽번호 타입을 설정한다. (20~21 bit)
   *
   * @param startPageNumberType 시작 쪽번호 타입
   */
  public setStartPageNumberType(startPageNumberType: StartPageNumberType): void {
    this.value = BitFlag.setRange(this.value, 20, 21, startPageNumberType);
  }

  /**
   * 원고지 정서법 적용 여부를 반환한다. (22 bit)
   *
   * @return 원고지 정서법 적용 여부
   */
  public isApplyWongoji(): boolean {
    return BitFlag.get(this.value, 22);
  }

  /**
   * 원고지 정서법 적용 여부를 설정한다. (22 bit)
   *
   * @param applyWongoji 원고지 정서법 적용 여부
   */
  public setApplyWongoji(applyWongoji: boolean): void {
    this.value = BitFlag.set(this.value, 22, applyWongoji);
  }

  /**
   * 양쪽 바탕쪽 적용 여부를 반환한다.(29 bit)
   *
   * @return 양쪽 바탕쪽 적용 여부
   */
  public isApplyBothBatangPage(): boolean {
    return BitFlag.get(this.value, 29);
  }

  /**
   * 양쪽 바탕쪽 적용 여부를 설정한다.(29 bit)
   *
   * @param applyBothBatangPage 양쪽 바탕쪽 적용 여부
   */
  public setApplyBothBatangPage(applyBothBatangPage: boolean): void {
    this.value = BitFlag.set(this.value, 29, applyBothBatangPage);
  }

  /**
   * 짝수쪽 바탕쪽 적용 여부를 반환한다.(30 bit)
   *
   * @return 짝수쪽 바탕쪽 적용 여부
   */
  public isApplyEvenBatangPage(): boolean {
    return BitFlag.get(this.value, 30);
  }

  /**
   * 짝수쪽 바탕쪽 적용 여부를 설정한다.(30 bit)
   *
   * @param applyEvenBatangPage 짝수쪽 바탕쪽 적용 여부
   */
  public setApplyEvenBatangPage(applyEvenBatangPage: boolean): void {
    this.value = BitFlag.set(this.value, 30, applyEvenBatangPage);
  }

  /**
   * 홀수쪽 바탕쪽 적용 여부를 반환한다.(31 bit)
   *
   * @return 홀수쪽 바탕쪽 적용 여부
   */
  public isApplyOddBatangPage(): boolean {
    return BitFlag.get(this.value, 31);
  }

  /**
   * 홀수쪽 바탕쪽 적용 여부를 설정한다.(31 bit)
   *
   * @param applyOddBatangPage 홀수쪽 바탕쪽 적용 여부
   */
  public setApplyOddBatangPage(applyOddBatangPage: boolean): void {
    this.value = BitFlag.set(this.value, 31, applyOddBatangPage);
  }

  public copy(from: SectionDefineHeaderProperty): void {
    this.value = from.value;
  }
}
