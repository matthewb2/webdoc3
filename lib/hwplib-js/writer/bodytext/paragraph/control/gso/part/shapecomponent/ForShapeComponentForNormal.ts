import { HWPTag } from "../../../../../../../object/etc/HWPTag.js";
import { ForFillInfo } from "../../../../../../docinfo/borderfill/ForFillInfo.js";
import { CommonPart } from "./CommonPart.js";
import type { ShapeComponentNormal } from "../../../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponentNormal.js";
import type { LineInfo } from "../../../../../../../object/bodytext/control/gso/shapecomponent/lineinfo/LineInfo.js";
import type { ShadowInfo } from "../../../../../../../object/bodytext/control/gso/shapecomponent/shadowinfo/ShadowInfo.js";
import type { FillInfo } from "../../../../../../../object/docinfo/borderfill/fillinfo/FillInfo.js";
import type { StreamWriter } from "../../../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 묶음 컨트롤이 아닌 일반 컨트롤의 객체 공통 속성 레코드을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForShapeComponentForNormal {
  /**
   * 일반 컨트롤의 객체 공통 속성 레코드을 쓴다.
   *
   * @param scn 일반 컨트롤의 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  public static write(scn: ShapeComponentNormal, sw: StreamWriter): void {
    ForShapeComponentForNormal.recordHeader(scn, sw);

    ForShapeComponentForNormal.gsoCtrlId(scn, sw);
    CommonPart.write(scn, sw);
    ForShapeComponentForNormal.lineInfo(scn.getLineInfo(), sw);
    ForShapeComponentForNormal.fillInfo(scn.getFillInfo(), sw);
    ForShapeComponentForNormal.shadowInfo(scn.getShadowInfo(), sw);
    ForShapeComponentForNormal.rest(scn, sw);
  }

  /**
   * 객체 공통 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param scn
   * @param sw
   */
  private static recordHeader(
    scn: ShapeComponentNormal,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT,
      ForShapeComponentForNormal.getSize(scn),
    );
  }

  /**
   * 객체 공통 속성 레코드의 크기를 반환한다.
   *
   * @param scn 객체 공통 속성 레코드
   * @return 객체 공통 속성 레코드의 크기
   */
  private static getSize(scn: ShapeComponentNormal): number {
    let size = 0;
    size += 8;
    size += CommonPart.getSize(scn);
    if (scn.getLineInfo() !== null) {
      size += 13;
    }
    if (scn.getFillInfo() !== null) {
      size += ForFillInfo.getSize(scn.getFillInfo()!);
    }
    if (scn.getShadowInfo() !== null) {
      size += 22;
    }

    return size;
  }

  /**
   * 그리기 객체 컨트롤 아이디를 쓴다.
   *
   * @param scn 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  private static gsoCtrlId(
    scn: ShapeComponentNormal,
    sw: StreamWriter,
  ): void {
    sw.writeUInt4(scn.getGsoId());
    sw.writeUInt4(scn.getGsoId());
  }

  /**
   * line 정보를 쓴다.
   *
   * @param li line 정보
   * @param sw 스트림 라이터
   */
  private static lineInfo(li: LineInfo | null, sw: StreamWriter): void {
    if (li !== null) {
      sw.writeUInt4(li.getColor().getValue());
      sw.writeSInt4(li.getThickness());
      sw.writeUInt4(li.getProperty().getValue());
      sw.writeUInt1(li.getOutlineStyle()!);
    }
  }

  /**
   * 배경 정보를 쓴다.
   *
   * @param fi 배경 정보
   * @param sw 스트림 라이터
   */
  private static fillInfo(fi: FillInfo | null, sw: StreamWriter): void {
    if (fi !== null) {
      ForFillInfo.write(fi, sw);
    }
  }

  /**
   * 그림자 정보를 쓴다.
   *
   * @param si 그림자 정보
   * @param sw 스트림 라이터
   */
  private static shadowInfo(si: ShadowInfo | null, sw: StreamWriter): void {
    if (si !== null) {
      sw.writeUInt4(si.getType()!);
      sw.writeUInt4(si.getColor().getValue());
      sw.writeSInt4(si.getOffsetX());
      sw.writeSInt4(si.getOffsetY());
    }
  }

  private static rest(scn: ShapeComponentNormal, sw: StreamWriter): void {
    if (scn.getShadowInfo() !== null) {
      sw.writeUInt4(scn.getInstid());
      sw.writeZero(1);
      sw.writeUInt1(scn.getShadowInfo()!.getTransparent());
    }
  }

  /**
   * 묶음 컨트톨에 포함되어 있는 일반 컨트롤의 객체 공통 속성 레코드을 쓴다.
   *
   * @param scn 묶음 컨트톨에 포함되어 있는 일반 컨트롤의 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  public static writeInContainer(
    scn: ShapeComponentNormal,
    sw: StreamWriter,
  ): void {
    ForShapeComponentForNormal.recordHeaderInContainer(scn, sw);

    ForShapeComponentForNormal.gsoCtrlIdInContainer(scn, sw);
    CommonPart.write(scn, sw);
    ForShapeComponentForNormal.lineInfo(scn.getLineInfo(), sw);
    ForShapeComponentForNormal.fillInfo(scn.getFillInfo(), sw);
    ForShapeComponentForNormal.shadowInfo(scn.getShadowInfo(), sw);
    ForShapeComponentForNormal.rest(scn, sw);
  }

  /**
   * 묶음 컨트톨에 포함되어 있는 일반 컨트롤의 객체 공통 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param scn 묶음 컨트톨에 포함되어 있는 일반 컨트롤의 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  private static recordHeaderInContainer(
    scn: ShapeComponentNormal,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT,
      ForShapeComponentForNormal.getSize(scn) - 4,
    );
  }

  /**
   * 묶음 컨트톨에 포함되어 있는 일반 컨트롤의 그리기 객체 컨트롤 아이디를 쓴다.
   *
   * @param scn 묶음 컨트톨에 포함되어 있는 일반 컨트롤의 객체 공통 속성 레코드
   * @param sw  스트림 라이터
   */
  private static gsoCtrlIdInContainer(
    scn: ShapeComponentNormal,
    sw: StreamWriter,
  ): void {
    sw.writeUInt4(scn.getGsoId());
  }
}
