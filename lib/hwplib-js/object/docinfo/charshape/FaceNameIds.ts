/**
 * 언어별 참조된 글꼴 ID(FaceID)
 *
 * @author neolord
 */
export class FaceNameIds {
  /**
   * 언어별 참조된 글꼴 ID 값이 저장된 배열
   */
  private array: number[];

  /**
   * 생성자
   */
  public constructor() {
    this.array = new Array<number>(7).fill(0);
  }

  /**
   * 언어별 참조된 글꼴 ID 값이 저장된 배열를 반환한다.
   *
   * @return 언어별 참조된 글꼴 ID 값이 저장된 배열
   */
  public getArray(): number[] {
    return this.array;
  }

  /**
   * 언어별 참조된 글꼴 ID 값이 저장된 배열를 설정한다.
   *
   * @param array 언어별 참조된 글꼴 ID 값이 저장된 배열
   */
  public setArray(array: number[]): void {
    if (array.length !== 7) {
      throw new Error("array length must be 7");
    }
    this.array = array;
  }

  /**
   * 한글에 대한 참조된 글꼴 Id를 반환한다.
   *
   * @return 한글에 대한 참조된 글꼴 Id
   */
  public getHangul(): number {
    return this.array[0]!;
  }

  /**
   * 한글에 대한 참조된 글꼴 Id를 설정한다.
   *
   * @param faceNameID 한글에 대한 참조된 글꼴 Id
   */
  public setHangul(faceNameID: number): void {
    this.array[0] = faceNameID;
  }

  /**
   * 영어에 대한 참조된 글꼴 Id를 반환한다.
   *
   * @return 영어에 대한 참조된 글꼴 Id
   */
  public getLatin(): number {
    return this.array[1]!;
  }

  /**
   * 영어에 대한 참조된 글꼴 Id를 설정한다.
   *
   * @param faceNameID 영어에 대한 참조된 글꼴 Id
   */
  public setLatin(faceNameID: number): void {
    this.array[1] = faceNameID;
  }

  /**
   * 한자에 대한 참조된 글꼴 Id를 반환한다.
   *
   * @return 한자에 대한 참조된 글꼴 Id
   */
  public getHanja(): number {
    return this.array[2]!;
  }

  /**
   * 한자에 대한 참조된 글꼴 Id를 설정한다.
   *
   * @param faceNameID 한자에 대한 참조된 글꼴 Id
   */
  public setHanja(faceNameID: number): void {
    this.array[2] = faceNameID;
  }

  /**
   * 일본어에 대한 참조된 글꼴 Id를 반환한다.
   *
   * @return 일본어에 대한 참조된 글꼴 Id
   */
  public getJapanese(): number {
    return this.array[3]!;
  }

  /**
   * 일본어에 대한 참조된 글꼴 Id를 설정한다.
   *
   * @param faceNameID 일본어에 대한 참조된 글꼴 Id
   */
  public setJapanese(faceNameID: number): void {
    this.array[3] = faceNameID;
  }

  /**
   * 기타 언어에 대한 참조된 글꼴 Id를 반환한다.
   *
   * @return 기타 언어에 대한 참조된 글꼴 Id
   */
  public getOther(): number {
    return this.array[4]!;
  }

  /**
   * 기타 언어에 대한 참조된 글꼴 Id를 설정한다.
   *
   * @param faceNameID 기타 언어에 대한 참조된 글꼴 Id
   */
  public setOther(faceNameID: number): void {
    this.array[4] = faceNameID;
  }

  /**
   * 기호에 대한 참조된 글꼴 Id를 반환한다.
   *
   * @return 기호에 대한 참조된 글꼴 Id
   */
  public getSymbol(): number {
    return this.array[5]!;
  }

  /**
   * 기호에 대한 참조된 글꼴 Id를 설정한다.
   *
   * @param faceNameID 기호에 대한 참조된 글꼴 Id
   */
  public setSymbol(faceNameID: number): void {
    this.array[5] = faceNameID;
  }

  /**
   * 사용자 정의에 대한 참조된 글꼴 Id를 반환한다.
   *
   * @return 사용자 정의에 대한 참조된 글꼴 Id
   */
  public getUser(): number {
    return this.array[6]!;
  }

  /**
   * 사용자 정의에 대한 참조된 글꼴 Id를 설정한다.
   *
   * @param faceNameID 사용자 정의에 대한 참조된 글꼴 Id
   */
  public setUser(faceNameID: number): void {
    this.array[6] = faceNameID;
  }

  /**
   * 모든 문자에 대한 참조된 글꼴 Id를 설정한다.
   *
   * @param faceNameID 모든 문자에 대한 참조된 글꼴 Id
   */
  public setForAll(faceNameID: number): void {
    for (let index = 0; index < 7; index++) {
      this.array[index] = faceNameID;
    }
  }

  public copy(from: FaceNameIds): void {
    for (let index = 0; index < from.array.length; index++) {
      this.array[index] = from.array[index]!;
    }
  }
}
