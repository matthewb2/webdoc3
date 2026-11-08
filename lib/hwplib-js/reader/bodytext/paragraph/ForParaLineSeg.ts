import type { LineSegItem } from "../../../object/bodytext/paragraph/lineseg/LineSegItem.js";
import type { ParaLineSeg } from "../../../object/bodytext/paragraph/lineseg/ParaLineSeg.js";
import type { Paragraph } from "../../../object/bodytext/paragraph/Paragraph.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";

/**
 * 문단의 레이아웃 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForParaLineSeg {
  /**
   * 문단의 레이아웃 레코드를 읽는다.
   *
   * @param p  문단 객체
   * @param sr 스트림 리더
   */
  public static read(p: Paragraph, sr: StreamReader): void {
    p.createLineSeg();
    const count = p.getHeader().getLineAlignCount();
    if (count !== 0) {
      const pls: ParaLineSeg = p.getLineSeg()!;
      for (let index = 0; index < count; index++) {
        ForParaLineSeg.paraLineSeqItem(pls.addNewLineSegItem(), sr);
      }
    } else {
      sr.nextRecord();
    }
  }

  /**
   * 한 라인의 레이아웃 정보를 읽는다.
   *
   * @param plsi 한 라인의 레이아웃 정보
   * @param sr   스트림 리더
   */
  private static paraLineSeqItem(plsi: LineSegItem, sr: StreamReader): void {
    plsi.setTextStartPosition(sr.readUInt4());
    plsi.setLineVerticalPosition(sr.readSInt4());
    plsi.setLineHeight(sr.readSInt4());
    plsi.setTextPartHeight(sr.readSInt4());
    plsi.setDistanceBaseLineToLineVerticalPosition(sr.readSInt4());
    plsi.setLineSpace(sr.readSInt4());
    plsi.setStartPositionFromColumn(sr.readSInt4());
    plsi.setSegmentWidth(sr.readSInt4());
    plsi.getTag().setValue(sr.readUInt4());
  }
}
