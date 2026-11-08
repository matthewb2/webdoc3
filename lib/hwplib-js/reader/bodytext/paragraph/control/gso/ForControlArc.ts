import { ArcType } from "../../../../../object/bodytext/control/gso/shapecomponenteach/arc/ArcType.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlArc } from "../../../../../object/bodytext/control/gso/ControlArc.js";
import type { ShapeComponentArc } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentArc.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 호 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlArc {
  /**
   * 호 컨트롤의 나머지 부분을 읽는다.
   *
   * @param arc 호 컨트롤
   * @param sr  스트림 리더
   */
  public static readRest(arc: ControlArc, sr: StreamReader): void {
    let rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      arc.createTextBox();
      ForTextBox.read(arc.getTextBox()!, sr);

      if (sr.isImmediatelyAfterReadingHeader() === false) {
        rh = sr.readRecordHeader();
      }
    }
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_ARC) {
      ForControlArc.shapeComponentArc(arc.getShapeComponentArc(), sr);
    }
  }

  /**
   * 호 개체 속성 레코드를 읽는다.
   *
   * @param sca 호 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentArc(
    sca: ShapeComponentArc,
    sr: StreamReader,
  ): void {
    sca.setArcType(ArcType.valueOf(sr.readUInt1()));
    sca.setCenterX(sr.readSInt4());
    sca.setCenterY(sr.readSInt4());
    sca.setAxis1X(sr.readSInt4());
    sca.setAxis1Y(sr.readSInt4());
    sca.setAxis2X(sr.readSInt4());
    sca.setAxis2Y(sr.readSInt4());
  }
}
