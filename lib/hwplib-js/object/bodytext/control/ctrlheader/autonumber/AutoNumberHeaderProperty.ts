import { NumberShape } from "../../sectiondefine/NumberShape.js";
import { NumberSort } from "./NumberSort.js";
import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * 자동번호 컨트롤의 속성 객체
 *
 * @author neolord
 */
export class AutoNumberHeaderProperty {
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
   * 번호 종류를 반환한다. (0~3 bit)
   *
   * @return 번호 종류
   */
  public getNumberSort(): NumberSort {
    return NumberSort.valueOf(BitFlag.getRange(this.value, 0, 3));
  }

  /**
   * 번호 종류를 설정한다. (0~3 bit)
   *
   * @param numberSort 번호 종류
   */
  public setNumberSort(numberSort: NumberSort): void {
    this.value = BitFlag.setRange(this.value, 0, 3, numberSort);
  }

  /**
   * 번호 모양을 반환한다. (4~11 bit)
   *
   * @return 번호 모양
   */
  public getNumberShape(): NumberShape {
    return NumberShape.valueOf(BitFlag.getRange(this.value, 4, 11));
  }

  /**
   * 번호 모양을 설정한다. (4~11 bit)
   *
   * @param numberShape 번호 모양
   */
  public setNumberShape(numberShape: NumberShape): void {
    this.value = BitFlag.setRange(this.value, 4, 11, numberShape);
  }

  /**
   * 각주 내용 중 번호 코드의 모양을 윗 첨자 형식으로 할지 여부을 반환한다. (12 bit)
   *
   * @return 각주 내용 중 번호 코드의 모양을 윗 첨자 형식으로 할지 여부
   */
  public isSuperScript(): boolean {
    return BitFlag.get(this.value, 12);
  }

  /**
   * 각주 내용 중 번호 코드의 모양을 윗 첨자 형식으로 할지 여부를 설정한다. (12 bit)
   *
   * @param superScript 각주 내용 중 번호 코드의 모양을 윗 첨자 형식으로 할지 여부
   */
  public setSuperScript(superScript: boolean): void {
    this.value = BitFlag.set(this.value, 12, superScript);
  }

  public copy(from: AutoNumberHeaderProperty): void {
    this.value = from.value;
  }
}
