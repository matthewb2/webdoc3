import { PositionXY } from "./polygon/PositionXY.js";

/**
 * 다각형 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentPolygon`.
 *
 * @author neolord
 */
export class ShapeComponentPolygon {
  /**
   * 좌표 리스트
   */
  private positionList: PositionXY[];

  /**
   * 생성자
   */
  public constructor() {
    this.positionList = [];
  }

  /**
   * 새로운 좌표 객체를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 좌표 객체
   */
  public addNewPosition(): PositionXY {
    const p = new PositionXY();
    this.positionList.push(p);
    return p;
  }

  /**
   * 좌표 리스트를 반환한다.
   *
   * @return 좌표 리스트
   */
  public getPositionList(): PositionXY[] {
    return this.positionList;
  }

  public copy(from: ShapeComponentPolygon): void {
    this.positionList.length = 0;
    for (const positionXY of from.positionList) {
      this.positionList.push(positionXY.clone());
    }
  }
}
