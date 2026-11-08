import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { ControlOLE } from "../../../../../object/bodytext/control/gso/ControlOLE.js";
import type { ShapeComponentOLE } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentOLE.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * OLE 컨트롤의 나머지 부분을 쓰기 위한 객체
 *
 * @author 박성균
 */
export class ForControlOLE {
  /**
   * OLE 컨트롤의 나머지 부분를 쓴다.
   *
   * @param ole OLE 컨트롤
   * @param sw  스트림 라이터
   */
  public static writeRest(ole: ControlOLE, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForControlOLE.shapeComponentOLE(ole.getShapeComponentOLE(), sw);

    sw.downRecordLevel();
  }

  /**
   * OLE 개체 속성 레코드를 쓴다.
   *
   * @param sco OLE 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static shapeComponentOLE(
    sco: ShapeComponentOLE,
    sw: StreamWriter,
  ): void {
    ForControlOLE.recordHeader(sw, sco);

    sw.writeUInt4(sco.getProperty().getValue());
    sw.writeSInt4(sco.getExtentWidth());
    sw.writeSInt4(sco.getExtentHeight());
    sw.writeUInt2(sco.getBinDataId());
    sw.writeUInt4(sco.getBorderColor().getValue());
    sw.writeSInt4(sco.getBorderThickness());
    sw.writeUInt4(sco.getBorderProperty().getValue());
    if (sco.getUnknown() !== null) {
      sw.writeBytes(sco.getUnknown()!);
    }
  }

  /**
   * OLE 개체 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw  스트림 라이터
   * @param sco
   */
  private static recordHeader(sw: StreamWriter, sco: ShapeComponentOLE): void {
    sw.writeRecordHeader(HWPTag.SHAPE_COMPONENT_OLE, ForControlOLE.getSize(sco));
  }

  private static getSize(sco: ShapeComponentOLE): number {
    if (sco.getUnknown() !== null) {
      return 26 + sco.getUnknown()!.length;
    }
    return 26;
  }
}
