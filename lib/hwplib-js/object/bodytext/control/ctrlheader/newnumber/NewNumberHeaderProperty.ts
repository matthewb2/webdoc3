import { NumberSort } from "../autonumber/NumberSort.js";
import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * 새 번호 지정 컨트롤의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class NewNumberHeaderProperty {
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

  public copy(from: NewNumberHeaderProperty): void {
    this.value = from.value;
  }
}
