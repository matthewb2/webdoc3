import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { ControlObjectLinkLine } from "../../../../../object/bodytext/control/gso/ControlObjectLinkLine.js";
import type { ShapeComponentLineForObjectLinkLine } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentLineForObjectLinkLine.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

export class ForControlObjectLinkLine {
  /**
   * 객체 연결선 컨트롤의 나머지 부분을 쓴다.
   *
   * @param oll 객체 연결선 컨트롤
   * @param sw  스트림 라이터
   */
  public static writeRest(
    oll: ControlObjectLinkLine,
    sw: StreamWriter,
  ): void {
    sw.upRecordLevel();

    ForControlObjectLinkLine.shapeComponentLine(oll.getShapeComponentLine(), sw);

    sw.downRecordLevel();
  }

  /**
   * 선 개체 속성 레코드를 쓴다.
   *
   * @param scl 선 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static shapeComponentLine(
    scl: ShapeComponentLineForObjectLinkLine,
    sw: StreamWriter,
  ): void {
    ForControlObjectLinkLine.recordHeader(sw, scl);

    sw.writeSInt4(scl.getStartX());
    sw.writeSInt4(scl.getStartY());
    sw.writeSInt4(scl.getEndX());
    sw.writeSInt4(scl.getEndY());
    sw.writeUInt4(scl.getType()!);
    sw.writeUInt4(scl.getStartSubjectID());
    sw.writeUInt4(scl.getStartSubjectIndex());
    sw.writeUInt4(scl.getEndSubjectID());
    sw.writeUInt4(scl.getEndSubjectIndex());

    sw.writeUInt4(scl.getControlPoints().length);
    for (const cp of scl.getControlPoints()) {
      sw.writeUInt4(cp.getX());
      sw.writeUInt4(cp.getY());
      sw.writeUInt2(cp.getType());
    }

    sw.writeZero(4);
  }

  /**
   * 선 개체 속성 레코드를 쓴다.
   *
   * @param scl 선 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static recordHeader(
    sw: StreamWriter,
    scl: ShapeComponentLineForObjectLinkLine,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT_LINE,
      ForControlObjectLinkLine.getSize(scl),
    );
  }

  /**
   * 선 개체 속성 레코드의 크기를 반환한다.
   *
   * @param scl 선 개체 속성 레코드
   * @return 선 개체 속성 레코드의 크기
   */
  private static getSize(scl: ShapeComponentLineForObjectLinkLine): number {
    return 40 + scl.getControlPoints().length * 10 + 4;
  }
}
