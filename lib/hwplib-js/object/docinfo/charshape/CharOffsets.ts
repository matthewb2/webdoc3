/**
 * 언어별 글자 위치에 대한 객체
 *
 * @author neolord
 */
export class CharOffsets {
  /**
   * 언어별 글자 위치의 값이 저장된 배열
   */
  private array: Uint8Array;

  /**
   * 생성자
   */
  public constructor() {
    this.array = new Uint8Array(7);
  }

  /**
   * 언어별 글자 위치의 값이 저장된 배열을 반환한다.
   *
   * @return 언어별 글자 위치의 값이 저장된 배열
   */
  public getArray(): Uint8Array {
    return this.array;
  }

  /**
   * 언어별 글자 위치의 값이 저장된 배열를 설정한다.
   *
   * @param array 언어별 글자 위치의 값이 저장된 배열
   */
  public setArray(array: Uint8Array): void {
    if (array.length !== 7) {
      throw new Error("array length must be 7");
    }
    this.array = array;
  }

  /**
   * 한글에 대한 글자 위치 값을 반환한다.
   *
   * @return 한글에 대한 글자 위치 값
   */
  public getHangul(): number {
    return this.array[0]!;
  }

  /**
   * 한글에 대한 글자 위치 값을 설정한다.
   *
   * @param charOffset 한글에 대한 글자 위치 값
   */
  public setHangul(charOffset: number): void {
    this.array[0] = charOffset;
  }

  /**
   * 영어에 대한 글자 위치 값을 반환한다.
   *
   * @return 영어에 대한 글자 위치 값
   */
  public getLatin(): number {
    return this.array[1]!;
  }

  /**
   * 영어에 대한 글자 위치 값을 설정한다.
   *
   * @param charOffset 영어에 대한 글자 위치 값
   */
  public setLatin(charOffset: number): void {
    this.array[1] = charOffset;
  }

  /**
   * 한자에 대한 글자 위치 값을 반환한다.
   *
   * @return 한자에 대한 글자 위치 값
   */
  public getHanja(): number {
    return this.array[2]!;
  }

  /**
   * 한자에 대한 글자 위치 값을 설정한다.
   *
   * @param charOffset 한자에 대한 글자 위치 값
   */
  public setHanja(charOffset: number): void {
    this.array[2] = charOffset;
  }

  /**
   * 일본어에 대한 글자 위치 값을 반환한다.
   *
   * @return 일본어에 대한 글자 위치 값
   */
  public getJapanese(): number {
    return this.array[3]!;
  }

  /**
   * 일본어에 대한 글자 위치 값을 설정한다.
   *
   * @param charOffset 일본어에 대한 글자 위치 값
   */
  public setJapanese(charOffset: number): void {
    this.array[3] = charOffset;
  }

  /**
   * 기타 언어에 대한 글자 위치 값를 반환한다.
   *
   * @return 기타 언어에 대한 글자 위치 값
   */
  public getOther(): number {
    return this.array[4]!;
  }

  /**
   * 기타 언어에 대한 글자 위치 값을 반환한다.
   *
   * @param charOffset 기타 언어에 대한 글자 위치 값
   */
  public setOther(charOffset: number): void {
    this.array[4] = charOffset;
  }

  /**
   * 기호에 대한 글자 위치 값을 반환한다.
   *
   * @return 기호에 대한 글자 위치 값
   */
  public getSymbol(): number {
    return this.array[5]!;
  }

  /**
   * 기호에 대한 글자 위치 값를 설정한다.
   *
   * @param charOffset 기호에 대한 글자 위치 값
   */
  public setSymbol(charOffset: number): void {
    this.array[5] = charOffset;
  }

  /**
   * 사용자 정의 글자 위치 값을 반환한다.
   *
   * @return 사용자 정의 글자 위치 값
   */
  public getUser(): number {
    return this.array[6]!;
  }

  /**
   * 사용자 정의 글자 위치 값를 설정한다.
   *
   * @param charOffset 사용자 정의 글자 위치 값
   */
  public setUser(charOffset: number): void {
    this.array[6] = charOffset;
  }

  /**
   * 모든 문자에 대한 글자 위치 값를 설정한다.
   *
   * @param charOffset 모든 문자에 대한 글자 위치 값
   */
  public setForAll(charOffset: number): void {
    for (let index = 0; index < 7; index++) {
      this.array[index] = charOffset;
    }
  }

  public copy(from: CharOffsets): void {
    for (let index = 0; index < from.array.length; index++) {
      this.array[index] = from.array[index]!;
    }
  }
}
