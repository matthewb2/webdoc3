import type { CompatibleDocument } from "../../object/docinfo/CompatibleDocument.js";
import { CompatibleDocumentSort } from "../../object/docinfo/compatibledocument/CompatibleDocumentSort.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 호환 문서 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForCompatibleDocument {
  /**
   * 호환 문서 정보를 읽는다.
   *
   * @param cd 호환 문서 레코드
   * @param sr 스트림 리더
   */
  public static read(cd: CompatibleDocument, sr: StreamReader): void {
    cd.setTargetProgream(CompatibleDocumentSort.valueOf(sr.readUInt4()));
  }
}
