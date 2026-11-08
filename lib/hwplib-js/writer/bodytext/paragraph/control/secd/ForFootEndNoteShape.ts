import type { FootEndNoteShape } from "../../../../../object/bodytext/control/sectiondefine/FootEndNoteShape.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 각주/미주 모양 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForFootEndNoteShape {
  /**
   * 각주/미주 모양 레코드를 쓴다.
   *
   * @param fens 각주/미주 모양 레코드
   * @param sw   스트림 라이터
   */
  public static write(fens: FootEndNoteShape | null, sw: StreamWriter): void {
    if (fens === null) {
      return;
    }

    ForFootEndNoteShape.recordHeader(sw);

    sw.writeUInt4(fens.getProperty().getValue());
    sw.writeWChar(fens.getUserSymbol().getBytes());
    sw.writeWChar(fens.getBeforeDecorativeLetter().getBytes());
    sw.writeWChar(fens.getAfterDecorativeLetter().getBytes());
    sw.writeUInt2(fens.getStartNumber());
    sw.writeUInt4(fens.getDivideLineLength());
    sw.writeUInt2(fens.getDivideLineTopMargin());
    sw.writeUInt2(fens.getDivideLineBottomMargin());
    sw.writeUInt2(fens.getBetweenNotesMargin());
    sw.writeUInt1(fens.getDivideLine().getType()!);
    sw.writeUInt1(fens.getDivideLine().getThickness()!);
    sw.writeUInt4(fens.getDivideLine().getColor().getValue());
  }

  /**
   * 각주/미주 모양 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.FOOTNOTE_SHAPE, 28);
  }
}
