import type { DocumentProperties } from "../../object/docinfo/DocumentProperties.js";
import type { CaretPosition } from "../../object/docinfo/documentproperties/CaretPosition.js";
import type { StartNumber } from "../../object/docinfo/documentproperties/StartNumber.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 문서 속성 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForDocumentProperties {
  /**
   * 문서 속성 레코드를 쓴다.
   *
   * @param dp 문서 속성 레코드
   * @param sw 스트림 라이터
   */
  public static write(dp: DocumentProperties, sw: StreamWriter): void {
    ForDocumentProperties.recordHeader(sw);

    sw.writeUInt2(dp.getSectionCount());
    ForDocumentProperties.startNumber(dp.getStartNumber(), sw);
    ForDocumentProperties.caretPosition(dp.getCaretPosition(), sw);
  }

  /**
   * 문서 속성 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.DOCUMENT_PROPERTIES, 26);
  }

  /**
   * 시작 번호 부분을 쓴다.
   *
   * @param sn 시작 번호 객체
   * @param sw 스트림 라이터
   */
  private static startNumber(sn: StartNumber, sw: StreamWriter): void {
    sw.writeUInt2(sn.getPage());
    sw.writeUInt2(sn.getFootnote());
    sw.writeUInt2(sn.getEndnote());
    sw.writeUInt2(sn.getPicture());
    sw.writeUInt2(sn.getTable());
    sw.writeUInt2(sn.getEquation());
  }

  /**
   * 캐릿 위치 부분을 쓴다.
   *
   * @param cp 캐릿 위치 객체
   * @param sw 스트림 라이터
   */
  private static caretPosition(cp: CaretPosition, sw: StreamWriter): void {
    sw.writeUInt4(cp.getListID());
    sw.writeUInt4(cp.getParagraphID());
    sw.writeUInt4(cp.getPositionInParagraph());
  }
}
