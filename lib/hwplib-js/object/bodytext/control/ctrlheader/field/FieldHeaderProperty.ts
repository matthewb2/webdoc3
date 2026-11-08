import { BitFlag } from "../../../../../util/binary/BitFlag.js";

/**
 * 필드 컨트롤의 속성을 나타내는 객체
 *
 * @author neolord
 */
export class FieldHeaderProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 파일에 저장되는 정수값을 반롼한다.
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
   * 읽기 전용 상태에서도 수정 가능한지 여부을 반환한다. (0 bit)
   *
   * @return 읽기 전용 상태에서도 수정 가능한지 여부
   */
  public canModifyInReadOnlyState(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 읽기 전용 상태에서도 수정 가능한지 여부를 설정한다. (0 bit)
   *
   * @param canModifyInReadOnlyState 읽기 전용 상태에서도 수정 가능한지 여부
   */
  public setCanModifyInReadOnlyState(canModifyInReadOnlyState: boolean): void {
    this.value = BitFlag.set(this.value, 0, canModifyInReadOnlyState);
  }

  /**
   * 열어보지 않은 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부를 반환한다. (11 bit)
   *
   * @return 열어보지 않은 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부
   */
  public isUpdateTextPropertyAtUpdatingHyperlinkNotOpened(): boolean {
    return BitFlag.get(this.value, 11);
  }

  /**
   * 열어보지 않은 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부를 설정한다. (11 bit)
   *
   * @param updateTextPropertyAtUpdatingHyperlinkNotOpened 열어보지 않은 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부
   */
  public setUpdateTextPropertyAtUpdatingHyperlinkNotOpened(
    updateTextPropertyAtUpdatingHyperlinkNotOpened: boolean,
  ): void {
    this.value = BitFlag.set(this.value, 11, updateTextPropertyAtUpdatingHyperlinkNotOpened);
  }

  /**
   * 열어본 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부를 반환한다. (12 bit)
   *
   * @return 열어본 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부
   */
  public isUpdateTextPropertyAtUpdatingHyperlinkOpened(): boolean {
    return BitFlag.get(this.value, 12);
  }

  /**
   * 열어본 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부를 설정한다. (12 bit)
   *
   * @param updateTextPropertyAtUpdatingHyperlinkOpened 열어본 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부
   */
  public setUpdateTextPropertyAtUpdatingHyperlinkOpened(
    updateTextPropertyAtUpdatingHyperlinkOpened: boolean,
  ): void {
    this.value = BitFlag.set(this.value, 12, updateTextPropertyAtUpdatingHyperlinkOpened);
  }

  /**
   * 생성된 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부를 반환한다. (13 bit)
   *
   * @return 생성된 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부
   */
  public isUpdateTextPropertyAtUpdatingHyperlinkCreating(): boolean {
    return BitFlag.get(this.value, 13);
  }

  /**
   * 생성된 하이퍼링크 필드 업데이트 시 글자 속성 업데이트 여부를 설정한다. (13 bit)
   *
   * @param updateTextPropertyAtUpdatingHyperlinkCreating
   */
  public setUpdateTextPropertyAtUpdatingHyperlinkCreating(
    updateTextPropertyAtUpdatingHyperlinkCreating: boolean,
  ): void {
    this.value = BitFlag.set(this.value, 13, updateTextPropertyAtUpdatingHyperlinkCreating);
  }

  /**
   * 필드 내용이 수정되었는지 여부를 반환한다. (15 bit)
   *
   * @return 필드 내용이 수정되었는지 여부
   */
  public isModifiedContent(): boolean {
    return BitFlag.get(this.value, 15);
  }

  /**
   * 필드 내용이 수정되었는지 여부를 설정한다. (15 bit)
   *
   * @param modifiedContent 필드 내용이 수정되었는지 여부
   */
  public setModifiedContent(modifiedContent: boolean): void {
    this.value = BitFlag.set(this.value, 15, modifiedContent);
  }

  public copy(from: FieldHeaderProperty): void {
    this.value = from.value;
  }
}
