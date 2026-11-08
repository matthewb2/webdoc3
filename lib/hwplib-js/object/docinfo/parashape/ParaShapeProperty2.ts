import { BitFlag } from "../../../util/binary/BitFlag.js";

/**
 * 문단 모양의 속성2 객체. (5.0.1.7 버전 이상)
 *
 * @author neolord
 */
export class ParaShapeProperty2 {
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
   * 한 줄로 입력 여부를 설정한다. (0~1 bit)
   *
   * @return 한 줄로 입력 여부
   */
  public isInputSingleLine(): boolean {
    return BitFlag.get(this.value, 0) || BitFlag.get(this.value, 1);
  }

  /**
   * 한 줄로 입력 여부를 설정한다. (0~1 bit)
   *
   * @param inputSingleLine 한 줄로 입력 여부
   */
  public setInputSingleLine(inputSingleLine: boolean): void {
    this.value = BitFlag.set(this.value, 0, inputSingleLine);
    this.value = BitFlag.set(this.value, 1, inputSingleLine);
  }

  /**
   * 한글과 영어 간격을 자동 조절 여부를 반환한다. (4 bit)
   *
   * @return 한글과 영어 간격을 자동 조절 여부
   */
  public isAutoAdjustGapHangulEnglish(): boolean {
    return BitFlag.get(this.value, 4);
  }

  /**
   * 한글과 영어 간격을 자동 조절 여부를 설정한다. (4 bit)
   *
   * @param autoAdjustGapHangulEnglish 한글과 영어 간격을 자동 조절 여부
   */
  public setAutoAdjustGapHangulEnglish(autoAdjustGapHangulEnglish: boolean): void {
    this.value = BitFlag.set(this.value, 4, autoAdjustGapHangulEnglish);
  }

  /**
   * 한글과 숫자 간격을 자동 조절 여부를 반환한다. (5 bit)
   *
   * @return 한글과 숫자 간격을 자동 조절 여부
   */
  public isAutoAdjustGapHangulNumber(): boolean {
    return BitFlag.get(this.value, 5);
  }

  /**
   * 한글과 숫자 간격을 자동 조절 여부를 설정한다. (5 bit)
   *
   * @param autoAdjustGapHangulNumber 한글과 숫자 간격을 자동 조절 여부
   */
  public setAutoAdjustGapHangulNumber(autoAdjustGapHangulNumber: boolean): void {
    this.value = BitFlag.set(this.value, 5, autoAdjustGapHangulNumber);
  }

  /**
   * 줄번호 제거 여부를 반환한다. (6 bit)
   *
   * @return 줄번호 제거 여부
   */
  public isSuppressLineNumbers(): boolean {
    return BitFlag.get(this.value, 6);
  }

  /**
   * 줄번호 제거 여부를 설정한다. (6 bit)
   *
   * @param suppressLineNumbers 줄번호 제거 여부
   */
  public setSuppressLineNumbers(suppressLineNumbers: boolean): void {
    this.value = BitFlag.set(this.value, 6, suppressLineNumbers);
  }

  public copy(from: ParaShapeProperty2): void {
    this.value = from.value;
  }
}
