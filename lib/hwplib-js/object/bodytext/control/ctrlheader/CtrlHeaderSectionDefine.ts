import { ControlType } from "../ControlType.js";
import { SectionDefineHeaderProperty } from "./sectiondefine/SectionDefineHeaderProperty.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 구역 정의 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderSectionDefine extends CtrlHeader {
  /**
   * 속성
   */
  private property: SectionDefineHeaderProperty;
  /**
   * 동일한 페이지에서 서로 다른 단 사이의 간격
   */
  private columnGap = 0;
  /**
   * 세로로 줄맞춤을 할지 여부
   */
  private verticalLineAlign = 0;
  /**
   * 가로로 줄맞춤을 할지 여부
   */
  private horizontalLineAlign = 0;
  /**
   * 기본 탭 간격
   */
  private defaultTabGap = 0;
  /**
   * 번호 문단 모양 ID
   */
  private numberParaShapeId = 0;
  /**
   * 쪽 시작 번호
   */
  private pageStartNumber = 0;
  /**
   * 그림 시작 번호
   */
  private imageStartNumber = 0;
  /**
   * 표 시작 번호
   */
  private tableStartNumber = 0;
  /**
   * 수식 시작 번호
   */
  private equationStartNumber = 0;
  /**
   * 대표Language(5.0.1.5 이상)
   */
  private defaultLanguage = 0;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.SectionDefine);
    this.property = new SectionDefineHeaderProperty();
  }

  /**
   * 구역 정의 컨트롤의 속성 객체를 반환한다.
   *
   * @return 구역 정의 컨트롤의 속성 객체
   */
  getProperty(): SectionDefineHeaderProperty {
    return this.property;
  }

  /**
   * 동일한 페이지에서 서로 다른 단 사이의 간격을 반환한다.
   *
   * @return 동일한 페이지에서 서로 다른 단 사이의 간격
   */
  getColumnGap(): number {
    return this.columnGap;
  }

  /**
   * 동일한 페이지에서 서로 다른 단 사이의 간격을 설정한다.
   *
   * @param columnGap 동일한 페이지에서 서로 다른 단 사이의 간격
   */
  setColumnGap(columnGap: number): void {
    this.columnGap = columnGap;
  }

  /**
   * 세로로 줄맞춤을 할지 여부를 반환한다.
   *
   * @return 세로로 줄맞춤을 할지 여부
   */
  getVerticalLineAlign(): number {
    return this.verticalLineAlign;
  }

  /**
   * 세로로 줄맞춤을 할지 여부를 설정한다.
   *
   * @param verticalLineAlign 세로로 줄맞춤을 할지 여부
   */
  setVerticalLineAlign(verticalLineAlign: number): void {
    this.verticalLineAlign = verticalLineAlign;
  }

  /**
   * 가로로 줄맞춤을 할지 여부를 반환한다.
   *
   * @return 가로로 줄맞춤을 할지 여부
   */
  getHorizontalLineAlign(): number {
    return this.horizontalLineAlign;
  }

  /**
   * 가로로 줄맞춤을 할지 여부를 설정한다.
   *
   * @param horizontalLineAlign 가로로 줄맞춤을 할지 여부
   */
  setHorizontalLineAlign(horizontalLineAlign: number): void {
    this.horizontalLineAlign = horizontalLineAlign;
  }

  /**
   * 기본 탭 간격을 반환한다.
   *
   * @return 기본 탭 간격
   */
  getDefaultTabGap(): number {
    return this.defaultTabGap;
  }

  /**
   * 기본 탭 간격을 설정한다.
   *
   * @param defaultTabGap 기본 탭 간격
   */
  setDefaultTabGap(defaultTabGap: number): void {
    this.defaultTabGap = defaultTabGap;
  }

  /**
   * 번호 문단 모양 ID를 반환한다.
   *
   * @return 번호 문단 모양 ID
   */
  getNumberParaShapeId(): number {
    return this.numberParaShapeId;
  }

  /**
   * 번호 문단 모양 ID를 설정한다.
   *
   * @param numberParaShapeId 번호 문단 모양 ID
   */
  setNumberParaShapeId(numberParaShapeId: number): void {
    this.numberParaShapeId = numberParaShapeId;
  }

  /**
   * 쪽 시작 번호를 반환한다.
   *
   * @return 쪽 시작 번호
   */
  getPageStartNumber(): number {
    return this.pageStartNumber;
  }

  /**
   * 쪽 시작 번호를 섫정한다.
   *
   * @param pageStartNumber 쪽 시작 번호
   */
  setPageStartNumber(pageStartNumber: number): void {
    this.pageStartNumber = pageStartNumber;
  }

  /**
   * 아미지 시작 번호를 반환한다.
   *
   * @return 아미지 시작 번호
   */
  getImageStartNumber(): number {
    return this.imageStartNumber;
  }

  /**
   * 아미지 시작 번호를 설정한다.
   *
   * @param imageStartNumber 아미지 시작 번호
   */
  setImageStartNumber(imageStartNumber: number): void {
    this.imageStartNumber = imageStartNumber;
  }

  /**
   * 표 시작 번호를 반환한다.
   *
   * @return 표 시작 번호
   */
  getTableStartNumber(): number {
    return this.tableStartNumber;
  }

  /**
   * 표 시작 번호를 설정한다.
   *
   * @param tableStartNumber 표 시작 번호
   */
  setTableStartNumber(tableStartNumber: number): void {
    this.tableStartNumber = tableStartNumber;
  }

  /**
   * 수식 시작 번호를 반환한다.
   *
   * @return 수식 시작 번호
   */
  getEquationStartNumber(): number {
    return this.equationStartNumber;
  }

  /**
   * 수식 시작 번호를 설정한다.
   *
   * @param equationStartNumber 수식 시작 번호
   */
  setEquationStartNumber(equationStartNumber: number): void {
    this.equationStartNumber = equationStartNumber;
  }

  /**
   * 대표Language 값을 반환한다. (5.0.1.5 이상)
   *
   * @return 대표Language 값
   */
  getDefaultLanguage(): number {
    return this.defaultLanguage;
  }

  /**
   * 대표Language 값을 설정한다. (5.0.1.5 이상)
   *
   * @param defaultLanguage 대표Language 값
   */
  setDefaultLanguage(defaultLanguage: number): void {
    this.defaultLanguage = defaultLanguage;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderSectionDefine;
    this.property.copy(from2.property);
    this.columnGap = from2.columnGap;
    this.verticalLineAlign = from2.verticalLineAlign;
    this.horizontalLineAlign = from2.horizontalLineAlign;
    this.defaultTabGap = from2.defaultTabGap;
    this.numberParaShapeId = from2.numberParaShapeId;
    this.pageStartNumber = from2.pageStartNumber;
    this.imageStartNumber = from2.imageStartNumber;
    this.tableStartNumber = from2.tableStartNumber;
    this.equationStartNumber = from2.equationStartNumber;
    this.defaultLanguage = from2.defaultLanguage;
  }
}
