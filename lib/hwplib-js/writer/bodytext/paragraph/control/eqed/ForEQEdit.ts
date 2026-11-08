import type { EQEdit } from "../../../../../object/bodytext/control/equation/EQEdit.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 수식 정보 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForEQEdit {
  /**
   * 수식 정보 레코드를 쓴다.
   *
   * @param ee 수식 정보 레코드
   * @param sw 스트림 라이터
   */
  public static write(ee: EQEdit, sw: StreamWriter): void {
    ForEQEdit.recordHeader(ee, sw);

    sw.writeUInt4(ee.getProperty());
    sw.writeHWPString(ee.getScript());
    sw.writeUInt4(ee.getLetterSize());
    sw.writeUInt4(ee.getLetterColor().getValue());
    sw.writeSInt2(ee.getBaseLine());
    sw.writeUInt2(ee.getUnknown());
    sw.writeHWPString(ee.getVersionInfo());
    sw.writeHWPString(ee.getFontName());
  }

  /**
   * 수식 정보 레코드의 레코드 헤더를 쓴다.
   *
   * @param ee 수식 정보 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(ee: EQEdit, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.EQEDIT, ForEQEdit.getSize(ee));
  }

  /**
   * 수식 정보 레코드의 크기를 반환한다.
   *
   * @param ee 수식 정보 레코드
   * @return 수식 정보 레코드의 크기
   */
  private static getSize(ee: EQEdit): number {
    let size = 0;
    size += 4;
    size += ee.getScript().getWCharsSize();
    size += 12;
    size += ee.getVersionInfo().getWCharsSize();
    size += ee.getFontName().getWCharsSize();
    return size;
  }
}
