import { Color4Byte } from "../../../etc/Color4Byte.js";
import { HWPString } from "../../../etc/HWPString.js";

/**
 * 수식 컨트롤의 수식 정보를 나타내는 레코드
 *
 * @author neolord
 */
export class EQEdit {
  /**
   * 속성(스크립트가 차지하는 범위. 첫 비트가 켜져 있으면 줄 단위, 꺼져 있으면 글자 단위??)
   */
  private property = 0;
  /**
   * 한글 수식 스크립트
   */
  private script: HWPString;
  /**
   * 수식 글자 크기
   */
  private letterSize = 0;
  /**
   * 글자 색상
   */
  private letterColor: Color4Byte;
  /**
   * base line
   */
  private baseLine = 0;
  /**
   * 알수 없는 2 byte;
   */
  private unknown = 0;
  /**
   * 버전 정보
   */
  private versionInfo: HWPString;
  /**
   * 폰트 이름
   */
  private fontName: HWPString;

  /**
   * 생성자
   */
  public constructor() {
    this.script = new HWPString();
    this.letterColor = new Color4Byte();
    this.versionInfo = new HWPString();
    this.fontName = new HWPString();
  }

  /**
   * 속성값을 반환한다.
   *
   * @return 속성값
   */
  public getProperty(): number {
    return this.property;
  }

  /**
   * 속성값을 설정한다.
   *
   * @param property 속성값
   */
  public setProperty(property: number): void {
    this.property = property;
  }

  /**
   * 한글 수식 스크립트를 반환한다.
   *
   * @return 한글 수식 스크립트
   */
  public getScript(): HWPString {
    return this.script;
  }

  /**
   * 수식 글자 크기를 반환한다.
   *
   * @return 수식 글자 크기
   */
  public getLetterSize(): number {
    return this.letterSize;
  }

  /**
   * 수식 글자 크기를 설정한다.
   *
   * @param letterSize 수식 글자 크기
   */
  public setLetterSize(letterSize: number): void {
    this.letterSize = letterSize;
  }

  /**
   * 글자 색상 객체를 반환한다.
   *
   * @return 글자 색상 객체
   */
  public getLetterColor(): Color4Byte {
    return this.letterColor;
  }

  /**
   * base line을 반환한다.
   *
   * @return base line
   */
  public getBaseLine(): number {
    return this.baseLine;
  }

  /**
   * base line을 설정한다.
   *
   * @param baseLine base line
   */
  public setBaseLine(baseLine: number): void {
    this.baseLine = baseLine;
  }

  /**
   * 알수 없는 2 byte를 반환한다.
   */
  public getUnknown(): number {
    return this.unknown;
  }

  /**
   * 알수 없는 2 byte를 설정한다.
   *
   * @param unknown 알수 없는 2 byte
   */
  public setUnknown(unknown: number): void {
    this.unknown = unknown;
  }

  /**
   * 버전 정보를 반환한다.
   *
   * @return 버전 정보
   */
  public getVersionInfo(): HWPString {
    return this.versionInfo;
  }

  /**
   * 폰트 이름을 반환한다.
   *
   * @return 폰트 이름
   */
  public getFontName(): HWPString {
    return this.fontName;
  }

  public copy(from: EQEdit): void {
    this.property = from.property;
    this.script.copy(from.script);
    this.letterSize = from.letterSize;
    this.letterColor.copy(from.letterColor);
    this.baseLine = from.baseLine;
    this.unknown = from.unknown;
    this.versionInfo.copy(from.versionInfo);
    this.fontName.copy(from.fontName);
  }
}
