import type { ControlOverlappingLetter } from "../../../../object/bodytext/control/ControlOverlappingLetter.js";
import type { CtrlHeaderOverlappingLetter } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderOverlappingLetter.js";
import { HWPString } from "../../../../object/etc/HWPString.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 글자 겹침 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlOverlappingLetter {
  /**
   * 글자 겹침 컨트롤을 읽는다.
   *
   * @param tcps 글자 겹침 컨트롤
   * @param sr   스트림 리더
   */
  public static read(tcps: ControlOverlappingLetter, sr: StreamReader): void {
    ForControlOverlappingLetter.ctrlHeader(tcps.getHeader(), sr);
  }

  /**
   * 글자 겹침 컨트롤의 컨트롤 헤더 레코드을 읽는다.
   *
   * @param header 글자 겹침 컨트롤의 컨트롤 헤더 레코드
   * @param sr     스트림 리더
   */
  private static ctrlHeader(header: CtrlHeaderOverlappingLetter, sr: StreamReader): void {
    ForControlOverlappingLetter.overlappingLetters(header, sr);

    if (sr.isEndOfRecord()) return;

    header.setBorderType(sr.readUInt1());
    header.setInternalFontSize(sr.readSInt1());
    header.setExpendInsideLetter(sr.readUInt1());

    ForControlOverlappingLetter.charShapeIds(header, sr);
  }

  /**
   * 겹침 글자 부분을 읽는다.
   *
   * @param header 글자 겹침 컨트롤의 컨트롤 헤더 레코드
   * @param sr     스트림 리더
   */
  private static overlappingLetters(header: CtrlHeaderOverlappingLetter, sr: StreamReader): void {
    const count = sr.readUInt2();
    for (let index = 0; index < count; index++) {
      const letter = new HWPString();
      letter.setBytes(sr.readWChar());
      header.addOverlappingLetter(letter);
    }
  }

  /**
   * 글자 모양 부분을 읽는다.
   *
   * @param header 글자 겹침 컨트롤의 컨트롤 헤더 레코드
   * @param sr     스트림 리더
   */
  private static charShapeIds(header: CtrlHeaderOverlappingLetter, sr: StreamReader): void {
    const count = sr.readUInt1();
    for (let i = 0; i < count; i++) {
      const charShapeId = sr.readUInt4();
      header.addCharShapeId(charShapeId);
    }
  }
}
