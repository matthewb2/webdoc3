import type { TabDef } from "../../object/docinfo/TabDef.js";
import { BorderType } from "../../object/docinfo/borderfill/BorderType.js";
import { TabSort } from "../../object/docinfo/tabdef/TabSort.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 탭 정의 레코드를 읽는다.
 *
 * @author neolord
 */
export class ForTabDef {
  /**
   * 탭 정의 레코드를 읽는다.
   *
   * @param td 탭 정의 레코드
   * @param sr 스트림 리더
   */
  public static read(td: TabDef, sr: StreamReader): void {
    td.getProperty().setValue(sr.readUInt4());
    const tabInfoCount = sr.readUInt4();
    if (tabInfoCount > 0) {
      ForTabDef.tabInfos(td, sr, tabInfoCount);
    }
  }

  /**
   * 탭 정보 부분을 읽는다.
   *
   * @param td           탭 정의 레코드
   * @param sr           스트림 리더
   * @param tabInfoCount 탭 정의의 개수
   */
  private static tabInfos(td: TabDef, sr: StreamReader, tabInfoCount: number): void {
    for (let i = 0; i < tabInfoCount; i++) {
      const ti = td.addNewTabInfo();
      ti.setPosition(sr.readUInt4());
      ti.setTabSort(TabSort.valueOf(sr.readUInt1()));
      ti.setFillSort(BorderType.valueOf(sr.readUInt1()));
      sr.skip(2); // reserved
    }
  }
}
