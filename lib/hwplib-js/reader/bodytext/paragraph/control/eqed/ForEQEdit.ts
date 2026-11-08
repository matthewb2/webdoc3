import type { EQEdit } from "../../../../../object/bodytext/control/equation/EQEdit.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 수식 정보 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForEQEdit {
  /**
   * 수식 정보 레코드를 읽는다.
   *
   * @param eqEdit 수식 정보 레코드
   * @param sr     스트림 리더
   */
  public static read(eqEdit: EQEdit, sr: StreamReader): void {
    eqEdit.setProperty(sr.readUInt4());
    eqEdit.getScript().setBytes(sr.readHWPString());
    eqEdit.setLetterSize(sr.readUInt4());
    eqEdit.getLetterColor().setValue(sr.readUInt4());

    if (sr.isEndOfRecord()) return;

    eqEdit.setBaseLine(sr.readSInt2());

    if (sr.isEndOfRecord()) return;

    eqEdit.setUnknown(sr.readUInt2());

    if (sr.isEndOfRecord()) return;

    eqEdit.getVersionInfo().setBytes(sr.readHWPString());

    if (sr.isEndOfRecord()) return;

    eqEdit.getFontName().setBytes(sr.readHWPString());
  }
}
