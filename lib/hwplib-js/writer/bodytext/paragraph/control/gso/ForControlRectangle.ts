import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "../bookmark/ForCtrlData.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlRectangle } from "../../../../../object/bodytext/control/gso/ControlRectangle.js";
import type { ShapeComponentRectangle } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentRectangle.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 사각형 컨트롤의 나머지 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlRectangle {
  /**
   * 사각형 컨트롤의 나머지 부분을 쓴다.
   *
   * @param rect 사각형 컨트롤
   * @param sw   스트림 라이터
   */
  public static writeRest(rect: ControlRectangle, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForControlRectangle.ctrlData(rect, sw);
    ForTextBox.write(rect.getTextBox(), sw);
    ForControlRectangle.shapeComponentRectangle(
      rect.getShapeComponentRectangle(),
      sw,
    );

    sw.downRecordLevel();
  }

  /**
   * 컨트롤 데이터 레코드를 쓴다.
   *
   * @param rect 사각형 컨트롤
   * @param sw   스트림 라이터
   */
  private static ctrlData(rect: ControlRectangle, sw: StreamWriter): void {
    if (rect.getCtrlData() !== null) {
      ForCtrlData.write(rect.getCtrlData(), sw);
    }
  }

  /**
   * 사각형 개체 속성 레코드를 쓴다.
   *
   * @param scr 사각형 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static shapeComponentRectangle(
    scr: ShapeComponentRectangle,
    sw: StreamWriter,
  ): void {
    ForControlRectangle.recordHeader(sw);

    sw.writeSInt1(scr.getRoundRate());
    sw.writeSInt4(scr.getX1());
    sw.writeSInt4(scr.getY1());
    sw.writeSInt4(scr.getX2());
    sw.writeSInt4(scr.getY2());
    sw.writeSInt4(scr.getX3());
    sw.writeSInt4(scr.getY3());
    sw.writeSInt4(scr.getX4());
    sw.writeSInt4(scr.getY4());
  }

  /**
   * 사각형 개체 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.SHAPE_COMPONENT_RECTANGLE, 33);
  }
}
