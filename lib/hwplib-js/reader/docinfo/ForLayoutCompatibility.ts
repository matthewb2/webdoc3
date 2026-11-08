import type { LayoutCompatibility } from "../../object/docinfo/LayoutCompatibility.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 레이아웃 호환 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForLayoutCompatibility {
  /**
   * 호환 문서 레코드를 읽는다.
   *
   * @param lc 레이아웃 호환 레코드
   * @param sr 스트림 리더
   */
  public static read(lc: LayoutCompatibility, sr: StreamReader): void {
    lc.setLetterLevelFormat(sr.readUInt4());
    lc.setParagraphLevelFormat(sr.readUInt4());
    lc.setSectionLevelFormat(sr.readUInt4());
    lc.setObjectLevelFormat(sr.readUInt4());
    lc.setFieldLevelFormat(sr.readUInt4());
  }
}
