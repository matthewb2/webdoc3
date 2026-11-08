import { ControlType } from "../ControlType.js";
import { HWPString } from "../../../etc/HWPString.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 찾아보기 표식 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderIndexMark extends CtrlHeader {
  /**
   * 키워드 1
   */
  private keyword1: HWPString;
  /**
   * 키워드 2
   */
  private keyword2: HWPString;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.IndexMark);
    this.keyword1 = new HWPString();
    this.keyword2 = new HWPString();
  }

  /**
   * 키워드 1을 반환한다.
   *
   * @return 키워드 1
   */
  getKeyword1(): HWPString {
    return this.keyword1;
  }

  /**
   * 키워드 2을 반환한다.
   *
   * @return 키워드 2
   */
  getKeyword2(): HWPString {
    return this.keyword2;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderIndexMark;
    this.keyword1.copy(from2.keyword1);
    this.keyword2.copy(from2.keyword2);
  }
}
