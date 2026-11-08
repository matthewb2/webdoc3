import type { ControlBookmark } from "../../../../object/bodytext/control/ControlBookmark.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "./bookmark/ForCtrlData.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 책갈피 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlBookmark {
  /**
   * 책갈피 컨트롤을 읽는다.
   *
   * @param b  책갈피 컨트롤
   * @param sr 스트림 리더
   */
  public static read(b: ControlBookmark, sr: StreamReader): void {
    ForControlBookmark.ctrlData(b, sr);
  }

  /**
   * 컨트롤 데이터 레코드를 읽는다.
   *
   * @param b  컨트롤 데이터 레코드
   * @param sr 스트림 리더
   */
  private static ctrlData(b: ControlBookmark, sr: StreamReader): void {
    const rh = sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.CTRL_DATA) {
      b.createCtrlData();
      ForCtrlData.read(b.getCtrlData()!, sr);
    }
  }
}
