import { HWPChar } from "./HWPChar.js";
import { HWPCharType } from "./HWPCharType.js";

/**
 * 일반 Character
 *
 * @author neolord
 */
export class HWPCharNormal extends HWPChar {
  /**
   * 생성자
   */
  constructor(code?: number) {
    super();
    if (code !== undefined) {
      this.code = code;
    }
  }

  /**
   * 글자의 종류을 반환한다.
   *
   * @return 글자의 타입
   */
  override getType(): HWPCharType {
    return HWPCharType.Normal;
  }

  /**
   * 글자를 반환한다.
   *
   * @return 글자
   */
  getCh(): string {
    return this.intToString(this.code);
  }

  /**
   * 2 byte 문자코드를 문자열로 변환한다.
   *
   * @param code 2 byte 문자코드
   * @return 변환된 문자열
   */
  private intToString(code: number): string {
    const ch = new Uint8Array(2);
    ch[0] = code & 0xff;
    ch[1] = (code >> 8) & 0xff;
    return new TextDecoder("utf-16le").decode(ch);
  }

  override clone(): HWPChar {
    const cloned = new HWPCharNormal();
    cloned.code = this.code;
    return cloned;
  }

  override getCharSize(): number {
    return 1;
  }
}
