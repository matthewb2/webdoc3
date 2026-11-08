/**
 * 영역 속성
 *
 * @author neolord
 */
export class ZoneInfo {
  /**
   * 시작 열 주소
   */
  private startColumn = 0;
  /**
   * 시작 행 주소
   */
  private startRow = 0;
  /**
   * 끝 열 주소
   */
  private endColumn = 0;
  /**
   * 끝 행 주소
   */
  private endRow = 0;
  /**
   * 참조된 테두리/배경 Id
   */
  private borderFillId = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 시작 열 주소를 반환한다.
   *
   * @return 시작 열 주소
   */
  public getStartColumn(): number {
    return this.startColumn;
  }

  /**
   * 시작 열 주소를 설정한다.
   *
   * @param startColumn 시작 열 주소
   */
  public setStartColumn(startColumn: number): void {
    this.startColumn = startColumn;
  }

  /**
   * 시작 행 주소를 반환한다.
   *
   * @return 시작 행 주소
   */
  public getStartRow(): number {
    return this.startRow;
  }

  /**
   * 시작 행 주소를 설정한다.
   *
   * @param startRow 시작 행 주소
   */
  public setStartRow(startRow: number): void {
    this.startRow = startRow;
  }

  /**
   * 끝 열 주소를 반환한다.
   *
   * @return 끝 열 주소
   */
  public getEndColumn(): number {
    return this.endColumn;
  }

  /**
   * 끝 열 주소를 설정한다.
   *
   * @param endColumn 끝 열 주소
   */
  public setEndColumn(endColumn: number): void {
    this.endColumn = endColumn;
  }

  /**
   * 끝 행 주소를 반환한다.
   *
   * @return 끝 행 주소
   */
  public getEndRow(): number {
    return this.endRow;
  }

  /**
   * 끝 행 주소를 설정한다.
   *
   * @param endRow 끝 행 주소
   */
  public setEndRow(endRow: number): void {
    this.endRow = endRow;
  }

  /**
   * 참조된 테두리/배경 Id를 반환한다.
   *
   * @return 참조된 테두리/배경 Id
   */
  public getBorderFillId(): number {
    return this.borderFillId;
  }

  /**
   * 참조된 테두리/배경 Id를 설정한다.
   *
   * @param borderFillId 참조된 테두리/배경 Id
   */
  public setBorderFillId(borderFillId: number): void {
    this.borderFillId = borderFillId;
  }

  public clone(): ZoneInfo {
    const cloned = new ZoneInfo();
    cloned.startColumn = this.startColumn;
    cloned.startRow = this.startRow;
    cloned.endColumn = this.endColumn;
    cloned.endRow = this.endRow;
    cloned.borderFillId = this.borderFillId;
    return cloned;
  }
}
