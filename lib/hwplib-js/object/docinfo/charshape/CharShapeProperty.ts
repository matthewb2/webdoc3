import { BitFlag } from "../../../util/binary/BitFlag.js";
import { BorderType2 } from "./BorderType2.js";
import { EmphasisSort } from "./EmphasisSort.js";
import { OutterLineSort } from "./OutterLineSort.js";
import { ShadowSort } from "./ShadowSort.js";
import { UnderLineSort } from "./UnderLineSort.js";

/**
 * 글자 모양 객체의 속성
 *
 * @author neolord
 */
export class CharShapeProperty {
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
   * 글꼴 기울임 여부를 반환한다. (0 bit)
   *
   * @return 글꼴 기울임 여부
   */
  public isItalic(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 글꼴 기울임 여부를 설정한다. (0 bit)
   *
   * @param italic 글꼴 기울임 여부
   */
  public setItalic(italic: boolean): void {
    this.value = BitFlag.set(this.value, 0, italic);
  }

  /**
   * 글꼴 진하게 여부를 반환한다. (1 bit)
   *
   * @return 글꼴 진하게 여부
   */
  public isBold(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 글꼴 진하게 여부를 설정한다. (1 bit)
   *
   * @param bold 글꼴 진하게 여부
   */
  public setBold(bold: boolean): void {
    this.value = BitFlag.set(this.value, 1, bold);
  }

  /**
   * 밑줄의 종류를 반환한다. (2~3 bit)
   *
   * @return 밑줄의 종류
   */
  public getUnderLineSort(): UnderLineSort {
    return UnderLineSort.valueOf(BitFlag.getRange(this.value, 2, 3));
  }

  /**
   * 밑줄의 종류를 설정한다. (2~3 bit)
   *
   * @param underLineSort 밑줄의 종류
   */
  public setUnderLineSort(underLineSort: UnderLineSort): void {
    this.value = BitFlag.setRange(this.value, 2, 3, underLineSort);
  }

  /**
   * 밑줄의 모양을 반환한다. (4~7 bit)
   *
   * @return 밑줄의 모양
   */
  public getUnderLineShape(): BorderType2 {
    return BorderType2.valueOf(BitFlag.getRange(this.value, 4, 7));
  }

  /**
   * 밑줄의 모양을 설정한다. (4~7 bit)
   *
   * @param underLineShape 밑줄의 모양
   */
  public setUnderLineShape(underLineShape: BorderType2): void {
    this.value = BitFlag.setRange(this.value, 4, 7, underLineShape);
  }

  /**
   * 외곽선의 종류를 반환한다. (8~10 bit)
   *
   * @return 외곽선의 종류
   */
  public getOutterLineSort(): OutterLineSort {
    return OutterLineSort.valueOf(BitFlag.getRange(this.value, 8, 10));
  }

  /**
   * 외곽선의 종류를 설정한다. (8~10 bit)
   *
   * @param outterLineSort 외곽선의 종류
   */
  public setOutterLineSort(outterLineSort: OutterLineSort): void {
    this.value = BitFlag.setRange(this.value, 8, 10, outterLineSort);
  }

  /**
   * 그림자의 종류를 반환한다. (11~12 bit)
   *
   * @return 그림자의 종류
   */
  public getShadowSort(): ShadowSort {
    return ShadowSort.valueOf(BitFlag.getRange(this.value, 11, 12));
  }

  /**
   * 그림자의 종류를 설정한다. (11~12 bit)
   *
   * @param shadowSort 그림자의 종류
   */
  public setShadowSort(shadowSort: ShadowSort): void {
    this.value = BitFlag.setRange(this.value, 11, 12, shadowSort);
  }

  /**
   * 양각 여부를 반환한다. (13 bit)
   *
   * @return 양각 여부
   */
  public isEmboss(): boolean {
    return BitFlag.get(this.value, 13);
  }

  /**
   * 양각 여부를 설정한다. (13 bit)
   *
   * @param emboss 양각 여부
   */
  public setEmboss(emboss: boolean): void {
    this.value = BitFlag.set(this.value, 13, emboss);
  }

  /**
   * 음각 여부를 반환한다. (14 bit)
   *
   * @return 음각 여부
   */
  public isEngrave(): boolean {
    return BitFlag.get(this.value, 14);
  }

  /**
   * 음각 여부를 설정한다. (14 bit)
   *
   * @param engrave 음각 여부
   */
  public setEngrave(engrave: boolean): void {
    this.value = BitFlag.set(this.value, 14, engrave);
  }

  /**
   * 위 첨자 여부를 반환한다. (15 bit)
   *
   * @return 위 첨자 여부
   */
  public isSuperScript(): boolean {
    return BitFlag.get(this.value, 15);
  }

  /**
   * 위 첨자 여부를 설정한다. (15 bit)
   *
   * @param superScript 위 첨자 여부
   */
  public setSuperScript(superScript: boolean): void {
    this.value = BitFlag.set(this.value, 15, superScript);
  }

  /**
   * 아래 첨자 여부를 반환한다. (16 bit)
   *
   * @return 아래 첨자 여부
   */
  public isSubScript(): boolean {
    return BitFlag.get(this.value, 16);
  }

  /**
   * 아래 첨자 여부를 설정한다. (16 bit)
   *
   * @param subScript 아래 첨자 여부
   */
  public setSubScript(subScript: boolean): void {
    this.value = BitFlag.set(this.value, 16, subScript);
  }

  /**
   * 취소선 여부를 반환한다. (18~20 bit)
   *
   * @return 취소선 여부
   */
  public isStrikeLine(): boolean {
    return (
      BitFlag.get(this.value, 18) ||
      BitFlag.get(this.value, 19) ||
      BitFlag.get(this.value, 20)
    );
  }

  /**
   * 취소선 여부를 설정한다. (18~20 bit)
   *
   * @param strikeLine 취소선 여부
   */
  public setStrikeLine(strikeLine: boolean): void {
    this.value = BitFlag.set(this.value, 18, strikeLine);
    this.value = BitFlag.set(this.value, 19, strikeLine);
    this.value = BitFlag.set(this.value, 20, strikeLine);
  }

  /**
   * 강조점의 종류를 반환한다. (21~24 bit)
   *
   * @return 강조점의 종류
   */
  public getEmphasisSort(): EmphasisSort {
    return EmphasisSort.valueOf(BitFlag.getRange(this.value, 21, 24));
  }

  /**
   * 강조점의 종류를 설정한다. (21~24 bit)
   *
   * @param emphasisSort 강조점의 종류
   */
  public setEmphasisSort(emphasisSort: EmphasisSort): void {
    this.value = BitFlag.setRange(this.value, 21, 24, emphasisSort);
  }

  /**
   * 글꼴에 어울리는 빈칸 사용 여부를 반환한다. (25 bit)
   *
   * @return 글꼴에 어울리는 빈칸 사용 여부
   */
  public isUsingSpaceAppropriateForFont(): boolean {
    return BitFlag.get(this.value, 25);
  }

  /**
   * 글꼴에 어울리는 빈칸 사용 여부를 설정한다. (25 bit)
   *
   * @param usingSpaceAppropriateForFont 글꼴에 어울리는 빈칸 사용 여부
   */
  public setUsingSpaceAppropriateForFont(usingSpaceAppropriateForFont: boolean): void {
    this.value = BitFlag.set(this.value, 25, usingSpaceAppropriateForFont);
  }

  /**
   * 취소선의 모양을 반환한다. (26~29 bit)
   *
   * @return 취소선의 모양
   */
  public getStrikeLineShape(): BorderType2 {
    return BorderType2.valueOf(BitFlag.getRange(this.value, 26, 29));
  }

  /**
   * 취소선의 모양을 설정한다. (26~29 bit)
   *
   * @param strikeLineShape 취소선의 모양
   */
  public setStrikeLineShape(strikeLineShape: BorderType2): void {
    this.value = BitFlag.setRange(this.value, 26, 29, strikeLineShape);
  }

  /**
   * Kerning 여부를 반환한다. (30 bit)
   *
   * @return Kerning 여부
   */
  public isKerning(): boolean {
    return BitFlag.get(this.value, 30);
  }

  /**
   * Kerning 여부를 설정한다. (30 bit)
   *
   * @param kerning Kerning 여부
   */
  public setKerning(kerning: boolean): void {
    this.value = BitFlag.set(this.value, 30, kerning);
  }

  public copy(from: CharShapeProperty): void {
    this.value = from.value;
  }
}
