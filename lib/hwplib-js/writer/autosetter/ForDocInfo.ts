import type { BodyText } from "../../object/bodytext/BodyText.js";
import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import type { DocumentProperties } from "../../object/docinfo/DocumentProperties.js";
import type { IDMappings } from "../../object/docinfo/IDMappings.js";

/**
 * DocInfo 스트림을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForDocInfo {
  /**
   * DocInfo 스트림을 자동 설정한다.
   *
   * @param di DocInfo 스트림 객체
   * @param bt BodyText 스토리지 객체
   */
  public static autoset(di: DocInfo, bt: BodyText): void {
    ForDocInfo.documentProperties(di.getDocumentProperties(), bt);
    ForDocInfo.idMappings(di.getIDMappings(), di);
  }

  /**
   * 문서 속성 레코드를 자동 설정한다.
   *
   * @param dp 문서 속성 레코드
   * @param bt BodyText 스토리지 객체
   */
  private static documentProperties(dp: DocumentProperties, bt: BodyText): void {
    dp.setSectionCount(bt.getSectionList().length);
  }

  /**
   * 아이디 매핑 레코드를 자동 설정한다.
   *
   * @param im 아이디 매핑 레코드
   * @param di DocInfo 스트림 객체
   */
  private static idMappings(im: IDMappings, di: DocInfo): void {
    im.setBinDataCount(di.getBinDataList().length);
    im.setHangulFaceNameCount(di.getHangulFaceNameList().length);
    im.setEnglishFaceNameCount(di.getEnglishFaceNameList().length);
    im.setHanjaFaceNameCount(di.getHanjaFaceNameList().length);
    im.setJapaneseFaceNameCount(di.getJapaneseFaceNameList().length);
    im.setEtcFaceNameCount(di.getEtcFaceNameList().length);
    im.setSymbolFaceNameCount(di.getSymbolFaceNameList().length);
    im.setUserFaceNameCount(di.getUserFaceNameList().length);
    im.setBorderFillCount(di.getBorderFillList().length);
    im.setCharShapeCount(di.getCharShapeList().length);
    im.setTabDefCount(di.getTabDefList().length);
    im.setNumberingCount(di.getNumberingList().length);
    im.setBulletCount(di.getBulletList().length);
    im.setParaShapeCount(di.getParaShapeList().length);
    im.setStyleCount(di.getStyleList().length);
    im.setMemoShapeCount(di.getMemoShapeList().length);
    im.setTrackChangeCount(di.getTrackChange2List().length);
    im.setTrackChangeAuthorCount(di.getTrackChangeAuthorList().length);
  }
}
