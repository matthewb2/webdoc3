import { ControlType } from "../../control/ControlType.js";
import { CtrlID } from "../../control/ctrlheader/CtrlID.js";
import { HWPChar } from "./HWPChar.js";
import { HWPCharType } from "./HWPCharType.js";

/**
 * 확장 컨트롤 Character
 *
 * @author neolord
 */
export class HWPCharControlExtend extends HWPChar {
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
    return HWPCharType.ControlExtend;
  }

  /**
   * 컨트롤 객체의 Instance Id를 반환한다.
   *
   * @return 컨트롤 객체의 Instance Id
   */
  getInstanceId(): string {
    let bufferIndex = 0;
    let insert = false;
    const buf = new Uint8Array(this.addition!.length);
    for (let index = this.addition!.length - 1; index >= 0; index--) {
      if (this.addition![index] !== 0) {
        insert = true;
      }

      if (insert === true) {
        buf[bufferIndex++] = this.addition![index]!;
      }
    }
    return new TextDecoder().decode(buf.subarray(0, bufferIndex));
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

  isSectionDefine(): boolean {
    if (this.getCode() === 0x0002 && this.hasAddition("s", "e", "c", "d")) {
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

  isColumnDefine(): boolean {
    if (this.getCode() === 0x0002 && this.hasAddition("c", "o", "l", "d")) {
      return true;
    }
    return false;
  }

  isFieldStart(): boolean {
    if (this.getCode() === 0x0003 && this.addition !== null) {
      const ctrlID = CtrlID.make(
        this.addition[3]!,
        this.addition[2]!,
        this.addition[1]!,
        this.addition[0]!,
      );
      return ControlType.isField(ctrlID);
    }
    return false;
  }

  isHyperlinkStart(): boolean {
    if (this.getCode() === 0x0003 && this.hasAddition("%", "h", "l", "k")) {
      return true;
    }
    return false;
  }

  isTable(): boolean {
    if (this.getCode() === 0x000b && this.hasAddition("t", "b", "l", " ")) {
      return true;
    }
    return false;
  }

  isGSO(): boolean {
    if (this.getCode() === 0x000b && this.hasAddition("g", "s", "o", " ")) {
      return true;
    }
    return false;
  }

  isEquation(): boolean {
    if (this.getCode() === 0x000b && this.hasAddition("e", "q", "e", "d")) {
      return true;
    }
    return false;
  }

  isForm(): boolean {
    if (this.getCode() === 0x000b && this.hasAddition("f", "o", "r", "m")) {
      return true;
    }
    return false;
  }

  isHiddenComment(): boolean {
    if (this.getCode() === 0x000f && this.hasAddition("t", "c", "m", "t")) {
      return true;
    }
    return false;
  }

  isHeader(): boolean {
    if (this.getCode() === 0x0010 && this.hasAddition("h", "e", "a", "d")) {
      return true;
    }
    return false;
  }

  isFooter(): boolean {
    if (this.getCode() === 0x0010 && this.hasAddition("f", "o", "o", "t")) {
      return true;
    }
    return false;
  }

  isFootNote(): boolean {
    if (this.getCode() === 0x11 && this.hasAddition("f", "n", " ", " ")) {
      return true;
    }
    return false;
  }

  isEndNote(): boolean {
    if (this.getCode() === 0x11 && this.hasAddition("e", "n", " ", " ")) {
      return true;
    }
    return false;
  }

  isAutoNumber(): boolean {
    if (this.getCode() === 0x12 && this.hasAddition("a", "t", "n", "o")) {
      return true;
    }
    return false;
  }

  isPageHide(): boolean {
    if (this.getCode() === 0x15 && this.hasAddition("p", "g", "h", "d")) {
      return true;
    }
    return false;
  }

  isPageOddEvenAdjust(): boolean {
    if (this.getCode() === 0x15 && this.hasAddition("p", "g", "c", "t")) {
      return true;
    }
    return false;
  }

  isPageNumberPosition(): boolean {
    if (this.getCode() === 0x15 && this.hasAddition("p", "g", "n", "p")) {
      return true;
    }
    return false;
  }

  isIndexMark(): boolean {
    if (this.getCode() === 0x0016 && this.hasAddition("i", "d", "x", "m")) {
      return true;
    }
    return false;
  }

  isBookmark(): boolean {
    if (this.getCode() === 0x0016 && this.hasAddition("b", "o", "k", "m")) {
      return true;
    }
    return false;
  }

  isAdditionalText(): boolean {
    if (this.getCode() === 0x0017 && this.hasAddition("t", "d", "u", "t")) {
      return true;
    }
    return false;
  }

  isOverlappingLetter(): boolean {
    if (this.getCode() === 0x0017 && this.hasAddition("t", "c", "p", "s")) {
      return true;
    }
    return false;
  }

  override clone(): HWPChar {
    const cloned = new HWPCharControlExtend();
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
}
