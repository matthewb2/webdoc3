import type { Style } from "../../object/docinfo/Style.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 스타일 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForStyle {
  /**
   * 스타일 레코드를 읽는다.
   *
   * @param s  스타일 레코드
   * @param sr 스트림 리더
   */
  public static read(s: Style, sr: StreamReader): void {
    s.setHangulName(sr.readUTF16LEString());
    s.setEnglishName(sr.readUTF16LEString());
    s.getProeprty().setValue(sr.readUInt1());
    s.setNextStyleId(sr.readUInt1());
    s.setLanguageId(sr.readSInt2());
    s.setParaShapeId(sr.correctParaShapeId(sr.readUInt2()));
    s.setCharShapeId(sr.readUInt2());
    ForStyle.unknown2Bytes(sr);
  }

  /**
   * 알려지지 않은 2 바이트를 처리한다.
   *
   * @param sr 스트림 리더
   */
  private static unknown2Bytes(sr: StreamReader): void {
    sr.skip(2);
  }
}
