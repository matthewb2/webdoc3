/**
 * 언어별 자간에 대한 객체
 *
 * @author neolord
 */
export class CharSpaces {
  /**
   * 언어별 글자 자간의 값이 저장된 배열
   */
  private array: Uint8Array;

  /**
   * 생성자
   */
  public constructor() {
    this.array = new Uint8Array(7);
  }

  /**
   * 언어별 글자 자간의 값이 저장된 배열를 반환한다.
   *
   * @return 언어별 글자 자간의 값이 저장된 배열
   */
  public getArray(): Uint8Array {
    return this.array;
  }

  /**
   * 언어별 글자 자간의 값이 저장된 배열를 설정한다.
   *
   * @param array 언어별 글자 자간의 값이 저장된 배열
   */
  public setArray(array: Uint8Array): void {
    if (array.length !== 7) {
      throw new Error("array length must be 7");
    }
    this.array = array;
  }

  /**
   * 한글에 대한 자간 값을 반환한다.
   *
   * @return 한글에 대한 자간 값
   */
  public getHangul(): number {
    return this.array[0]!;
  }

  /**
   * 한글에 대한 자간 값을 설정한다.
   *
   * @param charSpace 한글에 대한 자간 값
   */
  public setHangul(charSpace: number): void {
    this.array[0] = charSpace;
  }

  /**
   * 영어에 대한 자간 값을 반환한다.
   *
   * @return 영어에 대한 자간 값
   */
  public getLatin(): number {
    return this.array[1]!;
  }

  /**
   * 영어에 대한 자간 값을 설정한다.
   *
   * @param charSpace 영어에 대한 자간 값
   */
  public setLatin(charSpace: number): void {
    this.array[1] = charSpace;
  }

  /**
   * 한자에 대한 자간 값을 반환한다.
   *
   * @return 한자에 대한 자간 값
   */
  public getHanja(): number {
    return this.array[2]!;
  }

  /**
   * 한자에 대한 자간 값을 설정한다.
   *
   * @param charSpace 한자에 대한 자간 값
   */
  public setHanja(charSpace: number): void {
    this.array[2] = charSpace;
  }

  /**
   * 일본어에 대한 자간 값을 반환한다.
   *
   * @return 일본어에 대한 자간 값
   */
  public getJapanese(): number {
    return this.array[3]!;
  }

  /**
   * 일본어에 대한 자간 값을 설정한다.
   *
   * @param charSpace 일본어에 대한 자간 값
   */
  public setJapanese(charSpace: number): void {
    this.array[3] = charSpace;
  }

  /**
   * 기타 언어에 대한 자간 값을 반환한다.
   *
   * @return 기타 언어에 대한 자간 값
   */
  public getOther(): number {
    return this.array[4]!;
  }

  /**
   * 기타 언어에 대한 자간 값을 설정한다.
   *
   * @param charSpace 기타 언어에 대한 자간 값
   */
  public setOther(charSpace: number): void {
    this.array[4] = charSpace;
  }

  /**
   * 기호에 대한 자간 값을 반환한다.
   *
   * @return 기호에 대한 자간 값
   */
  public getSymbol(): number {
    return this.array[5]!;
  }

  /**
   * 기호에 대한 자간 값을 설정한다.
   *
   * @param charSpace 기호에 대한 자간 값
   */
  public setSymbol(charSpace: number): void {
    this.array[5] = charSpace;
  }

  /**
   * 사용자 정의 자간 값을 반환한다.
   *
   * @return 사용자 정의 자간 값
   */
  public getUser(): number {
    return this.array[6]!;
  }

  /**
   * 사용자 정의 자간 값을 설정한다.
   *
   * @param charSpace 사용자 정의 자간 값
   */
  public setUser(charSpace: number): void {
    this.array[6] = charSpace;
  }

  /**
   * 모든 문자에 대한 자간 값를 설정한다.
   *
   * @param charSpace 모든 문자에 대한 자간 값
   */
  public setForAll(charSpace: number): void {
    for (let index = 0; index < 7; index++) {
      this.array[index] = charSpace;
    }
  }

  public copy(from: CharSpaces): void {
    for (let index = 0; index < from.array.length; index++) {
      this.array[index] = from.array[index]!;
    }
  }
}
