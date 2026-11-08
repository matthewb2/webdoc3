import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "../bookmark/ForCtrlData.js";
import { ForPictureEffect } from "./part/ForPictureEffect.js";
import { ForFillInfo } from "../../../../docinfo/borderfill/ForFillInfo.js";
import type { ControlPicture } from "../../../../../object/bodytext/control/gso/ControlPicture.js";
import type { ShapeComponentPicture } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentPicture.js";
import type { InnerMargin } from "../../../../../object/bodytext/control/gso/shapecomponenteach/picture/InnerMargin.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 그림 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlPicture {
  /**
   * 그림 컨트롤의 나머지 부분을 읽는다.
   *
   * @param picture 그림 컨트롤
   * @param sr      스트림 리더
   */
  public static readRest(picture: ControlPicture, sr: StreamReader): void {
    let rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.CTRL_DATA) {
      picture.createCtrlData();
      ForCtrlData.read(picture.getCtrlData()!, sr);

      if (sr.isImmediatelyAfterReadingHeader() === false) {
        rh = sr.readRecordHeader();
      }
    }
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_PICTURE) {
      ForControlPicture.shapeComponentPicture(
        picture.getShapeComponentPicture(),
        sr,
      );
    }
  }

  /**
   * 그림 개체 속성 레코드를 읽는다.
   *
   * @param scp 그림 개체 속성 레코드
   * @param sr  스트림 리더
   */
  private static shapeComponentPicture(
    scp: ShapeComponentPicture,
    sr: StreamReader,
  ): void {
    scp.getBorderColor().setValue(sr.readUInt4());
    scp.setBorderThickness(sr.readSInt4());
    scp.getBorderProperty().setValue(sr.readUInt4());
    scp.getLeftTop().setX(sr.readSInt4());
    scp.getLeftTop().setY(sr.readSInt4());
    scp.getRightTop().setX(sr.readSInt4());
    scp.getRightTop().setY(sr.readSInt4());
    scp.getRightBottom().setX(sr.readSInt4());
    scp.getRightBottom().setY(sr.readSInt4());
    scp.getLeftBottom().setX(sr.readSInt4());
    scp.getLeftBottom().setY(sr.readSInt4());
    scp.setLeftAfterCutting(sr.readSInt4());
    scp.setTopAfterCutting(sr.readSInt4());
    scp.setRightAfterCutting(sr.readSInt4());
    scp.setBottomAfterCutting(sr.readSInt4());
    ForControlPicture.innerMargin(scp.getInnerMargin(), sr);
    ForFillInfo.pictureInfo(scp.getPictureInfo(), sr);

    if (sr.isEndOfRecord()) return;

    scp.setBorderTransparency(sr.readUInt1());

    if (sr.isEndOfRecord()) return;

    scp.setInstanceId(sr.readUInt4());

    if (sr.isEndOfRecord()) return;

    ForPictureEffect.read(scp.getPictureEffect(), sr);

    if (sr.isEndOfRecord()) return;

    scp.setImageWidth(sr.readUInt4());
    scp.setImageHeight(sr.readUInt4());

    if (sr.isEndOfRecord()) return;

    ForControlPicture.unknownBytes(sr);
  }

  private static unknownBytes(sr: StreamReader): void {
    sr.skipToEndRecord();
  }

  /**
   * 그림 개체 속성 레코드의 내부 여백 부분을 읽는다.
   *
   * @param im 내부 여백을 나타내는 객체
   * @param sr 스트림 리더
   */
  private static innerMargin(im: InnerMargin, sr: StreamReader): void {
    im.setLeft(sr.readUInt2());
    im.setRight(sr.readUInt2());
    im.setTop(sr.readUInt2());
    im.setBottom(sr.readUInt2());
  }
}
