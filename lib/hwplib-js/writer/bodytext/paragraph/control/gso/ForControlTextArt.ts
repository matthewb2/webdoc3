import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { ControlTextArt } from "../../../../../object/bodytext/control/gso/ControlTextArt.js";
import type { ShapeComponentTextArt } from "../../../../../object/bodytext/control/gso/shapecomponenteach/ShapeComponentTextArt.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

export class ForControlTextArt {
  public static writeRest(textArt: ControlTextArt, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForControlTextArt.shapeComponentTextArt(
      textArt.getShapeComponentTextArt(),
      sw,
    );

    sw.downRecordLevel();
  }

  private static shapeComponentTextArt(
    scta: ShapeComponentTextArt,
    sw: StreamWriter,
  ): void {
    ForControlTextArt.recordHeader(scta, sw);
    sw.writeSInt4(scta.getX1());
    sw.writeSInt4(scta.getY1());
    sw.writeSInt4(scta.getX2());
    sw.writeSInt4(scta.getY2());
    sw.writeSInt4(scta.getX3());
    sw.writeSInt4(scta.getY3());
    sw.writeSInt4(scta.getX4());
    sw.writeSInt4(scta.getY4());
    sw.writeHWPString(scta.getContent());
    sw.writeHWPString(scta.getFontName());
    sw.writeHWPString(scta.getFontStyle());
    sw.writeSInt4(scta.getFontType()!);
    sw.writeSInt4(scta.getTextArtShape()!);
    sw.writeSInt4(scta.getLineSpace());
    sw.writeSInt4(scta.getCharSpace());
    sw.writeSInt4(scta.getParaAlignment()!);
    sw.writeSInt4(scta.getShadowType());
    sw.writeSInt4(scta.getShadowOffsetX());
    sw.writeSInt4(scta.getShadowOffsetY());
    sw.writeUInt4(scta.getShadowColor().getValue());
    sw.writeSInt4(scta.getOutlinePointList().length);
    for (const positionXY of scta.getOutlinePointList()) {
      sw.writeUInt4(positionXY.getX());
      sw.writeUInt4(positionXY.getY());
    }
  }

  private static recordHeader(
    scta: ShapeComponentTextArt,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(
      HWPTag.SHAPE_COMPONENT_TEXTART,
      ForControlTextArt.getSize(scta),
    );
  }

  private static getSize(scta: ShapeComponentTextArt): number {
    let size = 0;
    size += 32;
    size += scta.getContent().getWCharsSize();
    size += scta.getFontName().getWCharsSize();
    size += scta.getFontStyle().getWCharsSize();
    size += 40;
    size += scta.getOutlinePointList().length * 8;
    return size;
  }
}
