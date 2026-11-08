import type { PageBorderFill } from "../../../../../object/bodytext/control/sectiondefine/PageBorderFill.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 쪽 테두리/배경 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForPageBorderFill {
  /**
   * 쪽 테두리/배경 레코드를 읽는다.
   *
   * @param pbf 쪽 테두리/배경 레코드
   * @param sr  스트림 리더
   */
  public static read(pbf: PageBorderFill, sr: StreamReader): void {
    pbf.getProperty().setValue(sr.readUInt4());
    pbf.setLeftGap(sr.readUInt2());
    pbf.setRightGap(sr.readUInt2());
    pbf.setTopGap(sr.readUInt2());
    pbf.setBottomGap(sr.readUInt2());
    pbf.setBorderFillId(sr.readUInt2());
  }
}
