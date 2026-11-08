import { NumberShape } from "../../sectiondefine/NumberShape.js";
import { NumberPosition } from "./NumberPosition.js";
import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * 쪽 번호 위치 컨트롤의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class PageNumberPositionHeaderProperty {
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
   * 번호 모양을 반환한다. (0~7 bit)
   *
   * @return 번호 모양
   */
  public getNumberShape(): NumberShape {
    return NumberShape.valueOf(BitFlag.getRange(this.value, 0, 7));
  }

  /**
   * 번호 모양을 설정한다. (0~7 bit)
   *
   * @param numberShape 번호 모양
   */
  public setNumberShape(numberShape: NumberShape): void {
    this.value = BitFlag.setRange(this.value, 0, 7, numberShape);
  }

  /**
   * 번호의 표시 위치를 반환한다. (8~11 bit)
   *
   * @return 번호의 표시 위치
   */
  public getNumberPosition(): NumberPosition {
    return NumberPosition.valueOf(BitFlag.getRange(this.value, 8, 11));
  }

  /**
   * 번호의 표시 위치를 설정한다. (8~11 bit)
   *
   * @param numberPosition 번호의 표시 위치
   */
  public setNumberPosition(numberPosition: NumberPosition): void {
    this.value = BitFlag.setRange(this.value, 8, 11, numberPosition);
  }

  public copy(from: PageNumberPositionHeaderProperty): void {
    this.value = from.value;
  }
}
