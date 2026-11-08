import { BitFlag } from "../../../../util/binary/BitFlag.js";

/**
 * 채우기 종류
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.FillType`.
 *
 * @author neolord
 */
export class FillType {
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
   * 단색 채우기 적용 여부를 반환한다. (0 bit)
   *
   * @return 단색 채우기 적용 여부
   */
  public hasPatternFill(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 단색 채우기 적용 여부를 설정한다. (0 bit)
   *
   * @param patternFill 단색 채우기 적용 여부
   */
  public setPatternFill(patternFill: boolean): void {
    this.value = BitFlag.set(this.value, 0, patternFill);
  }

  /**
   * 이미지 채우기 적용 여부를 반환한다. (1 bit)
   *
   * @return 이미지 채우기 적용 여부
   */
  public hasImageFill(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 이미지 채우기 적용 여부를 설정한다. (1 bit)
   *
   * @param imageFill 이미지 채우기 적용 여부
   */
  public setImageFill(imageFill: boolean): void {
    this.value = BitFlag.set(this.value, 1, imageFill);
  }

  /**
   * 그러데이션 채우기 적용 여부를 반환한다. (2 bit)
   *
   * @return 그러데이션 채우기 적용 여부
   */
  public hasGradientFill(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 그러데이션 채우기 적용 여부를 설정한다. (2 bit)
   *
   * @param gradientFill 그러데이션 채우기 적용 여부
   */
  public setGradientFill(gradientFill: boolean): void {
    this.value = BitFlag.set(this.value, 2, gradientFill);
  }

  public copy(from: FillType): void {
    this.value = from.value;
  }
}
