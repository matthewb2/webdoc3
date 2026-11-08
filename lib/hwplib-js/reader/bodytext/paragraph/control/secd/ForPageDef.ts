import type { PageDef } from "../../../../../object/bodytext/control/sectiondefine/PageDef.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 용지 설정 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForPageDef {
  /**
   * 용지 설정 레코드를 읽는다.
   *
   * @param pd 용지 설정 레코드
   * @param sr 스트림 리더
   */
  public static read(pd: PageDef, sr: StreamReader): void {
    pd.setPaperWidth(sr.readUInt4());
    pd.setPaperHeight(sr.readUInt4());
    pd.setLeftMargin(sr.readUInt4());
    pd.setRightMargin(sr.readUInt4());
    pd.setTopMargin(sr.readUInt4());
    pd.setBottomMargin(sr.readUInt4());
    pd.setHeaderMargin(sr.readUInt4());
    pd.setFooterMargin(sr.readUInt4());
    pd.setGutterMargin(sr.readUInt4());
    pd.getProperty().setValue(sr.readUInt4());
  }
}
