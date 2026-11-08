import { PositionXY } from "../../../../../object/bodytext/control/gso/shapecomponenteach/polygon/PositionXY.js";
import { TextArtAlign } from "../../../../../object/bodytext/control/gso/shapecomponenteach/textart/TextArtAlign.js";
import { TextArtShape } from "../../../../../object/bodytext/control/gso/shapecomponenteach/textart/TextArtShape.js";
import { FontType } from "../../../../../object/docinfo/facename/FontType.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { ControlTextArt } from "../../../../../object/bodytext/control/gso/ControlTextArt.js";
import type { ShapeComponentTextArt } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentTextArt.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

export class ForControlTextArt {
  public static readRest(textArt: ControlTextArt, sr: StreamReader): void {
    const rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.SHAPE_COMPONENT_TEXTART) {
      ForControlTextArt.shapeComponentTextArt(
        textArt.getShapeComponentTextArt(),
        sr,
      );
    }
  }

  private static shapeComponentTextArt(
    scta: ShapeComponentTextArt,
    sr: StreamReader,
  ): void {
    scta.setX1(sr.readSInt4());
    scta.setY1(sr.readSInt4());
    scta.setX2(sr.readSInt4());
    scta.setY2(sr.readSInt4());
    scta.setX3(sr.readSInt4());
    scta.setY3(sr.readSInt4());
    scta.setX4(sr.readSInt4());
    scta.setY4(sr.readSInt4());
    scta.getContent().setBytes(sr.readHWPString());
    scta.getFontName().setBytes(sr.readHWPString());
    scta.getFontStyle().setBytes(sr.readHWPString());
    scta.setFontType(FontType.valueOf(sr.readSInt4()));
    scta.setTextArtShape(TextArtShape.valueOf(sr.readSInt4()));
    scta.setLineSpace(sr.readSInt4());
    scta.setCharSpace(sr.readSInt4());
    scta.setParaAlignment(TextArtAlign.valueOf(sr.readSInt4()));
    scta.setShadowType(sr.readSInt4());
    scta.setShadowOffsetX(sr.readSInt4());
    scta.setShadowOffsetY(sr.readSInt4());
    scta.getShadowColor().setValue(sr.readUInt4());

    const outlinePointCount = sr.readSInt4();
    for (let index = 0; index < outlinePointCount; index++) {
      const positionXY = new PositionXY();
      positionXY.setX(sr.readSInt4());
      positionXY.setY(sr.readSInt4());

      scta.getOutlinePointList().push(positionXY);
    }
  }
}
