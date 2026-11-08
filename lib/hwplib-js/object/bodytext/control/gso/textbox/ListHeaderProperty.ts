import { TextDirection } from "../../ctrlheader/sectiondefine/TextDirection.js";
import { BitFlag } from "../../../../../util/binary/BitFlag.js";
import { LineChange } from "./LineChange.js";
import { TextVerticalAlignment } from "./TextVerticalAlignment.js";

/**
 * 문단 리스트 헤더의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class ListHeaderProperty {
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
   * 텍스트 방향을 반환한다. (0~2 bit)
   *
   * @return 텍스트 방향
   */
  getTextDirection(): TextDirection {
    return TextDirection.valueOf(BitFlag.getRange(this.value, 0, 2));
  }

  /**
   * 텍스트 방향을 설정한다. (0~2 bit)
   *
   * @param textDirection
   */
  setTextDirection(textDirection: TextDirection): void {
    this.value = BitFlag.setRange(this.value, 0, 2, textDirection);
  }

  /**
   * 문단의 줄바꿈 방법을 반환한다. (3~4 bit)
   *
   * @return 문단의 줄바꿈 방법
   */
  getLineChange(): LineChange {
    return LineChange.valueOf(BitFlag.getRange(this.value, 3, 4));
  }

  /**
   * 문단의 줄바꿈 방법을 설정한다. (3~4 bit)
   *
   * @param lineChange 문단의 줄바꿈 방법
   */
  setLineChange(lineChange: LineChange): void {
    this.value = BitFlag.setRange(this.value, 3, 4, lineChange);
  }

  /**
   * 세로 정렬 방법을 반환한다. (5~6 bit)
   *
   * @return 세로 정렬 방법
   */
  getTextVerticalAlignment(): TextVerticalAlignment {
    return TextVerticalAlignment.valueOf(BitFlag.getRange(this.value, 5, 6));
  }

  /**
   * 세로 정렬 방법을 설정한다. (5~6 bit)
   *
   * @param textVerticalAlignment 세로 정렬 방법
   */
  setTextVerticalAlignment(textVerticalAlignment: TextVerticalAlignment): void {
    this.value = BitFlag.setRange(this.value, 5, 6, textVerticalAlignment);
  }

  copy(from: ListHeaderProperty): void {
    this.value = from.value;
  }
}
