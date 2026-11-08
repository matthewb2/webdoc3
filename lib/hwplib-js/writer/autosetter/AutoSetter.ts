import type { HWPFile } from "../../object/HWPFile.js";
import type { BodyText } from "../../object/bodytext/BodyText.js";
import { ForDocInfo } from "./ForDocInfo.js";
import { ForParagraphList } from "./ForParagraphList.js";
import type { InstanceID } from "./InstanceID.js";

/**
 * 한글 파일을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class AutoSetter {
  /**
   * 한글 파일을 자동 설정한다.
   *
   * @param hwpFile 한글 파일 객체
   * @param iid     인스턴스 id
   */
  public static autoSet(hwpFile: HWPFile, iid: InstanceID): void {
    AutoSetter.docInfo(hwpFile);
    AutoSetter.bodyText(hwpFile.getBodyText(), iid);
  }

  /**
   * DocInfo 스트림을 자동설정한다.
   *
   * @param hwpFile 한글 파일 객체
   */
  private static docInfo(hwpFile: HWPFile): void {
    ForDocInfo.autoset(hwpFile.getDocInfo(), hwpFile.getBodyText());
  }

  /**
   * BodyText 스토리지를 자동 설정한다.
   *
   * @param bodyText BodyText 스토리지 객체
   * @param iid      인스턴스 id
   */
  private static bodyText(bodyText: BodyText, iid: InstanceID): void {
    for (const s of bodyText.getSectionList()) {
      ForParagraphList.autoSet(s, iid);
    }
  }
}
