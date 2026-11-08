import type { ShapeComponent } from "../../../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponent.js";
import type { Matrix } from "../../../../../../../object/bodytext/control/gso/shapecomponent/renderingnfo/Matrix.js";
import type { RenderingInfo } from "../../../../../../../object/bodytext/control/gso/shapecomponent/renderingnfo/RenderingInfo.js";
import type { StreamWriter } from "../../../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 그리기 개체의 객체 공통 속성 레코드의 공통 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class CommonPart {
  /**
   * 그리기 개체의 객체 공통 속성 레코드의 공통 부분을 쓴다.
   *
   * @param sc 그리기 개체의 객체 공통 속성 레코드
   * @param sw 스트림 라이터
   */
  public static write(sc: ShapeComponent, sw: StreamWriter): void {
    sw.writeSInt4(sc.getOffsetX());
    sw.writeSInt4(sc.getOffsetY());
    sw.writeUInt2(sc.getGroupingCount());
    sw.writeUInt2(sc.getLocalFileVersion());
    sw.writeSInt4(sc.getWidthAtCreate());
    sw.writeSInt4(sc.getHeightAtCreate());
    sw.writeSInt4(sc.getWidthAtCurrent());
    sw.writeSInt4(sc.getHeightAtCurrent());
    sw.writeUInt4(sc.getProperty().getValue());
    sw.writeUInt2(sc.getRotateAngle());
    sw.writeSInt4(sc.getRotateXCenter());
    sw.writeSInt4(sc.getRotateYCenter());

    CommonPart.renderingInfo(sc.getRenderingInfo(), sw);
  }

  /**
   * Rendering 정보를 쓴다.
   *
   * @param ri Rendering 정보
   * @param sw 스트림 라이터
   */
  private static renderingInfo(ri: RenderingInfo, sw: StreamWriter): void {
    const scaleRotateMatrixCount = ri.getScaleRotateMatrixPairList().length;
    sw.writeUInt2(scaleRotateMatrixCount);
    CommonPart.matrix(ri.getTranslationMatrix(), sw);
    for (const srmp of ri.getScaleRotateMatrixPairList()) {
      CommonPart.matrix(srmp.getScaleMatrix(), sw);
      CommonPart.matrix(srmp.getRotateMatrix(), sw);
    }
  }

  /**
   * 행렬 객체를 쓴다.
   *
   * @param m  행렬 객체
   * @param sw 스트림 라이터
   */
  private static matrix(m: Matrix, sw: StreamWriter): void {
    for (let index = 0; index < 6; index++) {
      sw.writeDouble(m.getValue(index));
    }
  }

  /**
   * 그리기 개체의 객체 공통 속성 레코드의 공통 부분의 크기를 반환한다.
   *
   * @param sc 그리기 개체의 객체 공통 속성 레코드
   * @return 그리기 개체의 객체 공통 속성 레코드의 공통 부분의 크기
   */
  public static getSize(sc: ShapeComponent): number {
    let size = 0;
    size += 42;

    size += 2;
    size += 48;
    size +=
      48 * 2 * sc.getRenderingInfo().getScaleRotateMatrixPairList().length;
    return size;
  }
}
