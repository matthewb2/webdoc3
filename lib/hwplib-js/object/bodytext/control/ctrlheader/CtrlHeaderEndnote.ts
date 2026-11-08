import { ControlType } from "../ControlType.js";
import type { NumberShape } from "../sectiondefine/NumberShape.js";
import { HWPString } from "../../../etc/HWPString.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 미주(End Note) 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderEndnote extends CtrlHeader {
  /**
   * 미주 번호
   */
  private number = 0;
  /**
   * 앞 장식 문자
   */
  private beforeDecorationLetter: HWPString;
  /**
   * 뒤 장식 문자
   */
  private afterDecorationLetter: HWPString;
  /**
   * 번호 모양
   */
  private numberShape: NumberShape | null = null;
  /**
   * 문서 내 각 개체에 대한 고유 아이디
   */
  private instanceId = 0;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.Endnote);
    this.beforeDecorationLetter = new HWPString();
    this.afterDecorationLetter = new HWPString();
  }

  /**
   * 미주 번호를 반환한다.
   *
   * @return 미주 번호
   */
  getNumber(): number {
    return this.number;
  }

  /**
   * 미주 번호를 설정한다.
   *
   * @param number 미주 번호
   */
  setNumber(number: number): void {
    this.number = number;
  }

  /**
   * 앞 장식 문자를 반환한다.
   *
   * @return 앞 장식 문자
   */
  getBeforeDecorationLetter(): HWPString {
    return this.beforeDecorationLetter;
  }

  /**
   * 뒤 장식 문자를 반환한다.
   *
   * @return 뒤 장식 문자
   */
  getAfterDecorationLetter(): HWPString {
    return this.afterDecorationLetter;
  }

  /**
   * 번호 모양을 반환한다.
   *
   * @return 번호 모양
   */
  getNumberShape(): NumberShape | null {
    return this.numberShape;
  }

  /**
   * 번호 모양을 설정한다.
   *
   * @param numberShape 번호 모양
   */
  setNumberShape(numberShape: NumberShape): void {
    this.numberShape = numberShape;
  }

  /**
   * 문서 내 각 개체에 대한 고유 아이디를 반환한다.
   *
   * @return 문서 내 각 개체에 대한 고유 아이디
   */
  getInstanceId(): number {
    return this.instanceId;
  }

  /**
   * 문서 내 각 개체에 대한 고유 아이디를 설정한다.
   *
   * @param instanceId 문서 내 각 개체에 대한 고유 아이디
   */
  setInstanceId(instanceId: number): void {
    this.instanceId = instanceId;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderEndnote;
    this.number = from2.number;
    this.beforeDecorationLetter.copy(from2.beforeDecorationLetter);
    this.afterDecorationLetter.copy(from2.afterDecorationLetter);
    this.numberShape = from2.numberShape;
    this.instanceId = from2.instanceId;
  }
}
