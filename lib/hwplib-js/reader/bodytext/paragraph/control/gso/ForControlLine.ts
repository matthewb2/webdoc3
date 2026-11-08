import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { ControlLine } from "../../../../../object/bodytext/control/gso/ControlLine.js";
import type { ShapeComponentLine } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentLine.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 선 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlLine {
  /**
   * 선 컨트롤의 나머지 부분을 읽는다.
   *
   * @param line 선 컨트롤
   * @param sr   스트림 리더
   */
  public static readRest(line: ControlLine, sr: StreamReader): void {
    const rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_LINE) {
      ForControlLine.shapeComponentLine(line.getShapeComponentLine(), sr);
    }
  }

  /**
   * 선 개체 속성 레코드를 읽는다.
   *
   * @param scl 선 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentLine(
    scl: ShapeComponentLine,
    sr: StreamReader,
  ): void {
    scl.setStartX(sr.readSInt4());
    scl.setStartY(sr.readSInt4());
    scl.setEndX(sr.readSInt4());
    scl.setEndY(sr.readSInt4());
    const temp = sr.readSInt4();
    if (temp === 1) {
      scl.setStartedRightOrBottom(true);
    }
  }
}
