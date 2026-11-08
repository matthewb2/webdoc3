/**
 * 선 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentLine`.
 *
 * @author neolord
 */
export class ShapeComponentLine {
  /**
   * 시작점 x 좌표
   */
  private startX: number = 0;
  /**
   * 시작점 y 좌표
   */
  private startY: number = 0;
  /**
   * 끝점 x 좌표
   */
  private endX: number = 0;
  /**
   * 끝점 y 좌표
   */
  private endY: number = 0;
  /**
   * 선이 오른쪽이나 아래쪽 부터 시작되었는지 여부
   * <p>
   * 속성. 처음 생성 시 수직 또는 수평선일 때, 선의 방향이 언제나 오른쪽(위쪽)으로 잡힘으로 인한 현상 때문에, 방향을 바로
   * 잡아주기 위한 플래그.
   */
  private startedRightOrBottom: boolean = false;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 시작점 x 좌표를 반환한다.
   *
   * @return 시작점 x 좌표
   */
  public getStartX(): number {
    return this.startX;
  }

  /**
   * 시작점 x 좌표를 설정한다.
   *
   * @param startX 시작점 x 좌표
   */
  public setStartX(startX: number): void {
    this.startX = startX;
  }

  /**
   * 시작점 y 좌표를 반환한다.
   *
   * @return 시작점 y 좌표
   */
  public getStartY(): number {
    return this.startY;
  }

  /**
   * 시작점 y 좌표를 설정한다.
   *
   * @param startY 시작점 y 좌표
   */
  public setStartY(startY: number): void {
    this.startY = startY;
  }

  /**
   * 끝점 x 좌표를 반환한다.
   *
   * @return 끝점 x 좌표
   */
  public getEndX(): number {
    return this.endX;
  }

  /**
   * 끝점 x 좌표를 설정한다.
   *
   * @param endX 끝점 x 좌표
   */
  public setEndX(endX: number): void {
    this.endX = endX;
  }

  /**
   * 끝점 y 좌표를 반환한다.
   *
   * @return 끝점 y 좌표
   */
  public getEndY(): number {
    return this.endY;
  }

  /**
   * 끝점 y 좌표를 설정한다.
   *
   * @param endY 끝점 y 좌표
   */
  public setEndY(endY: number): void {
    this.endY = endY;
  }

  /**
   * 선이 오른쪽이나 아래쪽 부터 시작되었는지 여부를 반환한다.
   *
   * @return 선이 오른쪽이나 아래쪽 부터 시작되었는지 여부
   */
  public isStartedRightOrBottom(): boolean {
    return this.startedRightOrBottom;
  }

  /**
   * 선이 오른쪽이나 아래쪽 부터 시작되었는지 여부를 설정한다.
   *
   * @param startedRightOrBottom 선이 오른쪽이나 아래쪽 부터 시작되었는지 여부
   */
  public setStartedRightOrBottom(startedRightOrBottom: boolean): void {
    this.startedRightOrBottom = startedRightOrBottom;
  }

  public copy(from: ShapeComponentLine): void {
    this.startX = from.startX;
    this.startY = from.startY;
    this.endX = from.endX;
    this.endY = from.endY;
    this.startedRightOrBottom = from.startedRightOrBottom;
  }
}
