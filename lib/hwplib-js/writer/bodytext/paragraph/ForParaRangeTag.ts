import type { ParaRangeTag } from "../../../object/bodytext/paragraph/rangetag/ParaRangeTag.js";
import type { RangeTagItem } from "../../../object/bodytext/paragraph/rangetag/RangeTagItem.js";
import { HWPTag } from "../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 문서의 영역 테그 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParaRangeTag {
  /**
   * 문서의 영역 테그 레코드를 쓴다.
   *
   * @param prt 문서의 영역 테그 레코드
   * @param sw  스트림 라이터
   */
  public static write(prt: ParaRangeTag | null, sw: StreamWriter): void {
    if (prt === null) {
      return;
    }

    ForParaRangeTag.recordHeader(prt, sw);

    for (const rti of prt.getRangeTagItemList()) {
      ForParaRangeTag.rangeTagItem(rti, sw);
    }
  }

  /**
   * 문서의 영역 테그 레코드의 레코드 헤더를 쓴다.
   *
   * @param prt 문서의 영역 테그 레코드
   * @param sw  스트림 라이터
   */
  private static recordHeader(prt: ParaRangeTag, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.PARA_RANGE_TAG, ForParaRangeTag.getSize(prt));
  }

  /**
   * 문서의 영역 테그 레코드의 크기를 반환한다.
   *
   * @param prt 문서의 영역 테그 레코드
   * @return 문서의 영역 테그 레코드의 크기
   */
  private static getSize(prt: ParaRangeTag): number {
    return prt.getRangeTagItemList().length * 12;
  }

  /**
   * 영역 태그 정보을 쓴다.
   *
   * @param rti 영역 태그 정보
   * @param sw  스트림 라이터
   */
  private static rangeTagItem(rti: RangeTagItem, sw: StreamWriter): void {
    sw.writeUInt4(rti.getRangeStart());
    sw.writeUInt4(rti.getRangeEnd());
    sw.writeBytes(rti.getData()!, 3);
    sw.writeUInt1(rti.getSort());
  }
}
