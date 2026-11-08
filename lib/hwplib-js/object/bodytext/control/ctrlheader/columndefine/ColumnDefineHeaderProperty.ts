import { ColumnDirection } from "./ColumnDirection.js";
import { ColumnSort } from "./ColumnSort.js";
import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * 단 정의 컨트롤의 속성 객체
 *
 * @author neolord
 */
export class ColumnDefineHeaderProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 2 byte)
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
   * 단 종류를 반환한다. (0~1 bit)
   *
   * @return 단 종류
   */
  public getColumnSort(): ColumnSort {
    return ColumnSort.valueOf(BitFlag.getRange(this.value, 0, 1));
  }

  /**
   * 단 종류를 설정한다. (0~1 bit)
   *
   * @param columnSort 단 종류
   */
  public setColumnSort(columnSort: ColumnSort): void {
    this.value = BitFlag.setRange(this.value, 0, 1, columnSort);
  }

  /**
   * 단 개수를 반환한다. (2~9 bit)
   *
   * @return 단 개수
   */
  public getColumnCount(): number {
    return BitFlag.getRange(this.value, 2, 9);
  }

  /**
   * 단 개수를 설정한다. (2~9 bit)
   *
   * @param columnCount 단 개수
   */
  public setColumnCount(columnCount: number): void {
    this.value = BitFlag.setRange(this.value, 2, 9, columnCount);
  }

  /**
   * 단 방향을 반환한다. (10~11 bit)
   *
   * @return 단 방향
   */
  public getColumnDirection(): ColumnDirection {
    return ColumnDirection.valueOf(BitFlag.getRange(this.value, 10, 11));
  }

  /**
   * 단 방향을 설정한다. (10~11 bit)
   *
   * @param columnDirection 단 방향
   */
  public setColumnDirection(columnDirection: ColumnDirection): void {
    this.value = BitFlag.setRange(this.value, 10, 11, columnDirection);
  }

  /**
   * 단 너비 동일하게 여부를 반환한다. (12 bit)
   *
   * @return 단 너비 동일하게 여부
   */
  public isSameWidth(): boolean {
    return BitFlag.get(this.value, 12);
  }

  /**
   * 단 너비 동일하게 여부를 설정한다. (12 bit)
   *
   * @param sameWidth 단 너비 동일하게 여부
   */
  public setSameWidth(sameWidth: boolean): void {
    this.value = BitFlag.set(this.value, 12, sameWidth);
  }

  public copy(from: ColumnDefineHeaderProperty): void {
    this.value = from.value;
  }
}
