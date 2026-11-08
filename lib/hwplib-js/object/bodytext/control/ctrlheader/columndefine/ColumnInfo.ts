/**
 * 하나의 단에 대한 정보를 나태내는 객체
 *
 * @author neolord
 */
export class ColumnInfo {
  /**
   * 다단의 폭
   */
  private width: number = 0;
  /**
   * 다음 단과의 간격
   */
  private gap: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 다단의 폭을 반환한다.
   *
   * @return 다단의 폭
   */
  public getWidth(): number {
    return this.width;
  }

  /**
   * 다단의 폭을 설정한다.
   *
   * @param width 다단의 폭
   */
  public setWidth(width: number): void {
    this.width = width;
  }

  /**
   * 다음 단과의 간격을 반환한다.
   *
   * @return 다음 단과의 간격
   */
  public getGap(): number {
    return this.gap;
  }

  /**
   * 다음 단과의 간격을 설정한다.
   *
   * @param gap 다음 단과의 간격
   */
  public setGap(gap: number): void {
    this.gap = gap;
  }

  public clone(): ColumnInfo {
    const cloned: ColumnInfo = new ColumnInfo();
    cloned.width = this.width;
    cloned.gap = this.gap;
    return cloned;
  }
}
