import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlEllipse } from "../../../../../object/bodytext/control/gso/ControlEllipse.js";
import type { ShapeComponentEllipse } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentEllipse.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 타원 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlEllipse {
  /**
   * 타원 컨트롤의 나머지 부분을 읽는다.
   *
   * @param ellipse 타원 컨트롤
   * @param sr      스트림 리더
   */
  public static readRest(ellipse: ControlEllipse, sr: StreamReader): void {
    let rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      ellipse.createTextBox();
      ForTextBox.read(ellipse.getTextBox()!, sr);

      if (sr.isImmediatelyAfterReadingHeader() === false) {
        rh = sr.readRecordHeader();
      }
    }
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_ELLIPSE) {
      ForControlEllipse.shapeComponentEllipse(
        ellipse.getShapeComponentEllipse(),
        sr,
      );
    }
  }

  /**
   * 타원 개체 속성 레코드를 읽는다.
   *
   * @param sce 타원 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentEllipse(
    sce: ShapeComponentEllipse,
    sr: StreamReader,
  ): void {
    sce.getProperty().setValue(sr.readUInt4());
    sce.setCenterX(sr.readSInt4());
    sce.setCenterY(sr.readSInt4());
    sce.setAxis1X(sr.readSInt4());
    sce.setAxis1Y(sr.readSInt4());
    sce.setAxis2X(sr.readSInt4());
    sce.setAxis2Y(sr.readSInt4());
    sce.setStartX(sr.readSInt4());
    sce.setStartY(sr.readSInt4());
    sce.setEndX(sr.readSInt4());
    sce.setEndY(sr.readSInt4());
    sce.setStartX2(sr.readSInt4());
    sce.setStartY2(sr.readSInt4());
    sce.setEndX2(sr.readSInt4());
    sce.setEndY2(sr.readSInt4());
  }
}
