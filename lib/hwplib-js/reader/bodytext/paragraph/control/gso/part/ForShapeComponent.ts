import { GsoControlType } from "../../../../../../object/bodytext/control/gso/GsoControlType.js";
import { OutlineStyle } from "../../../../../../object/bodytext/control/gso/shapecomponent/lineinfo/OutlineStyle.js";
import { ShadowType } from "../../../../../../object/bodytext/control/gso/shapecomponent/shadowinfo/ShadowType.js";
import { ForFillInfo } from "../../../../../docinfo/borderfill/ForFillInfo.js";
import type { GsoControl } from "../../../../../../object/bodytext/control/gso/GsoControl.js";
import type { ShapeComponent } from "../../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponent.js";
import type { ShapeComponentContainer } from "../../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponentContainer.js";
import type { ShapeComponentNormal } from "../../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponentNormal.js";
import type { Matrix } from "../../../../../../object/bodytext/control/gso/shapecomponent/renderingnfo/Matrix.js";
import type { RenderingInfo } from "../../../../../../object/bodytext/control/gso/shapecomponent/renderingnfo/RenderingInfo.js";
import type { StreamReader } from "../../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 그리기 개체의 객체 공통 속성 레코드을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForShapeComponent {
  /**
   * 그리기 개체의 객체 공통 속성 레코드를 읽는다.
   *
   * @param gsoControl 그리기 개체
   * @param sr         스트림 리더
   */
  public static read(gsoControl: GsoControl, sr: StreamReader): void {
    if (gsoControl.getGsoType() === GsoControlType.Container) {
      ForShapeComponent.shapeComponentForContainer(
        gsoControl.getShapeComponent() as ShapeComponentContainer,
        sr,
      );
    } else {
      ForShapeComponent.shapeComponentForNormal(
        gsoControl.getShapeComponent() as ShapeComponentNormal,
        sr,
      );
    }
  }

  /**
   * 일반 컨트롤을 위한 객체 공통 속성 레코드을 읽는다.
   *
   * @param scn 객체 공통 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentForNormal(
    scn: ShapeComponentNormal,
    sr: StreamReader,
  ): void {
    ForShapeComponent.commonPart(scn, sr);

    if (sr.isEndOfRecord()) return;

    ForShapeComponent.lineInfo(scn, sr);

    if (sr.isEndOfRecord()) return;

    ForShapeComponent.fillInfo(scn, sr);

    if (sr.isEndOfRecord()) return;

    ForShapeComponent.shadowInfo(scn, sr);

    if (sr.isEndOfRecord()) return;

    scn.setInstid(sr.readUInt4());
    sr.skip(1);
    scn.getShadowInfo()!.setTransparent(sr.readUInt1());
  }

  /**
   * 객체 공통 속성 레코드의 공통 부분을 읽는다.
   *
   * @param sc 객체 공통 속성 레코드
   * @param sr 스트림 리더
   */
  private static commonPart(sc: ShapeComponent, sr: StreamReader): void {
    sc.setOffsetX(sr.readSInt4());
    sc.setOffsetY(sr.readSInt4());
    sc.setGroupingCount(sr.readUInt2());
    sc.setLocalFileVersion(sr.readUInt2());
    sc.setWidthAtCreate(sr.readSInt4());
    sc.setHeightAtCreate(sr.readSInt4());
    sc.setWidthAtCurrent(sr.readSInt4());
    sc.setHeightAtCurrent(sr.readSInt4());
    sc.getProperty().setValue(sr.readUInt4());
    sc.setRotateAngle(sr.readUInt2());
    sc.setRotateXCenter(sr.readSInt4());
    sc.setRotateYCenter(sr.readSInt4());

    ForShapeComponent.renderingInfo(sc.getRenderingInfo(), sr);
  }

  /**
   * 객체 공통 속성 레코드의 rendering 정보를 읽는다.
   *
   * @param ri rendering 정보를 나타내는 객체
   * @param sr 스트림 리더
   */
  private static renderingInfo(ri: RenderingInfo, sr: StreamReader): void {
    const scaleRotateMatrixCount = sr.readUInt2();
    ForShapeComponent.matrix(ri.getTranslationMatrix(), sr);
    for (let index = 0; index < scaleRotateMatrixCount; index++) {
      const srmp = ri.addNewScaleRotateMatrixPair();
      ForShapeComponent.matrix(srmp.getScaleMatrix(), sr);
      ForShapeComponent.matrix(srmp.getRotateMatrix(), sr);
    }
  }

  /**
   * 변환 행렬을 읽는다.
   *
   * @param m  변환 행렬 객체
   * @param sr 스트림 리더
   */
  private static matrix(m: Matrix, sr: StreamReader): void {
    for (let index = 0; index < 6; index++) {
      m.setValue(index, sr.readDouble());
    }
  }

  /**
   * 일반 컨트롤을 위한 객체 공통 속성 레코드의 line 정보를 읽는다.
   *
   * @param scn 일반 컨트롤을 위한 객체 공통 속성 레코드의 line 정보를 나타내는 객체
   * @param sr  스트림 리더
   */
  private static lineInfo(scn: ShapeComponentNormal, sr: StreamReader): void {
    scn.createLineInfo();
    const li = scn.getLineInfo()!;
    li.getColor().setValue(sr.readUInt4());
    li.setThickness(sr.readSInt4());
    li.getProperty().setValue(sr.readUInt4());
    li.setOutlineStyle(OutlineStyle.valueOf(sr.readUInt1()));
  }

  /**
   * 일반 컨트롤을 위한 객체 공통 속성 레코드의 배경 정보를 읽는다.
   *
   * @param scn 일반 컨트롤을 위한 객체 공통 속성 레코드
   * @param sr  스트림 리더
   */
  private static fillInfo(scn: ShapeComponentNormal, sr: StreamReader): void {
    scn.createFillInfo();
    const fi = scn.getFillInfo()!;
    ForFillInfo.read(fi, sr);
  }

  /**
   * 일반 컨트롤을 위한 객체 공통 속성 레코드의 그림자 정보를 읽는다.
   *
   * @param scn 일반 컨트롤을 위한 객체 공통 속성 레코드
   * @param sr  스트림 리더
   */
  private static shadowInfo(scn: ShapeComponentNormal, sr: StreamReader): void {
    scn.createShadowInfo();
    const si = scn.getShadowInfo()!;
    si.setType(ShadowType.valueOf(sr.readUInt4()));
    si.getColor().setValue(sr.readUInt4());
    si.setOffsetX(sr.readSInt4());
    si.setOffsetY(sr.readSInt4());
  }

  /**
   * 묶음 컨트롤을 위한 객체 공통 속성 레코드를 읽는다.
   *
   * @param scc 객체 공통 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentForContainer(
    scc: ShapeComponentContainer,
    sr: StreamReader,
  ): void {
    ForShapeComponent.commonPart(scc, sr);
    ForShapeComponent.childInfo(scc, sr);

    if (sr.isEndOfRecord()) return;

    scc.setInstid(sr.readUInt4());
  }

  /**
   * 포함하고 있는 컨트롤에 대한 정보 부분을 읽는다.
   *
   * @param scc 묶음 컨트롤의 객체 공통 속성 레코드
   * @param sr  스트림 리더
   */
  private static childInfo(
    scc: ShapeComponentContainer,
    sr: StreamReader,
  ): void {
    const count = sr.readUInt2();
    for (let index = 0; index < count; index++) {
      const childId = sr.readUInt4();
      scc.addChildControlId(childId);
    }
  }
}
