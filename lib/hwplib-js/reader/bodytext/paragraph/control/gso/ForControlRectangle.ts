import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "../bookmark/ForCtrlData.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlRectangle } from "../../../../../object/bodytext/control/gso/ControlRectangle.js";
import type { ShapeComponentRectangle } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentRectangle.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 사각형 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlRectangle {
  /**
   * 사각형 컨트롤의 나머지 부분을 읽는다.
   *
   * @param rectangle 사각형 컨트롤
   * @param sr        스트림 리더
   */
  public static readRest(
    rectangle: ControlRectangle,
    sr: StreamReader,
  ): void {
    let rh;
    rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.CTRL_DATA) {
      rectangle.createCtrlData();
      ForCtrlData.read(rectangle.getCtrlData()!, sr);

      if (sr.isImmediatelyAfterReadingHeader() === false) {
        rh = sr.readRecordHeader();
      }
    }

    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      rectangle.createTextBox();
      ForTextBox.read(rectangle.getTextBox()!, sr);

      if (sr.isImmediatelyAfterReadingHeader() === false) {
        rh = sr.readRecordHeader();
      }
    }

    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_RECTANGLE) {
      ForControlRectangle.shapeComponentRectangle(
        rectangle.getShapeComponentRectangle(),
        sr,
      );
    }
  }

  /**
   * 사각형 개체 속성 레코드를 읽는다.
   *
   * @param scr 사각형 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentRectangle(
    scr: ShapeComponentRectangle,
    sr: StreamReader,
  ): void {
    scr.setRoundRate(sr.readSInt1());
    scr.setX1(sr.readSInt4());
    scr.setY1(sr.readSInt4());
    scr.setX2(sr.readSInt4());
    scr.setY2(sr.readSInt4());
    scr.setX3(sr.readSInt4());
    scr.setY3(sr.readSInt4());
    scr.setX4(sr.readSInt4());
    scr.setY4(sr.readSInt4());
  }
}
