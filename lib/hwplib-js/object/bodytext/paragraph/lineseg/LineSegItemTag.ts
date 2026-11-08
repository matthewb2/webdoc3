import { BitFlag } from "../../../../util/binary/BitFlag.js";

/**
 * 각 중의 align 정보의 태그 정보에 대한 객체
 *
 * @author neolord
 */
export class LineSegItemTag {
  /**
   * 파일에 저장되는 값 (unsigned 4 byte)
   */
  private value = 0;

  /**
   * 생성자
   */
  constructor() {}

  /**
   * 파일에 저장되는 값을 반환한다.
   *
   * @return 파일에 저장되는 값
   */
  getValue(): number {
    return this.value;
  }

  /**
   * 파일에 저장되는 값을 설정한다.
   *
   * @param value 파일에 저장되는 값
   */
  setValue(value: number): void {
    this.value = value;
  }

  /**
   * 페이지의 첫 줄인지 여부를 반환한다. (0 bit)
   *
   * @return 페이지의 첫 줄인지 여부
   */
  isFirstLineAtPage(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 페이지의 첫 줄인지 여부를 설정한다. (0 bit)
   *
   * @param firstLineAtPage 페이지의 첫 줄인지 여부
   */
  setFirstLineAtPage(firstLineAtPage: boolean): void {
    this.value = BitFlag.set(this.value, 0, firstLineAtPage);
  }

  /**
   * 컬럼의 첫 줄인지 여부를 반환한다. (1 bit)
   *
   * @return 컬럼의 첫 줄인지 여부
   */
  isFirstLineAtColumn(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 컬럼의 첫 줄인지 여부를 설정한다. (1 bit)
   *
   * @param firstLineAtColumn 컬럼의 첫 줄인지 여부
   */
  setFirstLineAtColumn(firstLineAtColumn: boolean): void {
    this.value = BitFlag.set(this.value, 1, firstLineAtColumn);
  }

  /**
   * 텍스트가 배열되지 않은 빈 세그먼트인지 여부를 반환한다. (16 bit)
   *
   * @return 텍스트가 배열되지 않은 빈 세그먼트인지 여부
   */
  isEmptySegment(): boolean {
    return BitFlag.get(this.value, 16);
  }

  /**
   * 텍스트가 배열되지 않은 빈 세그먼트인지 여부를 설정한다. (16 bit)
   *
   * @param emptySegment 텍스트가 배열되지 않은 빈 세그먼트인지 여부
   */
  setEmptySegment(emptySegment: boolean): void {
    this.value = BitFlag.set(this.value, 16, emptySegment);
  }

  /**
   * 줄의 첫 세그먼트인지 여부를 반환한다. (17 bit)
   *
   * @return 줄의 첫 세그먼트인지 여부
   */
  getFirstSegmentAtLine(): boolean {
    return BitFlag.get(this.value, 17);
  }

  /**
   * 줄의 첫 세그먼트인지 여부를 설정한다. (17 bit)
   *
   * @param firstSegmentAtLine 줄의 첫 세그먼트인지 여부
   */
  setFirstSegmentAtLine(firstSegmentAtLine: boolean): void {
    this.value = BitFlag.set(this.value, 17, firstSegmentAtLine);
  }

  /**
   * 줄의 마지막 세그먼트인지 여부를 반환한다. (18 bit)
   *
   * @return 줄의 마지막 세그먼트인지 여부
   */
  getLastSegmentAtLine(): boolean {
    return BitFlag.get(this.value, 18);
  }

  /**
   * 줄의 마지막 세그먼트인지 여부를 설정한다. (18 bit)
   *
   * @param lastSegmentAtLine 줄의 마지막 세그먼트인지 여부
   */
  setLastSegmentAtLine(lastSegmentAtLine: boolean): void {
    this.value = BitFlag.set(this.value, 18, lastSegmentAtLine);
  }

  /**
   * 줄의 마지막에 auto-hyphenation이 수행되었는지 여부를 반환한다. (19 bit)
   *
   * @return 줄의 마지막에 auto-hyphenation이 수행되었는지 여부
   */
  isAutoHyphenation(): boolean {
    return BitFlag.get(this.value, 19);
  }

  /**
   * 줄의 마지막에 auto-hyphenation이 수행되었는지 여부를 설정한다. (19 bit)
   *
   * @param autoHyphenation 줄의 마지막에 auto-hyphenation이 수행되었는지 여부
   */
  setAutoHyphenation(autoHyphenation: boolean): void {
    this.value = BitFlag.set(this.value, 19, autoHyphenation);
  }

  /**
   * indentation 적용 여부를 반환한다. (20 bit)
   *
   * @return indentation 적용 여부
   */
  isAdjustIndentation(): boolean {
    return BitFlag.get(this.value, 20);
  }

  /**
   * indentation 적용 여부를 설정한다. (20 bit)
   *
   * @param adjustIndentation indentation 적용 여부
   */
  setAdjustIndentation(adjustIndentation: boolean): void {
    this.value = BitFlag.set(this.value, 20, adjustIndentation);
  }

  /**
   * 문단 머리 모양 적용 여부를 반환한다. (21 bit)
   *
   * @return 문단 머리 모양 적용 여부
   */
  isAdjustBullet(): boolean {
    return BitFlag.get(this.value, 21);
  }

  /**
   * 문단 머리 모양 적용 여부를 설정한다. (21 bit)
   *
   * @param adjustBullet 문단 머리 모양 적용 여부
   */
  setAdjustBullet(adjustBullet: boolean): void {
    this.value = BitFlag.set(this.value, 21, adjustBullet);
  }

  /**
   * 구현상의 편의를 위한 property를 반환한다. (31 bit)
   *
   * @return 구현상의 편의를 위한 property
   */
  getBit31(): boolean {
    return BitFlag.get(this.value, 31);
  }

  /**
   * 구현상의 편의를 위한 property를 설정한다. (bit 31)
   *
   * @param bit31 구현상의 편의를 위한 property
   */
  setBit31(bit31: boolean): void {
    this.value = BitFlag.set(this.value, 31, bit31);
  }

  copy(from: LineSegItemTag): void {
    this.value = from.value;
  }
}
