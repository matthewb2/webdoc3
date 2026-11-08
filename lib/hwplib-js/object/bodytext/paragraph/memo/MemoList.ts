/**
 * 메모 리스트 레코드
 *
 * @author neolord
 */
export class MemoList {
  /**
   * 메모 인덱스
   */
  private memoIndex: number;

  /**
   * 생성자
   */
  constructor() {
    this.memoIndex = 0;
  }

  /**
   * 메모 인덱스를 반환한다.
   *
   * @return 메모 인덱스
   */
  getMemoIndex(): number {
    return this.memoIndex;
  }

  /**
   * 메모 인덱스를 설정한다.
   *
   * @param memoIndex 메모 인덱스
   */
  setMemoIndex(memoIndex: number): void {
    this.memoIndex = memoIndex;
  }

  copy(from: MemoList): void {
    this.memoIndex = from.memoIndex;
  }
}
