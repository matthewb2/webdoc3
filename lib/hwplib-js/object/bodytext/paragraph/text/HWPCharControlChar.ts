import { HWPChar } from "./HWPChar.js";
import { HWPCharType } from "./HWPCharType.js";

/**
 * 문자 컨트롤 Character
 *
 * @author neolord
 */
export class HWPCharControlChar extends HWPChar {
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
    return HWPCharType.ControlChar;
  }

  /**
   * 문자 코드를 설정한다.
   *
   * @param code 문자 코드 또는 문자열
   */
  override setCode(code: number): void;
  override setCode(ch: string): void;
  override setCode(arg: number | string): void {
    if (typeof arg === "number") {
      super.setCode(arg);
      return;
    }
    const b = HWPCharControlChar.getBytesUTF16LE(arg);
    if (b.length >= 2) {
      this.setCode(((b[1]! & 0xff) << 8) | (b[0]! & 0xff));
    } else if (b.length === 1) {
      this.setCode(b[0]! & 0xff);
    } else {
      this.setCode(0);
    }
  }

  private static getBytesUTF16LE(ch: string): Uint8Array {
    const b = new Uint8Array(ch.length * 2);
    for (let i = 0; i < ch.length; i++) {
      const c = ch.charCodeAt(i);
      b[i * 2] = c & 0xff;
      b[i * 2 + 1] = (c >> 8) & 0xff;
    }
    return b;
  }

  override clone(): HWPChar {
    const cloned = new HWPCharControlChar();
    cloned.code = this.code;
    return cloned;
  }

  override getCharSize(): number {
    return 1;
  }
}
