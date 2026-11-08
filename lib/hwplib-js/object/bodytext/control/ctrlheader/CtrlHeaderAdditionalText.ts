import { ControlType } from "../ControlType.js";
import type { AdditionalTextPosition } from "./additionaltext/AdditionalTextPosition.js";
import type { Alignment } from "../../../docinfo/parashape/Alignment.js";
import { HWPString } from "../../../etc/HWPString.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 덧말 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderAdditionalText extends CtrlHeader {
  /**
   * main text
   */
  private mainText: HWPString;
  /**
   * sub text
   */
  private subText: HWPString;
  /**
   * 덧말 위치
   */
  private position: AdditionalTextPosition | null = null;
  /**
   * 폰트 크기 비율(??)
   */
  private fsizeratio = 0;
  /**
   * 옵션(??)
   */
  private option = 0;
  /**
   * Style Number
   */
  private styleId = 0;
  /**
   * 정령 기준
   */
  private alignment: Alignment | null = null;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.AdditionalText);
    this.mainText = new HWPString();
    this.subText = new HWPString();
  }

  /**
   * main text를 반환한다.
   *
   * @return main text
   */
  getMainText(): HWPString {
    return this.mainText;
  }

  /**
   * sub text를 반환한다.
   *
   * @return sub text
   */
  getSubText(): HWPString {
    return this.subText;
  }

  /**
   * 덧말 위치 을 반환한다.
   *
   * @return 덧말 위치
   */
  getPosition(): AdditionalTextPosition | null {
    return this.position;
  }

  /**
   * 덧말 위치 를 설정한다.
   *
   * @param position 덧말 위치
   */
  setPosition(position: AdditionalTextPosition): void {
    this.position = position;
  }

  /**
   * 폰트 크기 비율(??)을 반환한다.
   *
   * @return 폰트 크기 비율(??)
   */
  getFsizeratio(): number {
    return this.fsizeratio;
  }

  /**
   * 폰트 크기 비율(??)을 설정한다.
   *
   * @param fsizeratio 폰트 크기 비율(??)
   */
  setFsizeratio(fsizeratio: number): void {
    this.fsizeratio = fsizeratio;
  }

  /**
   * 옵션(??)을 반환한다.
   *
   * @return 옵션(? ?)
   */
  getOption(): number {
    return this.option;
  }

  /**
   * 옵션(??)을 설정한다.
   *
   * @param option
   */
  setOption(option: number): void {
    this.option = option;
  }

  /**
   * Style Number를 반환한다.
   *
   * @return Style Number
   */
  getStyleId(): number {
    return this.styleId;
  }

  /**
   * Style Number를 설정한다.
   *
   * @param styleId Style Number
   */
  setStyleId(styleId: number): void {
    this.styleId = styleId;
  }

  /**
   * 정령 기준을 반환한다.
   *
   * @return 정령 기준
   */
  getAlignment(): Alignment | null {
    return this.alignment;
  }

  /**
   * 정령 기준을 설정한다.
   *
   * @param alignment 정령 기준
   */
  setAlignment(alignment: Alignment): void {
    this.alignment = alignment;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderAdditionalText;
    this.mainText.copy(from2.mainText);
    this.subText.copy(from2.subText);
    this.position = from2.position;
    this.fsizeratio = from2.fsizeratio;
    this.option = from2.option;
    this.styleId = from2.styleId;
    this.alignment = from2.alignment;
  }
}
