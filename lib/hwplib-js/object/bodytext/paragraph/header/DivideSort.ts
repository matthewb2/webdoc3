import { BitFlag } from "../../../../util/binary/BitFlag.js";

/**
 * 단 나누기의 종류에 대한 객체
 *
 * @author neolord
 */
export class DivideSort {
  /**
   * 파일에 저장되는 값 (unsigned 1 byte)
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
   * 구역 나누기가 적용되었는지 여부를 반환한다. (0 bit)
   *
   * @return 구역 나누기가 적용되었는지 여부
   */
  isDivideSection(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 구역 나누기가 적용되었는지 여부를 설정한다. (0 bit)
   *
   * @param divideSection
   */
  setDivideSection(divideSection: boolean): void {
    this.value = BitFlag.set(this.value, 0, divideSection);
  }

  /**
   * 다단 나누기가 적용되었는지 여부를 반환한다. (1 bit)
   *
   * @return 다단 나누기가 적용되었는지 여부
   */
  isDivideMultiColumn(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 다단 나누기가 적용되었는지 여부를 설정한다. (1 bit)
   *
   * @param divideMultiColumn 다단 나누기가 적용되었는지 여부
   */
  setDivideMultiColumn(divideMultiColumn: boolean): void {
    this.value = BitFlag.set(this.value, 1, divideMultiColumn);
  }

  /**
   * 쪽 나누기가 적용되었는지 여부를 반환한다. (2 bit)
   *
   * @return 쪽 나누기가 적용되었는지 여부
   */
  isDividePage(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 쪽 나누기가 적용되었는지 여부를 설정한다. (2 bit)
   *
   * @param dividePage 쪽 나누기가 적용되었는지 여부
   */
  setDividePage(dividePage: boolean): void {
    this.value = BitFlag.set(this.value, 2, dividePage);
  }

  /**
   * 단 나누기가 적용되었는지 여부를 반환한다. (3 bit)
   *
   * @return 단 나누기가 적용되었는지 여부
   */
  isDivideColumn(): boolean {
    return BitFlag.get(this.value, 3);
  }

  /**
   * 단 나누기가 적용되었는지 여부를 설정한다. (3 bit)
   *
   * @param divideColumn 단 나누기가 적용되었는지 여부
   */
  setDivideColumn(divideColumn: boolean): void {
    this.value = BitFlag.set(this.value, 3, divideColumn);
  }

  copy(from: DivideSort): void {
    this.value = from.value;
  }
}
