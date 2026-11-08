import type { Style } from "../../object/docinfo/Style.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import { StringUtil } from "../../util/StringUtil.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 스타일 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForStyle {
  /**
   * 스타일 레코드를 쓴다.
   *
   * @param s  스타일 레코드
   * @param sw 스트림 라이터
   */
  public static write(s: Style, sw: StreamWriter): void {
    ForStyle.recordHeader(s, sw);

    sw.writeUTF16LEString(s.getHangulName());
    sw.writeUTF16LEString(s.getEnglishName());
    sw.writeUInt1(s.getProeprty().getValue());
    sw.writeUInt1(s.getNextStyleId());
    sw.writeUInt2(s.getLanguageId());
    sw.writeUInt2(sw.correctParaShapeId(s.getParaShapeId()));
    sw.writeUInt2(s.getCharShapeId());
    sw.writeZero(2);
  }

  /**
   * 스타일 레코드의 레코드 헤더를 쓴다.
   *
   * @param s  스타일 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(s: Style, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.STYLE, ForStyle.getSize(s));
  }

  /**
   * 스타일 레코드의 크기를 반환한다.
   *
   * @param s 스타일 레코드
   * @return 스타일 레코드의 크기
   */
  private static getSize(s: Style): number {
    let size = 0;
    size += StringUtil.getUTF16LEStringSize(s.getHangulName());
    size += StringUtil.getUTF16LEStringSize(s.getEnglishName());
    size += 8 + 2;
    return size;
  }
}
