import type { Paragraph } from "../../../object/bodytext/paragraph/Paragraph.js";
import type { ParaRangeTag } from "../../../object/bodytext/paragraph/rangetag/ParaRangeTag.js";
import type { RangeTagItem } from "../../../object/bodytext/paragraph/rangetag/RangeTagItem.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";

/**
 * 문서의 영역 테그 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForParaRangeTag {
  /**
   * 문서의 영역 태그 레코드를 읽는다.
   *
   * @param p    문단 객체
   * @param sr   스트림 리더
   */
  public static read(p: Paragraph, sr: StreamReader): void {
    p.createRangeTag();

    if (sr.getCurrentRecordHeader().getSize() !== 0) {
      const prt: ParaRangeTag = p.getRangeTag()!;
      const count = Math.floor(sr.getCurrentRecordHeader().getSize() / 12);
      for (let index = 0; index < count; index++) {
        const rti: RangeTagItem = prt.addNewRangeTagItem();
        rti.setRangeStart(sr.readUInt4());
        rti.setRangeEnd(sr.readUInt4());
        ForParaRangeTag.tag(rti, sr);
      }
    } else {
      sr.nextRecord();
    }
  }

  /**
   * 영역 태그 아이템의 영역 부분을 읽는다.
   *
   * @param rti 영역 태그 아이템
   * @param sr  스트림 리더
   */
  private static tag(rti: RangeTagItem, sr: StreamReader): void {
    const data = sr.readBytes(3);
    rti.setData(data);
    rti.setSort(sr.readUInt1());
  }
}
