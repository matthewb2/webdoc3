import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlCurve } from "../../../../../object/bodytext/control/gso/ControlCurve.js";
import type { ShapeComponentCurve } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentCurve.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 곡선 컨트롤의 나머지 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlCurve {
  /**
   * 곡선 컨트롤의 나머지 부분을 쓴다.
   *
   * @param curv 곡선 컨트롤
   * @param sw   스트림 라이터
   */
  public static writeRest(curv: ControlCurve, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForTextBox.write(curv.getTextBox(), sw);
    ForControlCurve.shapeComponentCurve(curv.getShapeComponentCurve(), sw);

    sw.downRecordLevel();
  }

  /**
   * 곡선 개체 속성 레코드을 쓴다.
   *
   * @param scc 곡선 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static shapeComponentCurve(
    scc: ShapeComponentCurve,
    sw: StreamWriter,
  ): void {
    ForControlCurve.recordHeader(scc, sw);

    const positionCount = scc.getPositionList().length;
    sw.writeSInt4(positionCount);
    for (const p of scc.getPositionList()) {
      sw.writeSInt4(p.getX());
      sw.writeSInt4(p.getY());
    }
    for (let index = 0; index < positionCount - 1; index++) {
      const cst = scc.getSegmentTypeList()[index]!;
      sw.writeUInt1(cst);
    }
    sw.writeZero(4);
  }

  /**
   * 곡선 개체 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param scc 곡선 개체 속성 레코드
   * @param sw  스트림 리더
   */
  private static recordHeader(
    scc: ShapeComponentCurve,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT_CURVE,
      ForControlCurve.getSize(scc),
    );
  }

  /**
   * 곡선 개체 속성 레코드의 크기를 반환한다.
   *
   * @param scc 곡선 개체 속성 레코드
   * @return 곡선 개체 속성 레코드의 크기
   */
  private static getSize(scc: ShapeComponentCurve): number {
    let size = 0;
    size += 4;
    size += scc.getPositionList().length * 8;
    size += scc.getPositionList().length - 1;
    size += 4;
    return size;
  }
}
