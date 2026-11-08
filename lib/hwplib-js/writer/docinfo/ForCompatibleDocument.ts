import type { CompatibleDocument } from "../../object/docinfo/CompatibleDocument.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 호환 문서 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForCompatibleDocument {
  /**
   * 호환 문서 레코드를 쓴다.
   *
   * @param cd 호환 문서 레코드
   * @param sw 스트림 라이터
   */
  public static write(cd: CompatibleDocument, sw: StreamWriter): void {
    ForCompatibleDocument.recordHeader(sw);

    sw.writeUInt4(cd.getTargetProgream()!);
  }

  /**
   * 호환 문서 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.COMPATIBLE_DOCUMENT, 4);
  }
}
