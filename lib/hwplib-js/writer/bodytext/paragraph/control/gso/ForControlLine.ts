import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { ControlLine } from "../../../../../object/bodytext/control/gso/ControlLine.js";
import type { ShapeComponentLine } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentLine.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 선 컨트롤의 나머지 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlLine {
  /**
   * 선 컨트롤의 나머지 부분을 쓴다.
   *
   * @param line 선 컨트롤
   * @param sw   스트림 라이터
   */
  public static writeRest(line: ControlLine, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForControlLine.shapeComponentLine(line.getShapeComponentLine(), sw);

    sw.downRecordLevel();
  }

  /**
   * 선 개체 속성 레코드를 쓴다.
   *
   * @param scl 선 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static shapeComponentLine(
    scl: ShapeComponentLine,
    sw: StreamWriter,
  ): void {
    ForControlLine.recordHeader(sw);

    sw.writeSInt4(scl.getStartX());
    sw.writeSInt4(scl.getStartY());
    sw.writeSInt4(scl.getEndX());
    sw.writeSInt4(scl.getEndY());
    sw.writeSInt4(ForControlLine.getStartedRightOrBottom(scl));
  }

  /**
   * 선 개체 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.SHAPE_COMPONENT_LINE, 20);
  }

  /**
   * 오른쪽/아래쪽 시작인지 여부에 대한 값을 반환한다.
   *
   * @param scl 선 개체 속성 레코드
   * @return 오른쪽/아래쪽 시작인지 여부에 대한 값
   */
  private static getStartedRightOrBottom(scl: ShapeComponentLine): number {
    let temp = 0;
    if (scl.isStartedRightOrBottom()) {
      temp = 1;
    }
    return temp;
  }
}
