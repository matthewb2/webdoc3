import type { DocumentProperties } from "../../object/docinfo/DocumentProperties.js";
import type { CaretPosition } from "../../object/docinfo/documentproperties/CaretPosition.js";
import type { StartNumber } from "../../object/docinfo/documentproperties/StartNumber.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 문서 속성 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForDocumentPropeties {
  /**
   * 문서 속성 레코드를 읽는다.
   *
   * @param dp 문서 속성 레코드
   * @param sr 스트림 리더
   */
  public static read(dp: DocumentProperties, sr: StreamReader): void {
    ForDocumentPropeties.property(dp, sr);
    ForDocumentPropeties.startNumber(dp.getStartNumber(), sr);
    ForDocumentPropeties.caretPosition(dp.getCaretPosition(), sr);
  }

  /**
   * 속성 부분을 읽는다.
   *
   * @param dp 문서 속성 레코드
   * @param sr 스트림 리더
   */
  private static property(dp: DocumentProperties, sr: StreamReader): void {
    dp.setSectionCount(sr.readUInt2());
  }

  /**
   * 시작 번호 부분을 읽는다.
   *
   * @param sn 시작 번호 부분 객체
   * @param sr 스트림 리더
   */
  private static startNumber(sn: StartNumber, sr: StreamReader): void {
    sn.setPage(sr.readUInt2());
    sn.setFootnote(sr.readUInt2());
    sn.setEndnote(sr.readUInt2());
    sn.setPicture(sr.readUInt2());
    sn.setTable(sr.readUInt2());
    sn.setEquation(sr.readUInt2());
  }

  /**
   * 캐릿 위치 부분을 읽는다.
   *
   * @param cp 캐릿 위치 부분을 나태내는 객체
   * @param sr 스트림 리더
   */
  private static caretPosition(cp: CaretPosition, sr: StreamReader): void {
    cp.setListID(sr.readUInt4());
    cp.setParagraphID(sr.readUInt4());
    cp.setPositionInParagraph(sr.readUInt4());
  }
}
