import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "../bookmark/ForCtrlData.js";
import { ForPictureEffect } from "./part/ForPictureEffect.js";
import { ForFillInfo } from "../../../../docinfo/borderfill/ForFillInfo.js";
import type { ControlPicture } from "../../../../../object/bodytext/control/gso/ControlPicture.js";
import type { ShapeComponentPicture } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentPicture.js";
import type { InnerMargin } from "../../../../../object/bodytext/control/gso/shapecomponenteach/picture/InnerMargin.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 그림 컨트롤의 나머지 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlPicture {
  /**
   * 그림 컨트롤의 나머지 부분을 쓴다.
   *
   * @param pic 그림 컨트롤
   * @param sw  스트림 라이터
   */
  public static writeRest(pic: ControlPicture, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForControlPicture.ctrlData(pic, sw);
    ForControlPicture.shapeComponentPicture(pic.getShapeComponentPicture(), sw);

    sw.downRecordLevel();
  }

  private static ctrlData(pic: ControlPicture, sw: StreamWriter): void {
    if (pic.getCtrlData() !== null) {
      ForCtrlData.write(pic.getCtrlData(), sw);
    }
  }

  /**
   * 그림 개체 속성 레코드를 쓴다.
   *
   * @param scp 그림 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static shapeComponentPicture(
    scp: ShapeComponentPicture,
    sw: StreamWriter,
  ): void {
    ForControlPicture.recordHeader(scp, sw);

    sw.writeUInt4(scp.getBorderColor().getValue());
    sw.writeSInt4(scp.getBorderThickness());
    sw.writeUInt4(scp.getBorderProperty().getValue());
    sw.writeSInt4(scp.getLeftTop().getX());
    sw.writeSInt4(scp.getLeftTop().getY());
    sw.writeSInt4(scp.getRightTop().getX());
    sw.writeSInt4(scp.getRightTop().getY());
    sw.writeSInt4(scp.getRightBottom().getX());
    sw.writeSInt4(scp.getRightBottom().getY());
    sw.writeSInt4(scp.getLeftBottom().getX());
    sw.writeSInt4(scp.getLeftBottom().getY());
    sw.writeSInt4(scp.getLeftAfterCutting());
    sw.writeSInt4(scp.getTopAfterCutting());
    sw.writeSInt4(scp.getRightAfterCutting());
    sw.writeSInt4(scp.getBottomAfterCutting());
    ForControlPicture.innerMargin(scp.getInnerMargin(), sw);
    ForFillInfo.pictureInfo(scp.getPictureInfo(), sw);
    sw.writeUInt1(scp.getBorderTransparency());
    sw.writeUInt4(scp.getInstanceId());
    ForPictureEffect.write(scp.getPictureEffect(), sw);
    sw.writeUInt4(scp.getImageWidth());
    sw.writeUInt4(scp.getImageHeight());
  }

  /**
   * 그림 개체 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param scp 그림 개체 속성 레코드
   * @param sw  스트림 라이터
   */
  private static recordHeader(
    scp: ShapeComponentPicture,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT_PICTURE,
      ForControlPicture.getSize(scp),
    );
  }

  /**
   * 그림 개체 속성 레코드의 크기를 반환한다.
   *
   * @param scp 그림 개체 속성 레코드
   * @return 그림 개체 속성 레코드의 크기
   */
  private static getSize(scp: ShapeComponentPicture): number {
    let size = 0;
    size += 60;
    size += 8; // inner margin;
    size += 5; // pictureInfo;
    size += 5;
    size += ForPictureEffect.getSize(scp.getPictureEffect());
    size += 8;
    return size;
  }

  /**
   * 내부 여백 부분을 쓴다.
   *
   * @param im 내부 여백을 나타내는 객체
   * @param sw 스트림 라이터
   */
  private static innerMargin(im: InnerMargin, sw: StreamWriter): void {
    sw.writeUInt2(im.getLeft());
    sw.writeUInt2(im.getRight());
    sw.writeUInt2(im.getTop());
    sw.writeUInt2(im.getBottom());
  }
}
