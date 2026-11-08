import { BitFlag } from "../../../../../util/binary/BitFlag.js";
import { CaptionDirection } from "./CaptionDirection.js";

/**
 * 캡션 정보의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class ListHeaderCaptionProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value = 0;

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  getValue(): number {
    return this.value;
  }

  /**
   * 파일에 저장되는 정수값을 설정한다.
   *
   * @param value 파일에 저장되는 정수값
   */
  setValue(value: number): void {
    this.value = value;
  }

  /**
   * 캡션 방향을 반환한다. (0~1 bit)
   *
   * @return 캡션 방향
   */
  getDirection(): CaptionDirection {
    return CaptionDirection.valueOf(BitFlag.getRange(this.value, 0, 1));
  }

  /**
   * 캡션 방향을 설정한다. (0~1 bit)
   *
   * @param direction 캡션 방향
   */
  setDirection(direction: CaptionDirection): void {
    this.value = BitFlag.setRange(this.value, 0, 1, direction);
  }

  /**
   * 캡션 폭에 여백을 포함할 것인지 여부를 반환한다. (2 bit)
   *
   * @return 캡션 폭에 여백을 포함할 것인지 여부
   */
  isIncludeMargin(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 캡션 폭에 여백을 포함할 것인지 여부를 설정한다. (2 bit)
   *
   * @param includeMargin 캡션 폭에 여백을 포함할 것인지 여부
   */
  setIncludeMargin(includeMargin: boolean): void {
    this.value = BitFlag.set(this.value, 2, includeMargin);
  }

  copy(from: ListHeaderCaptionProperty): void {
    this.value = from.value;
  }
}
