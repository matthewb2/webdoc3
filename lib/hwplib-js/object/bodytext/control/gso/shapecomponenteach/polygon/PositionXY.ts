/**
 * 좌표를 나태내는 객체
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.polygon.PositionXY`.
 *
 * @author neolord
 */
export class PositionXY {
  /**
   * x값
   */
  private x: number = 0;
  /**
   * y값
   */
  private y: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * x값을 반환한다.
   *
   * @return x값
   */
  public getX(): number {
    return this.x;
  }

  /**
   * x값을 설정한다.
   *
   * @param x x값
   */
  public setX(x: number): void {
    this.x = x;
  }

  /**
   * y값을 반환한다.
   *
   * @return y값
   */
  public getY(): number {
    return this.y;
  }

  /**
   * y값을 설정한다.
   *
   * @param y y값
   */
  public setY(y: number): void {
    this.y = y;
  }

  public clone(): PositionXY {
    const cloned = new PositionXY();
    cloned.copy(this);
    return cloned;
  }

  public copy(from: PositionXY): void {
    this.x = from.x;
    this.y = from.y;
  }
}
