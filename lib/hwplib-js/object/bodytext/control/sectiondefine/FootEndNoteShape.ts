import { FootNoteShapeProperty } from "./FootNoteShapeProperty.js";
import { HWPString } from "../../../etc/HWPString.js";
import { EachBorder } from "../../../docinfo/borderfill/EachBorder.js";

/**
 * 미주/각주 모양 정보에 대한 레코드
 * Ported from hwplib's `object.bodytext.control.sectiondefine.FootEndNoteShape`.
 *
 * @author neolord
 */
export class FootEndNoteShape {
  /**
   * 속성
   */
  private property: FootNoteShapeProperty;
  /**
   * 사용자 기호
   */
  private userSymbol: HWPString;
  /**
   * 앞 장식 문자
   */
  private beforeDecorativeLetter: HWPString;
  /**
   * 뒤 장식 문자
   */
  private afterDecorativeLetter: HWPString;
  /**
   * 시작 번호
   */
  private startNumber: number = 0;
  /**
   * 구분선 길이
   */
  private divideLineLength: number = 0;
  /**
   * 구분선 위 여백
   */
  private divideLineTopMargin: number = 0;
  /**
   * 구분선 아래 여백
   */
  private divideLineBottomMargin: number = 0;
  /**
   * 주석 사이 여백
   */
  private betweenNotesMargin: number = 0;
  /**
   * 구분선 정보
   */
  private divideLine: EachBorder;
  /**
   * 알수 없는 4 byte;
   */
  private unknown: number = 0;

  /**
   * 생성자
   */
  public constructor() {
    this.property = new FootNoteShapeProperty();
    this.userSymbol = new HWPString();
    this.beforeDecorativeLetter = new HWPString();
    this.afterDecorativeLetter = new HWPString();
    this.divideLine = new EachBorder();
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  public getProperty(): FootNoteShapeProperty {
    return this.property;
  }

  /**
   * 사용자 기호를 반환한다.
   *
   * @return 사용자 기호
   */
  public getUserSymbol(): HWPString {
    return this.userSymbol;
  }

  /**
   * 앞 장식 문자를 반환한다.
   *
   * @return 앞 장식 문자
   */
  public getBeforeDecorativeLetter(): HWPString {
    return this.beforeDecorativeLetter;
  }

  /**
   * 뒤 장식 문자를 반환한다.
   *
   * @return 뒤 장식 문자
   */
  public getAfterDecorativeLetter(): HWPString {
    return this.afterDecorativeLetter;
  }

  /**
   * 시작 번호를 반환한다.
   *
   * @return 시작 번호
   */
  public getStartNumber(): number {
    return this.startNumber;
  }

  /**
   * 시작 번호를 설정한다.
   *
   * @param startNumber 시작 번호
   */
  public setStartNumber(startNumber: number): void {
    this.startNumber = startNumber;
  }

  /**
   * 구분선 길이를 반환한다.
   *
   * @return 구분선 길이
   */
  public getDivideLineLength(): number {
    return this.divideLineLength;
  }

  /**
   * 구분선 길이를 설정한다.
   *
   * @param divideLineLength 구분선 길이
   */
  public setDivideLineLength(divideLineLength: number): void {
    this.divideLineLength = divideLineLength;
  }

  /**
   * 구분선 위 여백의 크기를 반환한다.
   *
   * @return 구분선 위 여백의 크기
   */
  public getDivideLineTopMargin(): number {
    return this.divideLineTopMargin;
  }

  /**
   * 구분선 위 여백의 크기를 설정한다.
   *
   * @param divideLineTopMargin 구분선 위 여백의 크기
   */
  public setDivideLineTopMargin(divideLineTopMargin: number): void {
    this.divideLineTopMargin = divideLineTopMargin;
  }

  /**
   * 구분선 아래 여백의 크기를 반환한다.
   *
   * @return 구분선 아래 여백의 크기
   */
  public getDivideLineBottomMargin(): number {
    return this.divideLineBottomMargin;
  }

  /**
   * 구분선 아래 여백의 크기를 설정한다.
   *
   * @param divideLineBottomMargin 구분선 아래 여백의 크기
   */
  public setDivideLineBottomMargin(divideLineBottomMargin: number): void {
    this.divideLineBottomMargin = divideLineBottomMargin;
  }

  /**
   * 주석 사이 여백의 크기를 반환한다.
   *
   * @return 주석 사이 여백의 크기
   */
  public getBetweenNotesMargin(): number {
    return this.betweenNotesMargin;
  }

  /**
   * 주석 사이 여백의 크기를 설정한다.
   *
   * @param betweenNotesMargin 주석 사이 여백의 크기
   */
  public setBetweenNotesMargin(betweenNotesMargin: number): void {
    this.betweenNotesMargin = betweenNotesMargin;
  }

  /**
   * 구분선 정보를 반환한다.
   *
   * @return 구분선 정보
   */
  public getDivideLine(): EachBorder {
    return this.divideLine;
  }

  /**
   * 알수 없는 4byte를 반환한다.
   *
   * @return 알수 없는 4byte
   */
  public getUnknown(): number {
    return this.unknown;
  }

  /**
   * 알수 없는 4byte를 설정한다.
   *
   * @param unknown 알수 없는 4byte
   */
  public setUnknown(unknown: number): void {
    this.unknown = unknown;
  }

  public copy(from: FootEndNoteShape): void {
    this.property.copy(from.property);
    this.userSymbol.copy(from.userSymbol);
    this.beforeDecorativeLetter.copy(from.beforeDecorativeLetter);
    this.afterDecorativeLetter.copy(from.afterDecorativeLetter);
    this.startNumber = from.startNumber;
    this.divideLineLength = from.divideLineLength;
    this.divideLineTopMargin = from.divideLineTopMargin;
    this.divideLineBottomMargin = from.divideLineBottomMargin;
    this.betweenNotesMargin = from.betweenNotesMargin;
    this.divideLine.copy(from.divideLine);
    this.unknown = from.unknown;
  }
}
