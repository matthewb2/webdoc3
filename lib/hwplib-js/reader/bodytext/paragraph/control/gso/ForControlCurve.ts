import { CurveSegmentType } from "../../../../../object/bodytext/control/gso/shapecomponenteach/curve/CurveSegmentType.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlCurve } from "../../../../../object/bodytext/control/gso/ControlCurve.js";
import type { ShapeComponentCurve } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentCurve.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 곡선 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlCurve {
  /**
   * 곡선 컨트롤의 나머지 부분을 읽는다.
   *
   * @param curve 곡선 컨트롤
   * @param sr    스트림 리더
   */
  public static readRest(curve: ControlCurve, sr: StreamReader): void {
    let rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      curve.createTextBox();
      ForTextBox.read(curve.getTextBox()!, sr);

      if (sr.isImmediatelyAfterReadingHeader() === false) {
        rh = sr.readRecordHeader();
      }
    }
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_CURVE) {
      ForControlCurve.shapeComponentCurve(curve.getShapeComponentCurve(), sr);
    }
  }

  /**
   * 곡선 개체 속성 레코드를 읽는다.
   *
   * @param scc 곡선 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentCurve(
    scc: ShapeComponentCurve,
    sr: StreamReader,
  ): void {
    const positionCount = sr.readSInt4();
    for (let index = 0; index < positionCount; index++) {
      const p = scc.addNewPosition();
      p.setX(sr.readSInt4());
      p.setY(sr.readSInt4());
    }
    for (let index = 0; index < positionCount - 1; index++) {
      const cst = CurveSegmentType.valueOf(sr.readUInt1());
      scc.addCurveSegmentType(cst);
    }
    sr.skip(4);
  }
}
