import type { FaceName } from "../../object/docinfo/FaceName.js";
import { FontType } from "../../object/docinfo/facename/FontType.js";
import type { FontTypeInfo } from "../../object/docinfo/facename/FontTypeInfo.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 글꼴 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForFaceName {
  /**
   * 글꼴 레코드를 읽는다.
   *
   * @param fn 글꼴 레코드
   * @param sr 스트림 리더
   */
  public static read(fn: FaceName, sr: StreamReader): void {
    fn.getProperty().setValue(sr.readUInt1());
    fn.setName(sr.readUTF16LEString());

    if (fn.getProperty().hasSubstituteFont()) {
      ForFaceName.substituteFontInfo(fn, sr);
    }

    if (fn.getProperty().hasFontInfo()) {
      ForFaceName.fontTypeInfo(fn.getFontTypeInfo(), sr);
    }

    if (fn.getProperty().hasBaseFont()) {
      fn.setBaseFontName(sr.readUTF16LEString());
    }
  }

  /**
   * 대체 글꼴 정보 부분을 읽는다.
   *
   * @param fn 대체 글꼴 정보 부분을 나타내는 객체
   * @param sr 스트림 리더
   */
  private static substituteFontInfo(fn: FaceName, sr: StreamReader): void {
    const substituteFontType = FontType.valueOf(sr.readUInt1());
    fn.setSubstituteFontType(substituteFontType);
    fn.setSubstituteFontName(sr.readUTF16LEString());
  }

  /**
   * 글꼴 유형 정보 부분을 읽는다.
   *
   * @param fti 글꼴 유형 정보 부분을 나타내는 객체
   * @param sr  스트림 리더
   */
  private static fontTypeInfo(fti: FontTypeInfo, sr: StreamReader): void {
    fti.setFontType(sr.readUInt1());
    fti.setSerifType(sr.readUInt1());
    fti.setThickness(sr.readUInt1());
    fti.setRatio(sr.readUInt1());
    fti.setContrast(sr.readUInt1());
    fti.setStrokeDeviation(sr.readUInt1());
    fti.setCharacterStrokeType(sr.readUInt1());
    fti.setCharacterShape(sr.readUInt1());
    fti.setMiddleLine(sr.readUInt1());
    fti.setxHeight(sr.readUInt1());
  }
}
