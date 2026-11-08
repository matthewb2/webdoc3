import { BitFlag } from "../../../../util/binary/BitFlag.js";
import { PositionCriterion } from "./PositionCriterion.js";
import { FillArea } from "./FillArea.js";

/**
 * 쪽 테두리/배경 정보의 속성에 대한 객체
 * Ported from hwplib's `object.bodytext.control.sectiondefine.PageBorderFillProperty`.
 *
 * @author neolord
 */
export class PageBorderFillProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * 파일에 저장되는 정수값을 설정한다.
   *
   * @param value 파일에 저장되는 정수값
   */
  public setValue(value: number): void {
    this.value = value;
  }

  /**
   * 위치 기준을 반환한다. (0 bit)
   *
   * @return 위치 기준
   */
  public getPositionCriterion(): PositionCriterion {
    if (BitFlag.get(this.value, 0) === true) {
      return PositionCriterion.Paper;
    } else {
      return PositionCriterion.MainText;
    }
  }

  /**
   * 위치 기준을 설정한다. (0 bit)
   *
   * @param positionCriterion
   */
  public setPositionCriterion(positionCriterion: PositionCriterion): void {
    if (positionCriterion === PositionCriterion.MainText) {
      this.value = BitFlag.set(this.value, 0, false);
    } else if (positionCriterion === PositionCriterion.Paper) {
      this.value = BitFlag.set(this.value, 0, true);
    }
  }

  /**
   * 머리말 포홤 여부를 반환한다. (1 bit)
   *
   * @return 머리말 포홤 여부
   */
  public isIncludeHeader(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 머리말 포홤 여부를 설정한다. (1 bit)
   *
   * @param includeHeader 머리말 포홤 여부
   */
  public setIncludeHeader(includeHeader: boolean): void {
    this.value = BitFlag.set(this.value, 1, includeHeader);
  }

  /**
   * 꼬리말 포함 여부를 반환한다. (2 bit)
   *
   * @return 꼬리말 포함 여부
   */
  public isIncludeFooter(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 꼬리말 포함 여부를 설정한다. (2 bit)
   *
   * @param includeFooter 꼬리말 포함 여부
   */
  public setIncludeFooter(includeFooter: boolean): void {
    this.value = BitFlag.set(this.value, 2, includeFooter);
  }

  /**
   * 채워질 영역의 종류를 반환한다. (3~4 bit)
   *
   * @return 채워질 영역의 종류
   */
  public getFillArea(): FillArea {
    return FillArea.valueOf(BitFlag.getRange(this.value, 3, 4));
  }

  /**
   * 채워질 영역의 종류를 설정한다. (3~4 bit)
   *
   * @param fillArea 채워질 영역의 종류
   */
  public setFillArea(fillArea: FillArea): void {
    this.value = BitFlag.setRange(this.value, 3, 4, fillArea);
  }

  public copy(from: PageBorderFillProperty): void {
    this.value = from.value;
  }
}
