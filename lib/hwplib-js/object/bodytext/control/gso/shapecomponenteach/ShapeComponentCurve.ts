import type { CurveSegmentType } from "./curve/CurveSegmentType.js";
import { PositionXY } from "./polygon/PositionXY.js";

/**
 * 곡선 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentCurve`.
 *
 * @author neolord
 */
export class ShapeComponentCurve {
  /**
   * 좌표 리스트
   */
  private positionList: PositionXY[];
  /**
   * segment type 리스트
   */
  private segmentTypeList: CurveSegmentType[];

  /**
   * 생성자
   */
  public constructor() {
    this.positionList = [];
    this.segmentTypeList = [];
  }

  /**
   * 새로운 좌표 객체를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 좌료 객체
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

  /**
   * segment type을 리스트에 추가한다.
   *
   * @param cst segment type
   */
  public addCurveSegmentType(cst: CurveSegmentType): void {
    this.segmentTypeList.push(cst);
  }

  /**
   * segment type 리스트를 반환한다.
   *
   * @return segment type 리스트
   */
  public getSegmentTypeList(): CurveSegmentType[] {
    return this.segmentTypeList;
  }

  public copy(from: ShapeComponentCurve): void {
    this.positionList.length = 0;

    for (const positionXY of from.positionList) {
      this.positionList.push(positionXY.clone());
    }

    this.segmentTypeList.length = 0;
    for (const curveSegmentType of from.segmentTypeList) {
      this.segmentTypeList.push(curveSegmentType);
    }
  }
}
