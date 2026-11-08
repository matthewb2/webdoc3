import type { FootEndNoteShape } from "../../../../../object/bodytext/control/sectiondefine/FootEndNoteShape.js";
import { BorderThickness } from "../../../../../object/docinfo/borderfill/BorderThickness.js";
import { BorderType } from "../../../../../object/docinfo/borderfill/BorderType.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 각주/미주 모양 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForFootEndNoteShape {
  /**
   * 각주/미주 모양 레코드를 읽는다.
   *
   * @param fens 각주/미주 모양 레코드
   * @param sr   스트림 리더
   */
  public static read(fens: FootEndNoteShape, sr: StreamReader): void {
    fens.getProperty().setValue(sr.readUInt4());
    fens.getUserSymbol().setBytes(sr.readWChar());
    fens.getBeforeDecorativeLetter().setBytes(sr.readWChar());
    fens.getAfterDecorativeLetter().setBytes(sr.readWChar());
    fens.setStartNumber(sr.readUInt2());
    fens.setDivideLineLength(sr.readUInt4());
    fens.setDivideLineTopMargin(sr.readUInt2());
    fens.setDivideLineBottomMargin(sr.readUInt2());
    fens.setBetweenNotesMargin(sr.readUInt2());
    fens.getDivideLine().setType(BorderType.valueOf(sr.readUInt1()));
    fens.getDivideLine().setThickness(BorderThickness.valueOf(sr.readUInt1()));
    fens.getDivideLine().getColor().setValue(sr.readUInt4());

    if (sr.isEndOfRecord()) return;

    fens.setUnknown(sr.readUInt4());
  }
}
