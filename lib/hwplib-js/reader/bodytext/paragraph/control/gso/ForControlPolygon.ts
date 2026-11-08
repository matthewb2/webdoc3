import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlPolygon } from "../../../../../object/bodytext/control/gso/ControlPolygon.js";
import type { ShapeComponentPolygon } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentPolygon.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 다각형 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlPolygon {
  /**
   * 다각형 컨트롤의 나머지 부분을 읽는다.
   *
   * @param polygon 다각형 컨트롤
   * @param sr      스트림 리더
   */
  public static readRest(polygon: ControlPolygon, sr: StreamReader): void {
    let rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      polygon.createTextBox();
      ForTextBox.read(polygon.getTextBox()!, sr);

      if (sr.isImmediatelyAfterReadingHeader() === false) {
        rh = sr.readRecordHeader();
      }
    }
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_POLYGON) {
      ForControlPolygon.shapeComponentPolygon(
        polygon.getShapeComponentPolygon(),
        sr,
      );
    }
  }

  /**
   * 다각형 개체 속성 레코드을 읽는다.
   *
   * @param scp 다각형 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentPolygon(
    scp: ShapeComponentPolygon,
    sr: StreamReader,
  ): void {
    const positionCount = sr.readSInt4();
    for (let index = 0; index < positionCount; index++) {
      const p = scp.addNewPosition();
      p.setX(sr.readSInt4());
      p.setY(sr.readSInt4());
    }
    sr.skip(4);
  }
}
