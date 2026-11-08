import { BitFlag } from "../../../../util/binary/BitFlag.js";
import { NumberShape } from "./NumberShape.js";
import { FootNoteDisplayMethod } from "./FootNoteDisplayMethod.js";
import { EndNoteDisplayMethod } from "./EndNoteDisplayMethod.js";
import { NumberingMethod } from "./NumberingMethod.js";

/**
 * 각주 모양에 대한 속성을 나타내는 객체
 * Ported from hwplib's `object.bodytext.control.sectiondefine.FootNoteShapeProperty`.
 *
 * @author neolord
 */
export class FootNoteShapeProperty {
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
   * 번호 모양을 반환한다. (0~7 bit) (0~16 은 범용. 0x80, 0x81은 각주/미주 전용)
   *
   * @return 번호 모양
   */
  public getNumberShape(): NumberShape {
    return NumberShape.valueOf(BitFlag.getRange(this.value, 0, 7));
  }

  /**
   * 번호 모양을 설정한다. (0~7 bit) (0~16 은 범용. 0x80, 0x81은 각주/미주 전용)
   *
   * @param numberShape 번호 모양
   */
  public setNumberShape(numberShape: NumberShape): void {
    this.value = BitFlag.setRange(this.value, 0, 7, numberShape);
  }

  /**
   * 한 페이지 내에서 각주를 다단에 위치시킬 방법을 반환한다.(각주 일 경우) (8~9 bit)
   *
   * @return 한 페이지 내에서 각주를 다단에 위치시킬 방법
   */
  public getFootNoteDisplayMethod(): FootNoteDisplayMethod {
    return FootNoteDisplayMethod.valueOf(BitFlag.getRange(this.value, 8, 9));
  }

  /**
   * 한 페이지 내에서 각주를 다단에 위치시킬 방법를 설정한다. (각주 일 경우) (8~9 bit)
   *
   * @param footNoteDisplayMethod 한 페이지 내에서 각주를 다단에 위치시킬 방법
   */
  public setFootNoteDisplayMethod(footNoteDisplayMethod: FootNoteDisplayMethod): void {
    this.value = BitFlag.setRange(this.value, 8, 9, footNoteDisplayMethod);
  }

  /**
   * 미주를 위치시킬 방법을 반환한다.(미주 일 경우) (8~9 bit)
   *
   * @return 미주를 위치시킬 방법
   */
  public getEndNoteDisplayMethod(): EndNoteDisplayMethod {
    return EndNoteDisplayMethod.valueOf(BitFlag.getRange(this.value, 8, 9));
  }

  /**
   * 미주를 위치시킬 방법을 설정한다.(미주 일 경우) (8~9 bit)
   *
   * @param endNoteDisplayMethod 미주를 위치시킬 방법
   */
  public setEndNoteDisplayMethod(endNoteDisplayMethod: EndNoteDisplayMethod): void {
    this.value = BitFlag.setRange(this.value, 8, 9, endNoteDisplayMethod);
  }

  /**
   * 번호 매김 방법을 반환한다. (10~11 bit)
   *
   * @return 번호 매김 방법
   */
  public getNumberingMethod(): NumberingMethod {
    return NumberingMethod.valueOf(BitFlag.getRange(this.value, 10, 11));
  }

  /**
   * 번호 매김 방법을 설정한다. (10~11 bit)
   *
   * @param numberingMethod 번호 매김 방법
   */
  public setNumberingMethod(numberingMethod: NumberingMethod): void {
    this.value = BitFlag.setRange(this.value, 10, 11, numberingMethod);
  }

  /**
   * 각주 내용 중 번호 코드의 모양을 위 첨자 형식으로 할지 여부을 반환한다. (12 bit)
   *
   * @return 각주 내용 중 번호 코드의 모양을 위 첨자 형식으로 할지 여부
   */
  public isDisplayWithSupscript(): boolean {
    return BitFlag.get(this.value, 12);
  }

  /**
   * 각주 내용 중 번호 코드의 모양을 위 첨자 형식으로 할지 여부를 설정한다. (12 bit)
   *
   * @param displayWithSupscript 각주 내용 중 번호 코드의 모양을 위 첨자 형식으로 할지 여부
   */
  public setDisplayWithSupscript(displayWithSupscript: boolean): void {
    this.value = BitFlag.set(this.value, 12, displayWithSupscript);
  }

  /**
   * 텍스트에 이어 바로 출력할지 여부를 반환한다. (13 bit)
   *
   * @return 텍스트에 이어 바로 출력할지 여부
   */
  public isContinueFromText(): boolean {
    return BitFlag.get(this.value, 13);
  }

  /**
   * 텍스트에 이어 바로 출력할지 여부를 설정한다. (13 bit)
   *
   * @param continueFromText 텍스트에 이어 바로 출력할지 여부
   */
  public setContinueFromText(continueFromText: boolean): void {
    this.value = BitFlag.set(this.value, 13, continueFromText);
  }

  public copy(from: FootNoteShapeProperty): void {
    this.value = from.value;
  }
}
