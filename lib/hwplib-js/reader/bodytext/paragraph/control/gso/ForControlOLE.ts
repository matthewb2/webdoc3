import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { ControlOLE } from "../../../../../object/bodytext/control/gso/ControlOLE.js";
import type { ShapeComponentOLE } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentOLE.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * OLE 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlOLE {
  /**
   * OLE 컨트롤의 나머지 부분을 읽는다.
   *
   * @param ole OLE 컨트롤
   * @param sr  스트림 리더
   */
  public static readRest(ole: ControlOLE, sr: StreamReader): void {
    const rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_OLE) {
      ForControlOLE.shapeComponentOLE(ole.getShapeComponentOLE(), sr);
    }
  }

  /**
   * OLE 개체 속성 레코드를 읽는다.
   *
   * @param sco OLE 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentOLE(
    sco: ShapeComponentOLE,
    sr: StreamReader,
  ): void {
    sco.getProperty().setValue(sr.readUInt4());
    sco.setExtentWidth(sr.readSInt4());
    sco.setExtentHeight(sr.readSInt4());
    sco.setBinDataId(sr.readUInt2());
    sco.getBorderColor().setValue(sr.readUInt4());
    sco.setBorderThickness(sr.readSInt4());
    sco.getBorderProperty().setValue(sr.readUInt4());
    ForControlOLE.unknownData(sco, sr);
  }

  /**
   * 알 수 없는 데이터 블럭을 읽는다.
   *
   * @param sco OLE 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static unknownData(sco: ShapeComponentOLE, sr: StreamReader): void {
    const unknownSize =
      sr.getCurrentRecordHeader().getSize() -
      sr.getCurrentPositionAfterHeader();
    if (unknownSize > 0) {
      const unknown = sr.readBytes(unknownSize);
      sco.setUnknown(unknown);
    }
  }
}
