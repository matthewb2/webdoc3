import { BitFlag } from "../../../../util/binary/BitFlag.js";
import { DivideAtPageBoundary } from "./DivideAtPageBoundary.js";

/**
 * 표의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class TableProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value = 0;

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
   * 쪽 경계에서 나눔 방법를 반환한다. (0~1 bit)
   *
   * @return 쪽 경계에서 나눔 방법
   */
  public getDivideAtPageBoundary(): DivideAtPageBoundary {
    return DivideAtPageBoundary.valueOf(BitFlag.getRange(this.value, 0, 1));
  }

  /**
   * 쪽 경계에서 나눔 방법을 설정한다. (0~1 bit)
   *
   * @param divideAtPageBoundary 쪽 경계에서 나눔 방법
   */
  public setDivideAtPageBoundary(divideAtPageBoundary: DivideAtPageBoundary): void {
    this.value = BitFlag.setRange(this.value, 0, 1, divideAtPageBoundary);
  }

  /**
   * 제목 줄 자동 반복 여부을 반환한다. (2 bit)
   *
   * @return 제목 줄 자동 반복 여부
   */
  public isAutoRepeatTitleRow(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 제목 줄 자동 반복 여부를 설정한다. (2 bit)
   *
   * @param autoRepeatTitleRow 제목 줄 자동 반복 여부
   */
  public setAutoRepeatTitleRow(autoRepeatTitleRow: boolean): void {
    this.value = BitFlag.set(this.value, 2, autoRepeatTitleRow);
  }

  public copy(from: TableProperty): void {
    this.value = from.value;
  }
}
