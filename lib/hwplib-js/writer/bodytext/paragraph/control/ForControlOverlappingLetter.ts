import type { ControlOverlappingLetter } from "../../../../object/bodytext/control/ControlOverlappingLetter.js";
import type { CtrlHeaderOverlappingLetter } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderOverlappingLetter.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 글자 겹침 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlOverlappingLetter {
  /**
   * 글자 겹침 컨트롤을 쓴다.
   *
   * @param ol 글자 겹침 컨트롤
   * @param sw 스트림 라이터
   */
  public static write(ol: ControlOverlappingLetter, sw: StreamWriter): void {
    ForControlOverlappingLetter.ctrlHeader(ol.getHeader(), sw);
  }

  /**
   * 글자 겹침 컨트롤의 컨트롤 헤더 레코드를 쓴다.
   *
   * @param h  글자 겹침 컨트롤의 컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static ctrlHeader(h: CtrlHeaderOverlappingLetter, sw: StreamWriter): void {
    ForControlOverlappingLetter.recordHeader(h, sw);
    sw.writeUInt4(h.getCtrlId());

    ForControlOverlappingLetter.overlappingLetters(h, sw);

    sw.writeUInt1(h.getBorderType());
    sw.writeSInt1(h.getInternalFontSize());
    sw.writeUInt1(h.getExpendInsideLetter());

    ForControlOverlappingLetter.charShapeIds(h, sw);
  }

  /**
   * 컨트롤 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(h: CtrlHeaderOverlappingLetter, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_HEADER, ForControlOverlappingLetter.getSize(h));
  }

  /**
   * 컨트롤 헤더 레코드의 크기를 반환한다.
   *
   * @param h 컨트롤 헤더 레코드
   * @return 컨트롤 헤더 레코드의 크기
   */
  private static getSize(h: CtrlHeaderOverlappingLetter): number {
    let size = 0;
    size += 4;

    size += 2;
    size += h.getOverlappingLetterList().length * 2;

    size += 3;

    size += 1;
    size += h.getCharShapeIdList().length * 4;

    return size;
  }

  /**
   * 겹침 글자 부분을 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static overlappingLetters(h: CtrlHeaderOverlappingLetter, sw: StreamWriter): void {
    sw.writeUInt2(h.getOverlappingLetterList().length);
    for (const letter of h.getOverlappingLetterList()) {
      sw.writeWChar(letter.getBytes());
    }
  }

  /**
   * 글자 모양 부분을 쓴다.
   *
   * @param h  컨트롤 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static charShapeIds(h: CtrlHeaderOverlappingLetter, sw: StreamWriter): void {
    sw.writeUInt1(h.getCharShapeIdList().length);
    for (const charShapeId of h.getCharShapeIdList()) {
      sw.writeUInt4(charShapeId);
    }
  }
}
