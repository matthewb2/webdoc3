/**
 * 사각형 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentRectangle`.
 *
 * @author neolord
 */
export class ShapeComponentRectangle {
  /**
   * 모서리 둥근 비율
   */
  private roundRate: number = 0;
  /**
   * x1
   */
  private x1: number = 0;
  /**
   * y1
   */
  private y1: number = 0;
  /**
   * x2
   */
  private x2: number = 0;
  /**
   * y2
   */
  private y2: number = 0;
  /**
   * x3
   */
  private x3: number = 0;
  /**
   * y3
   */
  private y3: number = 0;
  /**
   * x4
   */
  private x4: number = 0;
  /**
   * y4
   */
  private y4: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 모서리 둗근 비율을 반환한다.
   *
   * @return 모서리 둗근 비율
   */
  public getRoundRate(): number {
    return this.roundRate;
  }

  /**
   * 모서리 둗근 비율을 설정한다.
   *
   * @param roundRate 모서리 둗근 비율
   */
  public setRoundRate(roundRate: number): void {
    this.roundRate = roundRate;
  }

  /**
   * x1 값을 반환한다.
   *
   * @return x1 값
   */
  public getX1(): number {
    return this.x1;
  }

  /**
   * x1 값을 설정한다.
   *
   * @param x1 x1 값
   */
  public setX1(x1: number): void {
    this.x1 = x1;
  }

  /**
   * y1 값을 반환한다.
   *
   * @return y1 값
   */
  public getY1(): number {
    return this.y1;
  }

  /**
   * y1 값을 설정한다.
   *
   * @param y1 y1 값
   */
  public setY1(y1: number): void {
    this.y1 = y1;
  }

  /**
   * x2 값을 반환한다.
   *
   * @return x2 값
   */
  public getX2(): number {
    return this.x2;
  }

  /**
   * x2 값을 설정한다.
   *
   * @param x2 x2 값
   */
  public setX2(x2: number): void {
    this.x2 = x2;
  }

  /**
   * y2 값을 반환한다.
   *
   * @return y2 값
   */
  public getY2(): number {
    return this.y2;
  }

  /**
   * y2 값을 설정한다.
   *
   * @param y2 y2 값
   */
  public setY2(y2: number): void {
    this.y2 = y2;
  }

  /**
   * x3 값을 반환한다.
   *
   * @return x3 값
   */
  public getX3(): number {
    return this.x3;
  }

  /**
   * x3 값을 설정한다.
   *
   * @param x3 x3 값
   */
  public setX3(x3: number): void {
    this.x3 = x3;
  }

  /**
   * y3 값을 반환한다.
   *
   * @return y3 값
   */
  public getY3(): number {
    return this.y3;
  }

  /**
   * y3 값을 설정한다.
   *
   * @param y3 y3 값
   */
  public setY3(y3: number): void {
    this.y3 = y3;
  }

  /**
   * x4 값을 반환한다.
   *
   * @return x4 값
   */
  public getX4(): number {
    return this.x4;
  }

  /**
   * x4 값을 설정한다.
   *
   * @param x4 x4 값
   */
  public setX4(x4: number): void {
    this.x4 = x4;
  }

  /**
   * y4 값을 반환한다.
   *
   * @return y4 값
   */
  public getY4(): number {
    return this.y4;
  }

  /**
   * y4 값을 설정한다.
   *
   * @param y4 y4 값
   */
  public setY4(y4: number): void {
    this.y4 = y4;
  }

  public copy(from: ShapeComponentRectangle): void {
    this.roundRate = from.roundRate;
    this.x1 = from.x1;
    this.y1 = from.y1;
    this.x2 = from.x2;
    this.y2 = from.y2;
    this.x3 = from.x3;
    this.y3 = from.y3;
    this.x4 = from.x4;
    this.y4 = from.y4;
  }
}
