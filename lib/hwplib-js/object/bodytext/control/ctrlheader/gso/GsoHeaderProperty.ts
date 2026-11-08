import { BitFlag } from "../../../../../util/binary/BitFlag.js";
import { HeightCriterion } from "./HeightCriterion.js";
import { HorzRelTo } from "./HorzRelTo.js";
import { ObjectNumberSort } from "./ObjectNumberSort.js";
import { RelativeArrange } from "./RelativeArrange.js";
import { TextFlowMethod } from "./TextFlowMethod.js";
import { TextHorzArrange } from "./TextHorzArrange.js";
import { VertRelTo } from "./VertRelTo.js";
import { WidthCriterion } from "./WidthCriterion.js";

/**
 * 그리기 객체 컨트롤의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class GsoHeaderProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value = 0;

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  getValue(): number {
    return this.value;
  }

  /**
   * 파일에 저장되는 정수값을 설정한다.
   *
   * @param value 파일에 저장되는 정수값
   */
  setValue(value: number): void {
    this.value = value;
  }

  /**
   * 글자처럼 취급 여부을 반환한다. (0 bit)
   *
   * @return 글자처럼 취급 여부
   */
  isLikeWord(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 글자처럼 취급 여부를 설정한다. (0 bit)
   *
   * @param likeWord 글자처럼 취급 여부
   */
  setLikeWord(likeWord: boolean): void {
    this.value = BitFlag.set(this.value, 0, likeWord);
  }

  /**
   * 줄 간격에 영향을 줄지 여부를 반환한다. (2 bit)
   *
   * @return 줄 간격에 영향을 줄지 여부
   */
  isApplyLineSpace(): boolean {
    return BitFlag.get(this.value, 2);
  }

  /**
   * 줄 간격에 영향을 줄지 여부를 설정한다. (2 bit)
   *
   * @param applyLineSpace 줄 간격에 영향을 줄지 여부
   */
  setApplyLineSpace(applyLineSpace: boolean): void {
    this.value = BitFlag.set(this.value, 2, applyLineSpace);
  }

  /**
   * 세로 위치의 기준을 반환한다. (3~4 bit)
   *
   * @return 세로 위치의 기준
   */
  getVertRelTo(): VertRelTo {
    return VertRelTo.valueOf(BitFlag.getRange(this.value, 3, 4));
  }

  /**
   * 세로 위치의 기준을 설정한다. (3~4 bit)
   *
   * @param vertRelTo 세로 위치의 기준
   */
  setVertRelTo(vertRelTo: VertRelTo): void {
    this.value = BitFlag.setRange(this.value, 3, 4, vertRelTo);
  }

  /**
   * 세로 위치의 기준에 대한 상대적인 배열방식을 반환한다. (5~7 bit)
   *
   * @return 세로 위치의 기준에 대한 상대적인 배열방식
   */
  getVertRelativeArrange(): RelativeArrange {
    return RelativeArrange.valueOf(BitFlag.getRange(this.value, 5, 7));
  }

  /**
   * 세로 위치의 기준에 대한 상대적인 배열방식를 설정한다. (5~7 bit)
   *
   * @param vertRelativeArrange 세로 위치의 기준에 대한 상대적인 배열방식
   */
  setVertRelativeArrange(vertRelativeArrange: RelativeArrange): void {
    this.value = BitFlag.setRange(this.value, 5, 7, vertRelativeArrange);
  }

  /**
   * 가로 위치의 기준을 반환한다. (8~9 bit)
   *
   * @return 가로 위치의 기준
   */
  getHorzRelTo(): HorzRelTo {
    return HorzRelTo.valueOf(BitFlag.getRange(this.value, 8, 9));
  }

  /**
   * 가로 위치의 기준을 설정한다. (8~9 bit)
   *
   * @param horzRelTo 가로 위치의 기준
   */
  setHorzRelTo(horzRelTo: HorzRelTo): void {
    this.value = BitFlag.setRange(this.value, 8, 9, horzRelTo);
  }

  /**
   * HorzRelTo에 대한 상대적인 배열방식을 반환한다. (10~12 bit)
   *
   * @return HorzRelTo에 대한 상대적인 배열방식
   */
  getHorzRelativeArrange(): RelativeArrange {
    return RelativeArrange.valueOf(BitFlag.getRange(this.value, 10, 12));
  }

  /**
   * HorzRelTo에 대한 상대적인 배열방식을 설정한다. (10~12 bit)
   *
   * @param horzRelativeArrange HorzRelTo에 대한 상대적인 배열방식
   */
  setHorzRelativeArrange(horzRelativeArrange: RelativeArrange): void {
    this.value = BitFlag.setRange(this.value, 10, 12, horzRelativeArrange);
  }

  /**
   * VertRelTo이 ‘para’일 때 오브젝트의 세로 위치를 본문 영역으로 제한할지 여부를 반환한다. (13 bit)
   *
   * @return VertRelTo이 ‘para’일 때 오브젝트의 세로 위치를 본문 영역으로 제한할지 여부
   */
  isVertRelToParaLimit(): boolean {
    return BitFlag.get(this.value, 13);
  }

  /**
   * VertRelTo이 ‘para’일 때 오브젝트의 세로 위치를 본문 영역으로 제한할지 여부을 설정한다.
   *
   * @param vertRelToParaLimit VertRelTo이 ‘para’일 때 오브젝트의 세로 위치를 본문 영역으로 제한할지 여부
   */
  setVertRelToParaLimit(vertRelToParaLimit: boolean): void {
    this.value = BitFlag.set(this.value, 13, vertRelToParaLimit);
  }

  /**
   * 다른 오브젝트와 겹치는 것을 허용할지 여부을 반한한다. (14 bit)
   *
   * @return 다른 오브젝트와 겹치는 것을 허용할지 여부
   */
  isAllowOverlap(): boolean {
    return BitFlag.get(this.value, 14);
  }

  /**
   * 다른 오브젝트와 겹치는 것을 허용할지 여부을 설정한다. (14 bit)
   *
   * @param allowOverlap 다른 오브젝트와 겹치는 것을 허용할지 여부
   */
  setAllowOverlap(allowOverlap: boolean): void {
    this.value = BitFlag.set(this.value, 14, allowOverlap);
  }

  /**
   * 오브젝트 폭의 기준을 반환한다. (15~17 bit)
   *
   * @return 오브젝트 폭의 기준
   */
  getWidthCriterion(): WidthCriterion {
    return WidthCriterion.valueOf(BitFlag.getRange(this.value, 15, 17));
  }

  /**
   * 오브젝트 폭의 기준을 설정한다. (15~17 bit)
   *
   * @param widthCriterion 오브젝트 폭의 기준
   */
  setWidthCriterion(widthCriterion: WidthCriterion): void {
    this.value = BitFlag.setRange(this.value, 15, 17, widthCriterion);
  }

  /**
   * 오브젝트 높이의 기준을 반환한다 (18~19 bit)
   *
   * @return 오브젝트 높이의 기준
   */
  getHeightCriterion(): HeightCriterion {
    return HeightCriterion.valueOf(BitFlag.getRange(this.value, 18, 19));
  }

  /**
   * 오브젝트 높이의 기준을 설정한다. (18~19 bit)
   *
   * @param heightCriterion 오브젝트 높이의 기준
   */
  setHeightCriterion(heightCriterion: HeightCriterion): void {
    this.value = BitFlag.setRange(this.value, 18, 19, heightCriterion);
  }

  /**
   * VertRelTo이 para일 때 크기 보호 여부을 반환한다. (20 bit)
   *
   * @return VertRelTo이 para일 때 크기 보호 여부
   */
  isProtectSize(): boolean {
    return BitFlag.get(this.value, 20);
  }

  /**
   * VertRelTo이 para일 때 크기 보호 여부를 설정한다.
   *
   * @param protectSize VertRelTo이 para일 때 크기 보호 여부
   */
  setProtectSize(protectSize: boolean): void {
    this.value = BitFlag.set(this.value, 20, protectSize);
  }

  /**
   * 오브젝트 주위를 텍스트가 어떻게 흘러갈지 지정하는 옵션을 반환한다. (21~23 bit)
   *
   * @return 오브젝트 주위를 텍스트가 어떻게 흘러갈지 지정하는 옵션
   */
  getTextFlowMethod(): TextFlowMethod {
    return TextFlowMethod.valueOf(BitFlag.getRange(this.value, 21, 23));
  }

  /**
   * 오브젝트 주위를 텍스트가 어떻게 흘러갈지 지정하는 옵션을 설정한다. (21~23 bit)
   *
   * @param textFlowMethod 오브젝트 주위를 텍스트가 어떻게 흘러갈지 지정하는 옵션
   */
  setTextFlowMethod(textFlowMethod: TextFlowMethod): void {
    this.value = BitFlag.setRange(this.value, 21, 23, textFlowMethod);
  }

  /**
   * 오브젝트의 좌/우 어느 쪽에 글을 배치할지 지정하는 옵션을 반환한다. (24~25 bit)
   *
   * @return 오브젝트의 좌/우 어느 쪽에 글을 배치할지 지정하는 옵션
   */
  getTextHorzArrange(): TextHorzArrange {
    return TextHorzArrange.valueOf(BitFlag.getRange(this.value, 24, 25));
  }

  /**
   * 오브젝트의 좌/우 어느 쪽에 글을 배치할지 지정하는 옵션을 설정한다. (24~25 bit)
   *
   * @param textHorzArrange 오브젝트의 좌/우 어느 쪽에 글을 배치할지 지정하는 옵션
   */
  setTextHorzArrange(textHorzArrange: TextHorzArrange): void {
    this.value = BitFlag.setRange(this.value, 24, 25, textHorzArrange);
  }

  /**
   * 개체가 속하는 번호 범주를 반환한다. (26~28 bit)
   *
   * @return 개체가 속하는 번호 범주
   */
  getObjectNumberSort(): ObjectNumberSort {
    return ObjectNumberSort.valueOf(BitFlag.getRange(this.value, 26, 28));
  }

  /**
   * 개체가 속하는 번호 범주를 설정한다. (26~28 bit)
   *
   * @param objectNumberSort 개체가 속하는 번호 범주
   */
  setObjectNumberSort(objectNumberSort: ObjectNumberSort): void {
    this.value = BitFlag.setRange(this.value, 26, 28, objectNumberSort);
  }

  /**
   * 캡션을 가졌는지 유무(?)를 반환한다. (29 bit)
   *
   * @return 캡션을 가졌는지 유무(?)
   */
  hasCaption(): boolean {
    return BitFlag.get(this.value, 29);
  }

  /**
   * 캡션을 가졌는지 유무(?)를 설정한다. (29bit)
   *
   * @param hasCaption 캡션을 가졌는지 유무(?)
   */
  setHasCaption(hasCaption: boolean): void {
    this.value = BitFlag.set(this.value, 29, hasCaption);
  }

  copy(from: GsoHeaderProperty): void {
    this.value = from.value;
  }
}
