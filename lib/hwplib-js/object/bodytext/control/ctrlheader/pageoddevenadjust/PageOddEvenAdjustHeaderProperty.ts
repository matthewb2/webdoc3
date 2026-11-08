import { OddEvenPage } from "./OddEvenPage.js";
import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * 홀/짝수 조정(페이지 번호 제어) 컨트롤의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class PageOddEvenAdjustHeaderProperty {
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
   * 홀/짝수 구분을 반환한다. (0~1 bit)
   *
   * @return 홀/짝수 구분
   */
  public getOldEvenPage(): OddEvenPage {
    return OddEvenPage.valueOf(BitFlag.getRange(this.value, 0, 1));
  }

  /**
   * 홀/짝수 구분를 설정한다. (0~1 bit)
   *
   * @param oldEvenPage 홀/짝수 구분
   */
  public setOldEvenPage(oldEvenPage: OddEvenPage): void {
    this.value = BitFlag.setRange(this.value, 0, 1, oldEvenPage);
  }

  public copy(from: PageOddEvenAdjustHeaderProperty): void {
    this.value = from.value;
  }
}
