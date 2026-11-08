/**
 * 언어별 글자 장평
 *
 * @author neolord
 */
export class Ratios {
  /**
   * 언어별 글자 장평의 값이 저장된 배열
   */
  private array: number[];

  /**
   * 생성자
   */
  public constructor() {
    this.array = new Array<number>(7).fill(0);
  }

  /**
   * 언어별 글자 장평의 값이 저장된 배열을 반환한다.
   *
   * @return 언어별 글자 장평의 값이 저장된 배열
   */
  public getArray(): number[] {
    return this.array;
  }

  /**
   * 언어별 글자 장평의 값이 저장된 배열을 설정한다.
   *
   * @param array 언어별 글자 장평의 값이 저장된 배열
   */
  public setArray(array: number[]): void {
    if (array.length !== 7) {
      throw new Error("array length must be 7");
    }
    this.array = array;
  }

  /**
   * 한글에 대한 글자 장평을 반환한다.
   *
   * @return 한글에 대한 글자 장평
   */
  public getHangul(): number {
    return this.array[0]!;
  }

  /**
   * 한글에 대한 글자 장평을 설정한다.
   *
   * @param ratio 한글에 대한 글자 장평
   */
  public setHangul(ratio: number): void {
    this.array[0] = ratio;
  }

  /**
   * 영어에 대한 글자 장평을 반환한다.
   *
   * @return 영어에 대한 글자 장평
   */
  public getLatin(): number {
    return this.array[1]!;
  }

  /**
   * 영어에 대한 글자 장평을 설정한다.
   *
   * @param ratio 영어에 대한 글자 장평
   */
  public setLatin(ratio: number): void {
    this.array[1] = ratio;
  }

  /**
   * 한자에 대한 글자 장평을 반환한다.
   *
   * @return 한자에 대한 글자 장평
   */
  public getHanja(): number {
    return this.array[2]!;
  }

  /**
   * 한자에 대한 글자 장평을 설정한다.
   *
   * @param ratio 한자에 대한 글자 장평
   */
  public setHanja(ratio: number): void {
    this.array[2] = ratio;
  }

  /**
   * 일본어에 대한 글자 장평을 반환한다.
   *
   * @return 일본어에 대한 글자 장평
   */
  public getJapanese(): number {
    return this.array[3]!;
  }

  /**
   * 일본어에 대한 글자 장평을 설정한다.
   *
   * @param ratio 일본어에 대한 글자 장평
   */
  public setJapanese(ratio: number): void {
    this.array[3] = ratio;
  }

  /**
   * 기타 언어에 대한 글자 장평을 반환한다.
   *
   * @return 기타 언어에 대한 글자 장평
   */
  public getOther(): number {
    return this.array[4]!;
  }

  /**
   * 기타 언어에 대한 글자 장평을 설정한다.
   *
   * @param ratio 기타 언어에 대한 글자 장평
   */
  public setOther(ratio: number): void {
    this.array[4] = ratio;
  }

  /**
   * 기호에 대한 글자 장평을 반환한다.
   *
   * @return 기호에 대한 글자 장평
   */
  public getSymbol(): number {
    return this.array[5]!;
  }

  /**
   * 기호에 대한 글자 장평을 설정한다.
   *
   * @param ratio 기호에 대한 글자 장평
   */
  public setSymbol(ratio: number): void {
    this.array[5] = ratio;
  }

  /**
   * 사용자 정의 글자 장평을 반환한다.
   *
   * @return 사용자 정의 글자 장평
   */
  public getUser(): number {
    return this.array[6]!;
  }

  /**
   * 사용자 정의 글자 장평을 설정한다.
   *
   * @param ratio 사용자 정의 글자 장평
   */
  public setUser(ratio: number): void {
    this.array[6] = ratio;
  }

  /**
   * 모든 문자에 대한 글자 장평을 설정한다.
   *
   * @param ratio 모든 문자에 대한 글자 장평
   */
  public setForAll(ratio: number): void {
    for (let index = 0; index < 7; index++) {
      this.array[index] = ratio;
    }
  }

  public copy(from: Ratios): void {
    for (let index = 0; index < from.array.length; index++) {
      this.array[index] = from.array[index]!;
    }
  }
}
