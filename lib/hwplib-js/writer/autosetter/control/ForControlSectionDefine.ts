import type { ControlSectionDefine } from "../../../object/bodytext/control/ControlSectionDefine.js";
import type { BatangPageInfo } from "../../../object/bodytext/control/sectiondefine/BatangPageInfo.js";
import { ForParagraphList } from "../ForParagraphList.js";
import type { InstanceID } from "../InstanceID.js";

/**
 * 구역 정의 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlSectionDefine {
  /**
   * 구역 정의 컨트롤을 자동 설정한다.
   *
   * @param sd  구역 정의 컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(sd: ControlSectionDefine, iid: InstanceID): void {
    ForControlSectionDefine.batangPageInfos(sd, iid);
  }

  /**
   * 바탕 페이지 정보들을 자동 설정한다.
   *
   * @param sd  구역 정의 컨트롤
   * @param iid 인스턴스 id
   */
  private static batangPageInfos(sd: ControlSectionDefine, iid: InstanceID): void {
    for (const bpi of sd.getBatangPageInfoList()) {
      ForControlSectionDefine.listHeader(bpi);
      ForParagraphList.autoSet(bpi.getParagraphList(), iid);
    }
  }

  /**
   * 바탕 페이지 정보의 리스트 헤더 레코드를 자동 설정한다.
   *
   * @param bpi 바탕 페이지 정보 객체
   */
  private static listHeader(bpi: BatangPageInfo): void {
    bpi.getListHeader().setParaCount(bpi.getParagraphList().getParagraphCount());
  }
}
