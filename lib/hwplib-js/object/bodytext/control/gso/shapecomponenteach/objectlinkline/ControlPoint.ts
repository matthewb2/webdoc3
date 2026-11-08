/**
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.objectlinkline.ControlPoint`.
 */
export class ControlPoint {
  private x: number = 0;
  private y: number = 0;
  private type: number = 0;

  public constructor() {}

  public getX(): number {
    return this.x;
  }

  public setX(x: number): void {
    this.x = x;
  }

  public getY(): number {
    return this.y;
  }

  public setY(y: number): void {
    this.y = y;
  }

  public getType(): number {
    return this.type;
  }

  public setType(type: number): void {
    this.type = type;
  }

  public copy(from: ControlPoint): void {
    this.x = from.x;
    this.y = from.y;
    this.type = from.type;
  }
}
