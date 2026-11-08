import { TextDirection } from "../ctrlheader/sectiondefine/TextDirection.js";
import { LineChange } from "../gso/textbox/LineChange.js";
import { TextVerticalAlignment } from "../gso/textbox/TextVerticalAlignment.js";
import { BitFlag } from "../../../../util/binary/BitFlag.js";

/**
 * 셀의 문단 리스트 헤더의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class ListHeaderPropertyForCell {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 파일에 저장되는 정수값을 설정한다.
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
   * 텍스트 방향을 반환한다. (0~2 bit)
   *
   * @return 텍스트 방향
   */
  public getTextDirection(): TextDirection {
    return TextDirection.valueOf(BitFlag.getRange(this.value, 0, 2));
  }

  /**
   * 텍스트 방향을 설정한다. (0~2 bit)
   *
   * @param textDirection 텍스트 방향
   */
  public setTextDirection(textDirection: TextDirection): void {
    this.value = BitFlag.setRange(this.value, 0, 2, textDirection);
  }

  /**
   * 문단의 줄바꿈을 반환한다. (3~4 bit)
   *
   * @return 문단의 줄바꿈 방법
   */
  public getLineChange(): LineChange {
    return LineChange.valueOf(BitFlag.getRange(this.value, 3, 4));
  }

  /**
   * 문단의 줄바꿈을 설정한다. (3~4 bit)
   *
   * @param lineChange 문단의 줄바꿈 방법
   */
  public setLineChange(lineChange: LineChange): void {
    this.value = BitFlag.setRange(this.value, 3, 4, lineChange);
  }

  /**
   * 세로 정렬을 반환한다. (5~6 bit)
   *
   * @return 세로 정렬
   */
  public getTextVerticalAlignment(): TextVerticalAlignment {
    return TextVerticalAlignment.valueOf(BitFlag.getRange(this.value, 5, 6));
  }

  /**
   * 세로 정렬을 설정한다. (5~6 bit)
   *
   * @param textVerticalAlignment 세로 정렬
   */
  public setTextVerticalAlignment(textVerticalAlignment: TextVerticalAlignment): void {
    this.value = BitFlag.setRange(this.value, 5, 6, textVerticalAlignment);
  }

  /**
   * 안 여백 지정 여부를 반환한다. (16 bit)
   *
   * @return 안 여백 지정 여부
   */
  public isApplyInnerMagin(): boolean {
    return BitFlag.get(this.value, 16);
  }

  /**
   * 안 여백 지정 여부를 설정한다. (16 bit)
   *
   * @param applyInnerMagin 안 여백 지정 여부
   */
  public setApplyInnerMagin(applyInnerMagin: boolean): void {
    this.value = BitFlag.set(this.value, 16, applyInnerMagin);
  }

  /**
   * 셀 보호 여부를 반환한다. (17 bit)
   *
   * @return 셀 보호 여부
   */
  public isProtectCell(): boolean {
    return BitFlag.get(this.value, 17);
  }

  /**
   * 셀 보호 여부를 설정한다. (17 bit)
   *
   * @param protectCell 셀 보호 여부
   */
  public setProtectCell(protectCell: boolean): void {
    this.value = BitFlag.set(this.value, 17, protectCell);
  }

  /**
   * 제목셀 인지 여부를 반환한다. (18 bit)
   *
   * @return 셀 보호 여부
   */
  public isTitleCell(): boolean {
    return BitFlag.get(this.value, 18);
  }

  /**
   * 제목셀 인지 여부를 설정한다. (18 bit)
   *
   * @param titleCell 제목셀 인지 여부
   */
  public setTitleCell(titleCell: boolean): void {
    this.value = BitFlag.set(this.value, 18, titleCell);
  }

  /**
   * 양식 모드에서 편집 가능 여부를 반환한다. (19 bit)
   *
   * @return 양식 모드에서 편집 가능 여부
   */
  public isEditableAtFormMode(): boolean {
    return BitFlag.get(this.value, 19);
  }

  /**
   * 양식 모드에서 편집 가능 여부를 설정한다. (19 bit)
   *
   * @param editableAtFormMode 양식 모드에서 편집 가능 여부
   */
  public setEditableAtFormMode(editableAtFormMode: boolean): void {
    this.value = BitFlag.set(this.value, 19, editableAtFormMode);
  }

  public copy(from: ListHeaderPropertyForCell): void {
    this.value = from.value;
  }
}
