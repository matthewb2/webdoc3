import { BitFlag } from "../../../util/binary/BitFlag.js";
import { LineSpaceSort } from "./LineSpaceSort.js";

/**
 * 문단 모양의 속성3 객체. (5.0.2.5 버전 이상)
 *
 * @author neolord
 */
export class ParaShapeProperty3 {
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
   * 줄 간격 종류를 반환한다. (0~4 bit)
   *
   * @return 줄 간격 종류
   */
  public getLineSpaceSort(): LineSpaceSort {
    return LineSpaceSort.valueOf(BitFlag.getRange(this.value, 0, 4));
  }

  /**
   * 줄 간격 종류를 설정한다. (0~4 bit)
   *
   * @param lineSpaceSort 줄 간격 종류
   */
  public setLineSpaceSort(lineSpaceSort: LineSpaceSort): void {
    this.value = BitFlag.setRange(this.value, 0, 4, lineSpaceSort);
  }

  public copy(from: ParaShapeProperty3): void {
    this.value = from.value;
  }
}
