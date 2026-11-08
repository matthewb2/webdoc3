import type { LineSegItem } from "../../../object/bodytext/paragraph/lineseg/LineSegItem.js";
import type { ParaLineSeg } from "../../../object/bodytext/paragraph/lineseg/ParaLineSeg.js";
import { HWPTag } from "../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 문단의 레이아웃 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParaLineSeg {
  /**
   * 문단의 레이아웃 레코드를 쓴다.
   *
   * @param pls 문단의 레이아웃 레코드
   * @param sw  스트림 라이터
   */
  public static write(pls: ParaLineSeg | null, sw: StreamWriter): void {
    if (pls === null) {
      return;
    }

    ForParaLineSeg.recordHeader(pls, sw);

    for (const lsi of pls.getLineSegItemList()) {
      ForParaLineSeg.lineSegItem(lsi, sw);
    }
  }

  /**
   * 문단의 레이아웃 레코드의 레코드 헤더를 쓴다.
   *
   * @param pls 문단의 레이아웃 레코드
   * @param sw  스트림 라이터
   */
  private static recordHeader(pls: ParaLineSeg, sw: StreamWriter): void {
    const size = ForParaLineSeg.getSize(pls);
    sw.writeRecordHeader(HWPTag.PARA_LINE_SEG, size);
  }

  /**
   * 문단의 레이아웃 레코드의 크기를 반환한다.
   *
   * @param pls 문단의 레이아웃 레코드
   * @return 문단의 레이아웃 레코드의 크기
   */
  private static getSize(pls: ParaLineSeg): number {
    return pls.getLineSegItemList().length * 36;
  }

  /**
   * 한 라인의 레이아웃 정보를 쓴다.
   *
   * @param lsi 한 라인의 레이아웃 정보
   * @param sw  스트림 라이터
   */
  private static lineSegItem(lsi: LineSegItem, sw: StreamWriter): void {
    sw.writeUInt4(lsi.getTextStartPosition());
    sw.writeSInt4(lsi.getLineVerticalPosition());
    sw.writeSInt4(lsi.getLineHeight());
    sw.writeSInt4(lsi.getTextPartHeight());
    sw.writeSInt4(lsi.getDistanceBaseLineToLineVerticalPosition());
    sw.writeSInt4(lsi.getLineSpace());
    sw.writeSInt4(lsi.getStartPositionFromColumn());
    sw.writeSInt4(lsi.getSegmentWidth());
    sw.writeUInt4(lsi.getTag().getValue());
  }
}
