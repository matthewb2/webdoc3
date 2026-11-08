import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForTextBox } from "./part/ForTextBox.js";
import type { ControlPolygon } from "../../../../../object/bodytext/control/gso/ControlPolygon.js";
import type { ShapeComponentPolygon } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentPolygon.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 다각형 컨트롤의 나머지 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlPolygon {
  /**
   * 다각형 컨트롤의 나머지 부분을 쓴다.
   *
   * @param poly 다각형 컨트롤
   * @param sw   스트림 라이터
   */
  public static writeRest(poly: ControlPolygon, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForTextBox.write(poly.getTextBox(), sw);
    ForControlPolygon.shapeComponentPolygon(
      poly.getShapeComponentPolygon(),
      sw,
    );

    sw.downRecordLevel();
  }

  /**
   * 다각형 개체 속성 레코드을 쓴다.
   *
   * @param scp 다각형 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static shapeComponentPolygon(
    scp: ShapeComponentPolygon,
    sw: StreamWriter,
  ): void {
    ForControlPolygon.recordHeader(scp, sw);

    sw.writeSInt4(scp.getPositionList().length);
    for (const p of scp.getPositionList()) {
      sw.writeSInt4(p.getX());
      sw.writeSInt4(p.getY());
    }
    sw.writeZero(4);
  }

  /**
   * 다각형 개체 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param scp 다각형 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static recordHeader(
    scp: ShapeComponentPolygon,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT_POLYGON,
      ForControlPolygon.getSize(scp),
    );
  }

  /**
   * 다각형 개체 속성 레코드의 크기를 반환한다.
   *
   * @param scp 다각형 개체 속성 레코드
   * @return 다각형 개체 속성 레코드의 크기
   */
  private static getSize(scp: ShapeComponentPolygon): number {
    let size = 0;
    size += 4;
    size += 8 * scp.getPositionList().length;
    size += 4;
    return size;
  }
}
