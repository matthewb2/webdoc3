import { HWPChar } from "./HWPChar.js";
import { HWPCharType } from "./HWPCharType.js";

/**
 * 인라인 컨트롤 character
 *
 * @author neolord
 */
export class HWPCharControlInline extends HWPChar {
  /**
   * 추가 정보
   */
  private addition: Uint8Array | null = null;

  /**
   * 생성자
   */
  constructor() {
    super();
  }

  /**
   * 글자의 종류을 반환한다.
   *
   * @return 글자의 타입
   */
  override getType(): HWPCharType {
    return HWPCharType.ControlInline;
  }

  /**
   * 추가 정보를 반환한다.
   *
   * @return 추가 정보
   */
  getAddition(): Uint8Array | null {
    return this.addition;
  }

  /**
   * 추가 정보를 설정한다.
   *
   * @param addition 추가 정보
   */
  setAddition(addition: Uint8Array): void {
    if (addition.length !== 12) {
      throw new Error("addition's length must be 12");
    }
    this.addition = addition;
  }

  override clone(): HWPChar {
    const cloned = new HWPCharControlInline();
    cloned.code = this.code;

    if (this.addition !== null) {
      cloned.addition = this.addition.slice();
    } else {
      cloned.addition = null;
    }

    return cloned;
  }

  override getCharSize(): number {
    return 8;
  }

  isHyperlinkEnd(): boolean {
    if (this.getCode() === 0x0004 && this.hasAddition("%", "h", "l", "k")) {
      return true;
    }
    return false;
  }

  private hasAddition(byte1: string, byte2: string, byte3: string, byte4: string): boolean {
    if (
      this.addition !== null &&
      this.addition[3] === byte1.charCodeAt(0) &&
      this.addition[2] === byte2.charCodeAt(0) &&
      this.addition[1] === byte3.charCodeAt(0) &&
      this.addition[0] === byte4.charCodeAt(0)
    ) {
      return true;
    }
    return false;
  }
}
