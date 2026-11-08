import { BitFlag } from "../../../util/binary/BitFlag.js";
import { Alignment } from "./Alignment.js";
import { LineDivideForEnglish } from "./LineDivideForEnglish.js";
import { LineDivideForHangul } from "./LineDivideForHangul.js";
import { LineSpaceSort } from "./LineSpaceSort.js";
import { ParaHeadShape } from "./ParaHeadShape.js";
import { VerticalAlignment } from "./VerticalAlignment.js";

/**
 * 문단 모양의 속성1 객체
 *
 * @author neolord
 */
export class ParaShapeProperty1 {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value: number = 0;

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
   * 줄 간격의 종류를 반환한다. (0~1 bit, 한글 2007 이하 버전에서 사용.)
   *
   * @return 줄 간격의 종류
   */
  public getLineSpaceSort(): LineSpaceSort {
    return LineSpaceSort.valueOf(BitFlag.getRange(this.value, 0, 1));
  }

  /**
   * 줄 간격의 종류를 설정한다. (0~1 bit, 한글 2007 이하 버전에서 사용.)
   *
   * @param lineSpaceSort 줄 간격의 종류
   */
  public setLineSpaceSort(lineSpaceSort: LineSpaceSort): void {
    this.value = BitFlag.setRange(this.value, 0, 1, lineSpaceSort);
  }

  /**
   * 정렬 방식을 반환한다. (2~4 bit)
   *
   * @return 정렬 방식
   */
  public getAlignment(): Alignment {
    return Alignment.valueOf(BitFlag.getRange(this.value, 2, 4));
  }

  /**
   * 정렬 방식을 설정한다. (2~4 bit)
   *
   * @param alignment 정렬 방식
   */
  public setAlignment(alignment: Alignment): void {
    this.value = BitFlag.setRange(this.value, 2, 4, alignment);
  }

  /**
   * 줄 나눔 기준 영어 단위를 반환한다. (5~6 bit)
   *
   * @return 줄 나눔 기준 영어 단위
   */
  public getLineDivideForEnglish(): LineDivideForEnglish {
    return LineDivideForEnglish.valueOf(BitFlag.getRange(this.value, 5, 6));
  }

  /**
   * 줄 나눔 기준 영어 단위를 설정한다. (5~6 bit)
   *
   * @param lineDivideForEnglish 줄 나눔 기준 영어 단위
   */
  public setLineDivideForEnglish(lineDivideForEnglish: LineDivideForEnglish): void {
    this.value = BitFlag.setRange(this.value, 5, 6, lineDivideForEnglish);
  }

  /**
   * 줄 나눔 기준 한글 단위를 반환한다. (7 bit)
   *
   * @return 줄 나눔 기준 한글 단위
   */
  public getLineDivideForHangul(): LineDivideForHangul {
    if (BitFlag.get(this.value, 7) === true) {
      return LineDivideForHangul.ByLetter;
    } else {
      return LineDivideForHangul.ByWord;
    }
  }

  /**
   * 줄 나눔 기준 한글 단위를 설정한다. (7 bit)
   *
   * @param lineDivideForHangul 줄 나눔 기준 한글 단위
   */
  public setLineDivideForHangul(lineDivideForHangul: LineDivideForHangul): void {
    if (lineDivideForHangul === LineDivideForHangul.ByLetter) {
      this.value = BitFlag.set(this.value, 7, true);
    } else {
      this.value = BitFlag.set(this.value, 7, false);
    }
  }

  /**
   * 편집 용지의 줄 격자 사용 여부를 반환한다. (8 bit)
   *
   * @return 편집 용지의 줄 격자 사용 여부
   */
  public isUseGrid(): boolean {
    return BitFlag.get(this.value, 8);
  }

  /**
   * 편집 용지의 줄 격자 사용 여부를 설정한다. (8 bit)
   *
   * @param useGrid 편집 용지의 줄 격자 사용 여부
   */
  public setUseGrid(useGrid: boolean): void {
    this.value = BitFlag.set(this.value, 8, useGrid);
  }

  /**
   * 공백 최소값 (0%～75%)을 반환한다. (9~15 bit)
   *
   * @return 공백 최소값 (0%～75%)
   */
  public getMinimumSpace(): number {
    return BitFlag.getRange(this.value, 9, 15);
  }

  /**
   * 공백 최소값 (0%～75%)을 설정한다. (9~15 bit)
   *
   * @param minimumSpace 공백 최소값 (0%～75%)
   */
  public setMinimumSpace(minimumSpace: number): void {
    this.value = BitFlag.setRange(this.value, 9, 15, minimumSpace);
  }

  /**
   * 외톨이줄 보호 여부를 반환한다. (16 bit)
   *
   * @return 외톨이줄 보호 여부
   */
  public isProtectLoner(): boolean {
    return BitFlag.get(this.value, 16);
  }

  /**
   * 외톨이줄 보호 여부를 설정한다. (16 bit)
   *
   * @param protectLoner 외톨이줄 보호 여부
   */
  public setProtectLoner(protectLoner: boolean): void {
    this.value = BitFlag.set(this.value, 16, protectLoner);
  }

  /**
   * 다음 문단과 함께 여부를 반환한다. (17 bit)
   *
   * @return 다음 문단과 함께 여부
   */
  public isTogetherNextPara(): boolean {
    return BitFlag.get(this.value, 17);
  }

  /**
   * 다음 문단과 함께 여부를 설정한다. (17 bit)
   *
   * @param togetherNextPara 다음 문단과 함께 여부
   */
  public setTogetherNextPara(togetherNextPara: boolean): void {
    this.value = BitFlag.set(this.value, 17, togetherNextPara);
  }

  /**
   * 문단 보호 여부를 반환한다. (18 bit)
   *
   * @return 문단 보호 여부
   */
  public isProtectPara(): boolean {
    return BitFlag.get(this.value, 18);
  }

  /**
   * 문단 보호 여부를  설정한다. (18 bit)
   *
   * @param protectPara 문단 보호 여부
   */
  public setProtectPara(protectPara: boolean): void {
    this.value = BitFlag.set(this.value, 18, protectPara);
  }

  /**
   * 문단 앞에서 항상 쪽 나눔 여부를 반환한다. (19 bit)
   *
   * @return 문단 앞에서 항상 쪽 나눔 여부
   */
  public isSplitPageBeforePara(): boolean {
    return BitFlag.get(this.value, 19);
  }

  /**
   * 문단 앞에서 항상 쪽 나눔 여부를 설정한다. (19 bit)
   *
   * @param splitPageBeforePara 문단 앞에서 항상 쪽 나눔 여부
   */
  public setSplitPageBeforePara(splitPageBeforePara: boolean): void {
    this.value = BitFlag.set(this.value, 19, splitPageBeforePara);
  }

  /**
   * 세로 정렬을 반환한다. (20~21 bit)
   *
   * @return 세로 정렬
   */
  public getVerticalAlignment(): VerticalAlignment {
    return VerticalAlignment.valueOf(BitFlag.getRange(this.value, 20, 21));
  }

  /**
   * 세로 정렬을 설정한다. (20~21 bit)
   *
   * @param verticalAlignment 세로 정렬
   */
  public setVerticalAlignment(verticalAlignment: VerticalAlignment): void {
    this.value = BitFlag.setRange(this.value, 20, 21, verticalAlignment);
  }

  /**
   * 글꼴에 어울리는 줄 높이 여부를 반환한다. (22 bit)
   *
   * @return 글꼴에 어울리는 줄 높이 여부
   */
  public isLineHeightForFont(): boolean {
    return BitFlag.get(this.value, 22);
  }

  /**
   * 글꼴에 어울리는 줄 높이 여부를 설정한다. (22 bit)
   *
   * @param lineHeightForFont 글꼴에 어울리는 줄 높이 여부
   */
  public setLineHeightForFont(lineHeightForFont: boolean): void {
    this.value = BitFlag.set(this.value, 22, lineHeightForFont);
  }

  /**
   * 문단 머리의 모양을 반환한다. (23~24 bit)
   *
   * @return 문단 머리의 모양
   */
  public getParaHeadShape(): ParaHeadShape {
    return ParaHeadShape.valueOf(BitFlag.getRange(this.value, 23, 24));
  }

  /**
   * 문단 머리의 모양을 설정한다. (23~24 bit)
   *
   * @param paraHeadShape 문단 머리의 모양
   */
  public setParaHeadShape(paraHeadShape: ParaHeadShape): void {
    this.value = BitFlag.setRange(this.value, 23, 24, paraHeadShape);
  }

  /**
   * 문단 수준(1수준～7수준)을 반화한다. (25~27 bit)
   *
   * @return 문단 수준
   */
  public getParaLevel(): number {
    return BitFlag.getRange(this.value, 25, 27);
  }

  /**
   * 문단 수준을 설정한다. (25~27 bit)
   *
   * @param paraLevel 문단 수준
   */
  public setParaLevel(paraLevel: number): void {
    this.value = BitFlag.setRange(this.value, 25, 27, paraLevel);
  }

  /**
   * 문단 테두리 연결 여부를 반환한다. (28 bit)
   *
   * @return 문단 테두리 연결 여부
   */
  public isLinkBorder(): boolean {
    return BitFlag.get(this.value, 28);
  }

  /**
   * 문단 테두리 연결 여부를 설정한다. (28 bit)
   *
   * @param linkBorder 문단 테두리 연결 여부
   */
  public setLinkBorder(linkBorder: boolean): void {
    this.value = BitFlag.set(this.value, 28, linkBorder);
  }

  /**
   * 문단 여백 무시 여부를 반환한다. (29 bit)
   *
   * @return 문단 여백 무시 여부
   */
  public isIgnoreParaMargin(): boolean {
    return BitFlag.get(this.value, 29);
  }

  /**
   * 문단 여백 무시 여부를 설정한다. (29 bit)
   *
   * @param ignoreParaMargin 문단 여백 무시 여부
   */
  public setIgnoreParaMargin(ignoreParaMargin: boolean): void {
    this.value = BitFlag.set(this.value, 29, ignoreParaMargin);
  }

  /**
   * 문단 꼬리 모양(??)을 반환한다. (30 bit)
   *
   * @return 문단 꼬리 모양(??)
   */
  public isParaTailShape(): boolean {
    return BitFlag.get(this.value, 30);
  }

  /**
   * 문단 꼬리 모양(??)을 설정한다. (30 bit)
   *
   * @param paraTailShape 문단 꼬리 모양(??)
   */
  public setParaTailShape(paraTailShape: boolean): void {
    this.value = BitFlag.set(this.value, 30, paraTailShape);
  }

  public copy(from: ParaShapeProperty1): void {
    this.value = from.value;
  }
}
