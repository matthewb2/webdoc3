import type { ParaShape } from "../../object/docinfo/ParaShape.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 문단 모양 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForParaShape {
  /**
   * 문단 모양 레코드를 읽는다.
   *
   * @param ps 문단 모양 레코드
   * @param sr 스트림 리더
   */
  public static read(ps: ParaShape, sr: StreamReader): void {
    ps.getProperty1().setValue(sr.readUInt4());
    ps.setLeftMargin(sr.readSInt4());
    ps.setRightMargin(sr.readSInt4());
    ps.setIndent(sr.readSInt4());
    ps.setTopParaSpace(sr.readSInt4());
    ps.setBottomParaSpace(sr.readSInt4());
    ps.setLineSpace(sr.readSInt4());
    ps.setTabDefId(sr.readUInt2());
    ps.setParaHeadId(sr.readUInt2());
    ps.setBorderFillId(sr.readUInt2());
    ps.setLeftBorderSpace(sr.readSInt2());
    ps.setRightBorderSpace(sr.readSInt2());
    ps.setTopBorderSpace(sr.readSInt2());
    ps.setBottomBorderSpace(sr.readSInt2());

    if (sr.isEndOfRecord() === false && sr.getFileVersion()!.isOver(5, 0, 1, 7)) {
      ps.getProperty2().setValue(sr.readUInt4());
    }

    if (sr.isEndOfRecord() === false && sr.getFileVersion()!.isOver(5, 0, 2, 5)) {
      ps.getProperty3().setValue(sr.readUInt4());
      ps.setLineSpace2(sr.readUInt4());
    }

    if (sr.isEndOfRecord()) return;

    ps.setParaLevel(sr.readUInt4());
  }
}
