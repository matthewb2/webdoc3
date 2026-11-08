import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlArc } from "../../../../../object/bodytext/control/gso/ControlArc.js";
import type { ShapeComponentArc } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentArc.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 호 컨트롤의 나머지 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlArc {
  /**
   * 호 컨트톨의 나머지 부분를 쓴다.
   *
   * @param arc 호 컨트롤
   * @param sw
   */
  public static writeRest(arc: ControlArc, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForTextBox.write(arc.getTextBox(), sw);
    ForControlArc.shapeComponentArc(arc.getShapeComponentArc(), sw);

    sw.downRecordLevel();
  }

  /**
   * 호 개체 속성 레코드를 쓴다.
   *
   * @param sca 호 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static shapeComponentArc(
    sca: ShapeComponentArc,
    sw: StreamWriter,
  ): void {
    ForControlArc.recordHeader(sw);

    sw.writeUInt1(sca.getArcType()!);
    sw.writeSInt4(sca.getCenterX());
    sw.writeSInt4(sca.getCenterY());
    sw.writeSInt4(sca.getAxis1X());
    sw.writeSInt4(sca.getAxis1Y());
    sw.writeSInt4(sca.getAxis2X());
    sw.writeSInt4(sca.getAxis2Y());
  }

  /**
   * 호 개체 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.SHAPE_COMPONENT_ARC, 25);
  }
}
