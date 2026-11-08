import { HWPTag } from "../../../../../../../object/etc/HWPTag.js";
import { CommonPart } from "./CommonPart.js";
import type { ShapeComponent } from "../../../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponent.js";
import type { ShapeComponentContainer } from "../../../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponentContainer.js";
import type { StreamWriter } from "../../../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 묶음 컨트롤의 객체 공통 속성 레코드을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForShapeComponentForContainer {
  /**
   * 묶음 컨트롤의 객체 공통 속성 레코드을 쓴다.
   *
   * @param scc 묶음 컨트롤의 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  public static write(scc: ShapeComponentContainer, sw: StreamWriter): void {
    ForShapeComponentForContainer.recordHeader(scc, sw);

    ForShapeComponentForContainer.gsoCtrlId(scc, sw);
    ForShapeComponentForContainer.commonPart(scc, sw);
    ForShapeComponentForContainer.childInfo(scc, sw);
    sw.writeUInt4(scc.getInstid());
  }

  /**
   * 객체 공통 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param scc 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  private static recordHeader(
    scc: ShapeComponentContainer,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT,
      ForShapeComponentForContainer.getSize(scc),
    );
  }

  /**
   * 객체 공통 속성 레코드의 크기를 반환한다.
   *
   * @param scc 객체 공통 속성 레코드
   * @return 객체 공통 속성 레코드의 크기
   */
  private static getSize(scc: ShapeComponentContainer): number {
    let size = 0;
    size += 8;
    size += CommonPart.getSize(scc);

    size += 2;
    size += 4 * scc.getChildControlIdList().length;

    size += 4;
    return size;
  }

  /**
   * 그리기 객체 컨트롤 아이디를 쓴다.
   *
   * @param scc 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  private static gsoCtrlId(
    scc: ShapeComponentContainer,
    sw: StreamWriter,
  ): void {
    sw.writeUInt4(scc.getGsoId());
    sw.writeUInt4(scc.getGsoId());
  }

  /**
   * 객체 공통 속성 레코드의 공통 부분을 쓴다.
   *
   * @param sc 객체 공통 속성 레코드
   * @param sw 스트림 라이터
   */
  private static commonPart(sc: ShapeComponent, sw: StreamWriter): void {
    CommonPart.write(sc, sw);
  }

  /**
   * 묶음 컨트톨이 포함하는 컨트롤들에 대한 정보를 쓴다.
   *
   * @param scc 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  private static childInfo(
    scc: ShapeComponentContainer,
    sw: StreamWriter,
  ): void {
    const count = scc.getChildControlIdList().length;
    sw.writeUInt2(count);

    for (const childId of scc.getChildControlIdList()) {
      sw.writeUInt4(childId);
    }
  }

  /**
   * 묶음 컨트톨에 포함되어 있는 묶음 컨트롤의 객체 공통 속성 레코드을 쓴다.
   *
   * @param scc 묶음 컨트톨에 포함되어 있는 묶음 컨트롤의 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  public static writeInContainer(
    scc: ShapeComponentContainer,
    sw: StreamWriter,
  ): void {
    ForShapeComponentForContainer.recordHeaderInContainer(scc, sw);

    ForShapeComponentForContainer.gsoCtrlIdInContainer(scc, sw);
    ForShapeComponentForContainer.commonPart(scc, sw);
    ForShapeComponentForContainer.childInfo(scc, sw);
    sw.writeZero(4);
  }

  /**
   * 묶음 컨트톨에 포함되어 있는 묶음 컨트롤의 객체 공통 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param scc 묶음 컨트톨에 포함되어 있는 묶음 컨트롤의 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  private static recordHeaderInContainer(
    scc: ShapeComponentContainer,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT,
      ForShapeComponentForContainer.getSize(scc) - 4,
    );
  }

  /**
   * 묶음 컨트톨에 포함되어 있는 묶음 컨트롤의 그리기 객체 컨트롤 아이디를 쓴다.
   *
   * @param scc 묶음 컨트톨에 포함되어 있는 묶음 컨트롤의 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  private static gsoCtrlIdInContainer(
    scc: ShapeComponentContainer,
    sw: StreamWriter,
  ): void {
    sw.writeUInt4(scc.getGsoId());
  }
}
