import type { TabDef } from "../../object/docinfo/TabDef.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 텝 정의 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForTabDef {
  /**
   * 탭 정의 레코드를 쓴다.
   *
   * @param td 탭 정의 레코드
   * @param sw 스트림 라이터
   */
  public static write(td: TabDef, sw: StreamWriter): void {
    ForTabDef.recordHeader(td, sw);

    sw.writeUInt4(td.getProperty().getValue());

    const tabInfoCount = td.getTabInfoList().length;
    sw.writeUInt4(tabInfoCount);
    if (tabInfoCount > 0) {
      ForTabDef.tabInfos(td, sw);
    }
  }

  /**
   * 탭 정의 레코드의 레코드 헤더를 쓴다.
   *
   * @param td 탭 정의 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(td: TabDef, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.TAB_DEF, ForTabDef.getSize(td));
  }

  /**
   * 탭 정의 레코드의 크기를 반환한다.
   *
   * @param td 탭 정의 레코드
   * @return 탭 정의 레코드의 크기
   */
  private static getSize(td: TabDef): number {
    let size = 0;
    size += 8;
    size += 8 * td.getTabInfoList().length;
    return size;
  }

  /**
   * 탭 정보 부분을 쓴다.
   *
   * @param td 탭 정의 레코드
   * @param sw 스트림 라이터
   */
  private static tabInfos(td: TabDef, sw: StreamWriter): void {
    for (const ti of td.getTabInfoList()) {
      sw.writeUInt4(ti.getPosition());
      sw.writeUInt1(ti.getTabSort()!);
      sw.writeUInt1(ti.getFillSort()!);
      sw.writeZero(2);
    }
  }
}
