/**
 * 영역 태그 정보에 대한 객체
 *
 * @author neolord
 */
export class RangeTagItem {
  /**
   * 영역 시작
   */
  private rangeStart = 0;
  /**
   * 영역 끝
   */
  private rangeEnd = 0;
  /**
   * 태그 종류
   */
  private sort = 0;
  /**
   * 태그 데이타 (3byte)
   */
  private data: Uint8Array | null = null;

  /**
   * 생성자
   */
  constructor() {}

  /**
   * 영역 시작을 반환한다.
   *
   * @return 영역 시작
   */
  getRangeStart(): number {
    return this.rangeStart;
  }

  /**
   * 영역 시작을 설정한다.
   *
   * @param rangeStart 영역 시작
   */
  setRangeStart(rangeStart: number): void {
    this.rangeStart = rangeStart;
  }

  /**
   * 영역 끝을 반환한다.
   *
   * @return 영역 끝
   */
  getRangeEnd(): number {
    return this.rangeEnd;
  }

  /**
   * 영역 끝을 설정한다.
   *
   * @param rangeEnd 영역 끝
   */
  setRangeEnd(rangeEnd: number): void {
    this.rangeEnd = rangeEnd;
  }

  /**
   * 태그 종류를 반환한다.
   *
   * @return 태그 종류
   */
  getSort(): number {
    return this.sort;
  }

  /**
   * 태그 종류를 설정한다.
   *
   * @param sort 태그 종류
   */
  setSort(sort: number): void {
    this.sort = sort;
  }

  /**
   * 태그 데이타를 반환한다.
   *
   * @return 태그 데이타
   */
  getData(): Uint8Array | null {
    return this.data;
  }

  /**
   * 태그 데이타를 설정한다.
   *
   * @param data 태그 데이타
   */
  setData(data: Uint8Array): void {
    if (data.length !== 3) {
      throw new Error("data must be 3 bytes.");
    }
    this.data = data;
  }

  clone(): RangeTagItem {
    const cloned = new RangeTagItem();
    cloned.rangeStart = this.rangeStart;
    cloned.rangeEnd = this.rangeEnd;
    cloned.sort = this.sort;
    if (this.data !== null) {
      cloned.data = this.data.slice();
    } else {
      cloned.data = null;
    }
    return cloned;
  }
}
