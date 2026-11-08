import type { UnknownRecord } from "../object/etc/UnknownRecord.js";
import type { StreamReader } from "../util/compoundFile/reader/StreamReader.js";

/**
 * 알수 없는 레코드를 읽기 위한 객체
 *
 * @author 박성균
 */
export class ForUnknown {
  /**
   * 알수 없는 레코드를 읽는다.
   *
   * @param unknown 알 수 없는 레코드
   * @param sr      스트림 리더
   */
  public static read(unknown: UnknownRecord, sr: StreamReader): void {
    const body = sr.readBytes(unknown.getHeader()!.getSize());
    unknown.setBody(body);
  }
}
