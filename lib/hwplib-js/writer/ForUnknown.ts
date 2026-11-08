import type { UnknownRecord } from "../object/etc/UnknownRecord.js";
import type { StreamWriter } from "../util/compoundFile/writer/StreamWriter.js";

/**
 * 알수 없는 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForUnknown {
  /**
   * 알수 없는 레코드를 쓴다.
   *
   * @param ur    알수 없는 레코드
   * @param tagID 테그 아이디
   * @param sw    스트림 라이터
   */
  public static write(ur: UnknownRecord, tagID: number, sw: StreamWriter): void {
    sw.writeRecordHeader(tagID, ur.getBody()!.length);
    sw.writeBytes(ur.getBody()!);
  }
}
