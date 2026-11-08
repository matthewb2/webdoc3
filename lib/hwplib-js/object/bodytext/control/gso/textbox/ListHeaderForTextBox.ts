import { ListHeaderProperty } from "./ListHeaderProperty.js";

/**
 * 글상자를 위한 문단 리스트 헤더 레코드
 *
 * @author neolord
 */
export class ListHeaderForTextBox {
  /**
   * 문단 개수
   */
  private paraCount = 0;
  /**
   * 속성
   */
  private property: ListHeaderProperty;
  /**
   * 글상자 텍스트 왼쪽 여백
   */
  private leftMargin = 0;
  /**
   * 글상자 텍스트 오른쪽 여백
   */
  private rightMargin = 0;
  /**
   * 글상자 텍스트 위쪽 여백
   */
  private topMargin = 0;
  /**
   * 글상자 텍스트 아래쪽 여백
   */
  private bottomMargin = 0;
  /**
   * 텍스트 문자열의 최대 폭
   */
  private textWidth = 0;
  /**
   * 양식 모드에서 편집 가능
   */
  private editableAtFormMode = false;
  /**
   * 필드 이름
   */
  private fieldName: string | null = null;

  /**
   * 생성자
   */
  constructor() {
    this.property = new ListHeaderProperty();
  }

  /**
   * 문단 개수를 반환한다.
   *
   * @return 문단 개수
   */
  getParaCount(): number {
    return this.paraCount;
  }

  /**
   * 문단 개수를 설정한다.
   *
   * @param paraCount
   */
  setParaCount(paraCount: number): void {
    this.paraCount = paraCount;
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  getProperty(): ListHeaderProperty {
    return this.property;
  }

  /**
   * 글상자 텍스트 왼쪽 여백의 크기를 반환한다.
   *
   * @return 글상자 텍스트 왼쪽 여백의 크기
   */
  getLeftMargin(): number {
    return this.leftMargin;
  }

  /**
   * 글상자 텍스트 왼쪽 여백의 크기를 설정한다.
   *
   * @param leftMargin 글상자 텍스트 왼쪽 여백의 크기
   */
  setLeftMargin(leftMargin: number): void {
    this.leftMargin = leftMargin;
  }

  /**
   * 글상자 텍스트 오른쪽 여백의 크기를 반환한다.
   *
   * @return 글상자 텍스트 오른쪽 여백의 크기
   */
  getRightMargin(): number {
    return this.rightMargin;
  }

  /**
   * 글상자 텍스트 오른쪽 여백의 크기를 설정한다.
   *
   * @param rightMargin 글상자 텍스트 오른쪽 여백의 크기
   */
  setRightMargin(rightMargin: number): void {
    this.rightMargin = rightMargin;
  }

  /**
   * 글상자 텍스트 위쪽 여백의 크기를 반환한다.
   *
   * @return 글상자 텍스트 위쪽 여백의 크기
   */
  getTopMargin(): number {
    return this.topMargin;
  }

  /**
   * 글상자 텍스트 위쪽 여백의 크기를 설정한다.
   *
   * @param topMargin 글상자 텍스트 위쪽 여백의 크기
   */
  setTopMargin(topMargin: number): void {
    this.topMargin = topMargin;
  }

  /**
   * 글상자 텍스트 아래쪽 여백의 크기를 반환한다.
   *
   * @return 글상자 텍스트 아래쪽 여백의 크기
   */
  getBottomMargin(): number {
    return this.bottomMargin;
  }

  /**
   * 글상자 텍스트 아래쪽 여백의 크기를 설정한다.
   *
   * @param bottomMargin 글상자 텍스트 아래쪽 여백의 크기
   */
  setBottomMargin(bottomMargin: number): void {
    this.bottomMargin = bottomMargin;
  }

  /**
   * 텍스트 문자열의 최대 폭을 반환한다.
   *
   * @return 텍스트 문자열의 최대 폭
   */
  getTextWidth(): number {
    return this.textWidth;
  }

  /**
   * 텍스트 문자열의 최대 폭을 설정한다.
   *
   * @param textWidth 텍스트 문자열의 최대 폭
   */
  setTextWidth(textWidth: number): void {
    this.textWidth = textWidth;
  }

  /**
   * 양식 모드에서 편집 가능 여부를 반환한다.
   *
   * @return 양식 모드에서 편집 가능 여부
   */
  isEditableAtFormMode(): boolean {
    return this.editableAtFormMode;
  }

  /**
   * 양식 모드에서 편집 가능 여부를 설정한다.
   *
   * @param editableAtFormMode 양식 모드에서 편집 가능 여부
   */
  setEditableAtFormMode(editableAtFormMode: boolean): void {
    this.editableAtFormMode = editableAtFormMode;
  }

  /**
   * 필드 이름을 반환한다.
   *
   * @return 필드 이름
   */
  getFieldName(): string | null {
    return this.fieldName;
  }

  /**
   * 필드 이름을 설정한다.
   *
   * @param fieldName 필드 이름
   */
  setFieldName(fieldName: string | null): void {
    this.fieldName = fieldName;
  }

  copy(from: ListHeaderForTextBox): void {
    this.paraCount = from.paraCount;
    this.property.copy(from.property);
    this.leftMargin = from.leftMargin;
    this.rightMargin = from.rightMargin;
    this.topMargin = from.topMargin;
    this.bottomMargin = from.bottomMargin;
    this.textWidth = from.textWidth;
    this.editableAtFormMode = from.editableAtFormMode;
    this.fieldName = from.fieldName;
  }
}
