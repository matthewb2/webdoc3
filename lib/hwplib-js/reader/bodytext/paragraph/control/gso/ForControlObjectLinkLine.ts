import { LinkLineType } from "../../../../../object/bodytext/control/gso/shapecomponenteach/objectlinkline/LinkLineType.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { ControlObjectLinkLine } from "../../../../../object/bodytext/control/gso/ControlObjectLinkLine.js";
import type { ShapeComponentLineForObjectLinkLine } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentLineForObjectLinkLine.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 객체 연결선 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author 박성균
 */
export class ForControlObjectLinkLine {
  /**
   * 객체 연결선 컨트롤의 나머지 부분을 읽는다.
   *
   * @param objectLinkerLine 객체 연결선 컨트롤
   * @param sr               스트림 리더
   */
  public static readRest(
    objectLinkerLine: ControlObjectLinkLine,
    sr: StreamReader,
  ): void {
    const rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_LINE) {
      ForControlObjectLinkLine.shapeComponentLine(
        objectLinkerLine.getShapeComponentLine(),
        sr,
      );
    }
  }

  /**
   * 선 개체 속성 레코드를 읽는다.
   *
   * @param scl 선 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentLine(
    scl: ShapeComponentLineForObjectLinkLine,
    sr: StreamReader,
  ): void {
    scl.setStartX(sr.readSInt4());
    scl.setStartY(sr.readSInt4());
    scl.setEndX(sr.readSInt4());
    scl.setEndY(sr.readSInt4());

    scl.setType(LinkLineType.valueOf(sr.readUInt4()));
    scl.setStartSubjectID(sr.readUInt4());
    scl.setStartSubjectIndex(sr.readUInt4());
    scl.setEndSubjectID(sr.readUInt4());
    scl.setEndSubjectIndex(sr.readUInt4());

    const countOfCP = sr.readUInt4();
    for (let index = 0; index < countOfCP; index++) {
      const cp = scl.addNewControlPoint();
      cp.setX(sr.readUInt4());
      cp.setY(sr.readUInt4());
      cp.setType(sr.readUInt2());
    }

    if (sr.isEndOfRecord()) return;

    ForControlObjectLinkLine.unknownBytes(sr);
  }

  private static unknownBytes(sr: StreamReader): void {
    sr.skipToEndRecord();
  }
}
