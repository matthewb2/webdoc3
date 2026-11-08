import { ControlMask } from "./ControlMask.js";
import { DivideSort } from "./DivideSort.js";

/**
 * 문단 헤더 레코드
 *
 * @author neolord
 */
export class ParaHeader {
  /**
   * 문단 리스트에서 이 문단이 마지막 문단인지 여부
   */
  private lastInList = false;
  /**
   * 텍스트가 가지고 있는 문자의 객수
   */
  private characterCount = 0;
  /**
   * control mask
   */
  private controlMask: ControlMask;
  /**
   * 참조된 문단 모양 id
   */
  private paraShapeId = 0;
  /**
   * 참조된 스타일 id
   */
  private styleId = 0;
  /**
   * 단 나누기 종류
   */
  private divideSort: DivideSort;
  /**
   * 글자 모양 정보의 개수. ParaCharShape에 글자 위치-글자 모양 쌍의 개수
   */
  private charShapeCount = 0;
  /**
   * range tag 정보의 개수. ParaRangeTag의 영역 태그의 개수
   */
  private rangeTagCount = 0;
  /**
   * 각 줄에 대한 align에 대한 정보의 개수. ParaLineSeg의 정보의 객수
   */
  private lineAlignCount = 0;
  /**
   * 문단 Instance ID (unique ID)
   */
  private instanceID = 0;
  /**
   * 변경추적 병합 문단여부. (5.0.3.2 버전 이상)
   */
  private isMergedByTrack = 0;

  /**
   * 생성자
   */
  constructor() {
    this.controlMask = new ControlMask();
    this.divideSort = new DivideSort();
  }

  /**
   * 문단 리스트에서 이 문단이 마지막 문단인지 여부를 반환한다.
   *
   * @return 문단 리스트에서 이 문단이 마지막 문단인지 여부
   */
  isLastInList(): boolean {
    return this.lastInList;
  }

  /**
   * 문단 리스트에서 이 문단이 마지막 문단인지 여부를 설정한다.
   *
   * @param lastInList 문단 리스트에서 이 문단이 마지막 문단인지 여부
   */
  setLastInList(lastInList: boolean): void {
    this.lastInList = lastInList;
  }

  /**
   * 텍스트가 가지고 있는 문자의 객수를 반환한다.
   *
   * @return 텍스트가 가지고 있는 문자의 객수
   */
  getCharacterCount(): number {
    return this.characterCount;
  }

  /**
   * 텍스트가 가지고 있는 문자의 객수를 설정한다.
   *
   * @param characterCount 텍스트가 가지고 있는 문자의 객수
   */
  setCharacterCount(characterCount: number): void {
    this.characterCount = characterCount;
  }

  /**
   * control mask 객체를 반환한다.
   *
   * @return control mask 객체
   */
  getControlMask(): ControlMask {
    return this.controlMask;
  }

  /**
   * 참조된 문단 모양 객체의 id릎 반환한다.
   *
   * @return 참조된 문단 모양 객체의 id
   */
  getParaShapeId(): number {
    return this.paraShapeId;
  }

  /**
   * 참조된 문단 모양 객체의 id를 설정한다.
   *
   * @param paraShapeId 참조된 문단 모양 객체의 id
   */
  setParaShapeId(paraShapeId: number): void {
    this.paraShapeId = paraShapeId;
  }

  /**
   * 참조된 스타일 객체의 Id를 반환한다.
   *
   * @return 참조된 스타일 객체의 Id
   */
  getStyleId(): number {
    return this.styleId;
  }

  /**
   * 참조된 스타일 객체의 Id를 설정한다.
   *
   * @param styleId 참조된 스타일 객체의 Id
   */
  setStyleId(styleId: number): void {
    this.styleId = styleId;
  }

  /**
   * 단 나누기 종류 객체를 반환한다.
   *
   * @return 단 나누기 종류 객체
   */
  getDivideSort(): DivideSort {
    return this.divideSort;
  }

  /**
   * 글자 모양 정보의 개수를 반환한다.
   *
   * @return 글자 모양 정보의 개수
   */
  getCharShapeCount(): number {
    return this.charShapeCount;
  }

  /**
   * 글자 모양 정보의 개수를 설정한다.
   *
   * @param charShapeCount 글자 모양 정보의 개수
   */
  setCharShapeCount(charShapeCount: number): void {
    this.charShapeCount = charShapeCount;
  }

  /**
   * range tag 정보의 개수를 반환한다.
   *
   * @return range tag 정보의 개수
   */
  getRangeTagCount(): number {
    return this.rangeTagCount;
  }

  /**
   * range tag 정보의 개수를 설정한다.
   *
   * @param rangeTagCount range tag 정보의 개수
   */
  setRangeTagCount(rangeTagCount: number): void {
    this.rangeTagCount = rangeTagCount;
  }

  /**
   * 각 줄에 대한 align에 대한 정보의 개수를 반환한다.
   *
   * @return 각 줄에 대한 align에 대한 정보의 개수
   */
  getLineAlignCount(): number {
    return this.lineAlignCount;
  }

  /**
   * 각 줄에 대한 align에 대한 정보의 개수를 설정한다.
   *
   * @param lineAlignCount 각 줄에 대한 align에 대한 정보의 개수.
   */
  setLineAlignCount(lineAlignCount: number): void {
    this.lineAlignCount = lineAlignCount;
  }

  /**
   * 문단의 instance id를 반환한다.
   *
   * @return 문단의 instance id
   */
  getInstanceID(): number {
    return this.instanceID;
  }

  /**
   * 문단의 instance id를 설정한다.
   *
   * @param instanceID 문단의 instance id
   */
  setInstanceID(instanceID: number): void {
    this.instanceID = instanceID;
  }

  /**
   * 변경추적 병합 문단여부를 반환한다. (5.0.3.2 버전 이상)
   *
   * @return 변경추적 병합 문단여부
   */
  getIsMergedByTrack(): number {
    return this.isMergedByTrack;
  }

  /**
   * 변경추적 병합 문단여부를 설정한다.
   *
   * @param isMergedByTrack 변경추적 병합 문단여부
   */
  setIsMergedByTrack(isMergedByTrack: number): void {
    this.isMergedByTrack = isMergedByTrack;
  }

  copy(from: ParaHeader): void {
    this.lastInList = from.lastInList;
    this.characterCount = from.characterCount;
    this.controlMask.copy(from.controlMask);
    this.paraShapeId = from.paraShapeId;
    this.styleId = from.styleId;
    this.divideSort.copy(from.divideSort);
    this.charShapeCount = from.charShapeCount;
    this.rangeTagCount = from.rangeTagCount;
    this.lineAlignCount = from.lineAlignCount;
    this.instanceID = from.instanceID;
    this.isMergedByTrack = from.isMergedByTrack;
  }
}
