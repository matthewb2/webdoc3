import { ListHeaderPropertyForCell } from "./ListHeaderPropertyForCell.js";

/**
 * 셀의 문단 리스트 헤더 레코드
 *
 * @author neolord
 */
export class ListHeaderForCell {
  /**
   * 문단 개수
   */
  private paraCount = 0;
  /**
   * 속성
   */
  private property: ListHeaderPropertyForCell;
  /**
   * 셀 주소(Column)
   */
  private colIndex = 0;
  /**
   * 셀 주소(Row)
   */
  private rowIndex = 0;
  /**
   * 열의 병합 개수
   */
  private colSpan = 0;
  /**
   * 행의 병합 개수
   */
  private rowSpan = 0;
  /**
   * 셀의 폭
   */
  private width = 0;
  /**
   * 셀의 높이
   */
  private height = 0;
  /**
   * 왼쪽 여백
   */
  private leftMargin = 0;
  /**
   * 오른쪽 여백
   */
  private rightMargin = 0;
  /**
   * 위쪽 여백
   */
  private topMargin = 0;
  /**
   * 아래쪽 여백
   */
  private bottomMargin = 0;
  /**
   * 참조된 테두리/배경 id
   */
  private borderFillId = 0;
  /**
   * 텍스트 폭
   */
  private textWidth = 0;
  /**
   * 필드 이름
   */
  private fieldName: string | null = null;

  /**
   * 생성자
   */
  public constructor() {
    this.property = new ListHeaderPropertyForCell();
  }

  /**
   * 문단 개수를 반환한다.
   *
   * @return 문단 개수
   */
  public getParaCount(): number {
    return this.paraCount;
  }

  /**
   * 문단 개수를 설정한다.
   *
   * @param paraCount 문단 개수
   */
  public setParaCount(paraCount: number): void {
    this.paraCount = paraCount;
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  public getProperty(): ListHeaderPropertyForCell {
    return this.property;
  }

  /**
   * 셀 주소(Column)을 반환한다.
   *
   * @return 셀 주소(Column)
   */
  public getColIndex(): number {
    return this.colIndex;
  }

  /**
   * 셀 주소(Column)를 설정한다.
   *
   * @param colIndex 셀 주소(Column)
   */
  public setColIndex(colIndex: number): void {
    this.colIndex = colIndex;
  }

  /**
   * 셀 주소(Row)를 반환한다.
   *
   * @return 셀 주소(Row)
   */
  public getRowIndex(): number {
    return this.rowIndex;
  }

  /**
   * 셀 주소(Row)를 설정한다.
   *
   * @param rowIndex 셀 주소(Row)
   */
  public setRowIndex(rowIndex: number): void {
    this.rowIndex = rowIndex;
  }

  /**
   * 열의 병합 개수를 반환한다.
   *
   * @return 열의 병합 개수
   */
  public getColSpan(): number {
    return this.colSpan;
  }

  /**
   * 열의 병합 개수를 설정한다.
   *
   * @param colSpan 열의 병합 개수
   */
  public setColSpan(colSpan: number): void {
    this.colSpan = colSpan;
  }

  /**
   * 행의 병합 개수를 반환한다.
   *
   * @return 행의 병합 개수
   */
  public getRowSpan(): number {
    return this.rowSpan;
  }

  /**
   * 행의 병합 개수를 설정한다.
   *
   * @param rowSpan 행의 병합 개수
   */
  public setRowSpan(rowSpan: number): void {
    this.rowSpan = rowSpan;
  }

  /**
   * 셀의 폭을 반환한다.
   *
   * @return 셀의 폭
   */
  public getWidth(): number {
    return this.width;
  }

  /**
   * 셀의 폭을 설정한다.
   *
   * @param width 셀의 폭
   */
  public setWidth(width: number): void {
    this.width = width;
  }

  /**
   * 셀의 높이를 반환한다.
   *
   * @return 셀의 높이
   */
  public getHeight(): number {
    return this.height;
  }

  /**
   * 셀의 높이을 설정한다.
   *
   * @param height 셀의 높이
   */
  public setHeight(height: number): void {
    this.height = height;
  }

  /**
   * 왼쪽 여백의 크기를 반환한다.
   *
   * @return 왼쪽 여백의 크기
   */
  public getLeftMargin(): number {
    return this.leftMargin;
  }

  /**
   * 왼쪽 여백의 크기를 설정한다.
   *
   * @param leftMargin 왼쪽 여백의 크기
   */
  public setLeftMargin(leftMargin: number): void {
    this.leftMargin = leftMargin;
  }

  /**
   * 오른쪽 여백의 크기를 반환한다.
   *
   * @return 오른쪽 여백의 크기
   */
  public getRightMargin(): number {
    return this.rightMargin;
  }

  /**
   * 오른쪽 여백의 크기를 설정한다.
   *
   * @param rightMargin 오른쪽 여백의 크기
   */
  public setRightMargin(rightMargin: number): void {
    this.rightMargin = rightMargin;
  }

  /**
   * 위쪽 여백의 크기를 반환한다.
   *
   * @return 위쪽 여백의 크기
   */
  public getTopMargin(): number {
    return this.topMargin;
  }

  /**
   * 위쪽 여백의 크기를 설정한다.
   *
   * @param topMargin 위쪽 여백의 크기
   */
  public setTopMargin(topMargin: number): void {
    this.topMargin = topMargin;
  }

  /**
   * 아래쪽 여백의 크기를 반환한다.
   *
   * @return 아래쪽 여백의 크기
   */
  public getBottomMargin(): number {
    return this.bottomMargin;
  }

  /**
   * 아래쪽 여백의 크기를 설정한다.
   *
   * @param bottomMargin 아래쪽 여백의 크기
   */
  public setBottomMargin(bottomMargin: number): void {
    this.bottomMargin = bottomMargin;
  }

  /**
   * 참조된 테두리/배경 id를 반환한다.
   *
   * @return 참조된 테두리/배경 id
   */
  public getBorderFillId(): number {
    return this.borderFillId;
  }

  /**
   * 참조된 테두리/배경 id를 설정한다.
   *
   * @param borderFillId 참조된 테두리/배경 id
   */
  public setBorderFillId(borderFillId: number): void {
    this.borderFillId = borderFillId;
  }

  /**
   * 텍스트 폭을 반환한다.
   *
   * @return 텍스트 폭
   */
  public getTextWidth(): number {
    return this.textWidth;
  }

  /**
   * 텍스트 폭을 설정한다.
   *
   * @param textWidth 텍스트 폭
   */
  public setTextWidth(textWidth: number): void {
    this.textWidth = textWidth;
  }

  /**
   * 필드 이름을 반환한다.
   *
   * @return 필드 이름
   */
  public getFieldName(): string | null {
    return this.fieldName;
  }

  /**
   * 필드 이름을 설정한다.
   *
   * @param fieldName 필드 이름
   */
  public setFieldName(fieldName: string | null): void {
    this.fieldName = fieldName;
  }

  public copy(from: ListHeaderForCell): void {
    this.paraCount = from.paraCount;
    this.property.copy(from.property);
    this.colIndex = from.colIndex;
    this.rowIndex = from.rowIndex;
    this.colSpan = from.colSpan;
    this.rowSpan = from.rowSpan;
    this.width = from.width;
    this.height = from.height;
    this.leftMargin = from.leftMargin;
    this.rightMargin = from.rightMargin;
    this.topMargin = from.topMargin;
    this.bottomMargin = from.bottomMargin;
    this.borderFillId = from.borderFillId;
    this.textWidth = from.textWidth;
    this.fieldName = from.fieldName;
  }
}
