import { HWPChar } from "./HWPChar.js";
import { HWPCharControlChar } from "./HWPCharControlChar.js";
import { HWPCharControlExtend } from "./HWPCharControlExtend.js";
import { HWPCharControlInline } from "./HWPCharControlInline.js";
import { HWPCharNormal } from "./HWPCharNormal.js";
import { HWPCharType } from "./HWPCharType.js";

/**
 * 문단의 텍스트 레코드
 *
 * @author neolord
 */
export class ParaText {
  /**
   * 글자(Character) 리스트
   */
  private charList: HWPChar[];

  /**
   * 생성자
   */
  constructor() {
    this.charList = [];
  }

  /**
   * 새로운 [일반 Character]를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 [일반 Character]
   */
  addNewNormalChar(): HWPCharNormal {
    const nc = new HWPCharNormal();
    this.charList.push(nc);
    return nc;
  }

  insertNewNormalChar(position: number): HWPCharNormal {
    const nc = new HWPCharNormal();
    this.charList.splice(position, 0, nc);
    return nc;
  }

  /**
   * 새로운 [문자 컨트롤 Character]를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 [문자 컨트롤 Character]
   */
  addNewCharControlChar(): HWPCharControlChar {
    const ccc = new HWPCharControlChar();
    this.charList.push(ccc);
    return ccc;
  }

  /**
   * 새로운 [인라인 컨트롤 Character]를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 [인라인 컨트롤 Character]
   */
  addNewInlineControlChar(): HWPCharControlInline {
    const icc = new HWPCharControlInline();
    this.charList.push(icc);
    return icc;
  }

  /**
   * 새로운 [확장 컨트롤 Character]를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 [확장 컨트롤 Character]
   */
  addNewExtendControlChar(): HWPCharControlExtend {
    const ecc = new HWPCharControlExtend();
    this.charList.push(ecc);
    return ecc;
  }

  /**
   * 글자(Character) 리스트를 반환한다.
   *
   * @return 글자(Character) 리스트
   */
  getCharList(): HWPChar[] {
    return this.charList;
  }

  /**
   * 확장 컨트롤 Character 순번에 해당하는 글자의 문단 내의 순번을 반환한다.
   *
   * @param extendCharIndex 확장 컨트롤 Character 순번
   * @return 확장 컨트롤 Character 순번에 해당하는 글자의 문단 내의 순번
   */
  getCharIndexFromExtendCharIndex(extendCharIndex: number): number {
    let extendCharIndex2 = 0;
    const count = this.charList.length;
    for (let index = 0; index < count; index++) {
      if (this.charList[index]!.getType() === HWPCharType.ControlExtend) {
        if (extendCharIndex === extendCharIndex2) {
          return index;
        }
        extendCharIndex2++;
      }
    }
    return -1;
  }

  /**
   * startIndex 순번부터 코드가 charCode인 인라인 컨트롤 character의 순번을 반환한다.
   *
   * @param startIndex 검색을 시작할 순번
   * @param charCode   찾을 인라인 컨트롤 character의 코드
   * @return 인라인 컨트롤 character의 순번
   */
  getInlineCharIndex(startIndex: number, charCode: number): number {
    const count = this.charList.length;
    for (let index = startIndex; index < count; index++) {
      const ch = this.charList[index]!;
      if (ch.getType() === HWPCharType.ControlInline && ch.getCode() === charCode) {
        return index;
      }
    }
    return -1;
  }

  /**
   * startIndex 순번 부터 endIndex 순번 까지의 일반 Character의 문자열을 반환한다.
   *
   * @param startIndex 시작 순번
   * @param endIndex   끝 순번
   * @return startIndex 순번 부터 endIndex 순번 까지의 일반 Character의 문자열
   */
  getNormalString(startIndex: number, endIndex: number): string | null;
  /**
   * startIndex 순번 부터 끝까지의 일반 Character의 문자열을 반환한다
   *
   * @param startIndex 시작 순번
   * @return startIndex 순번 부터 끝까지의 일반 Character의 일반 Character의 문자열
   */
  getNormalString(startIndex: number): string | null;
  getNormalString(startIndex: number, endIndex?: number): string | null {
    if (endIndex === undefined) {
      return this.getNormalString(startIndex, this.charList.length - 1);
    }
    if (startIndex === endIndex) {
      return "";
    }
    if (startIndex > endIndex) {
      return null;
    }
    let sb = "";
    for (let index = startIndex; index <= endIndex; index++) {
      const ch = this.charList[index]!;
      if (ch.getType() === HWPCharType.Normal) {
        const chn = ch as HWPCharNormal;
        sb += chn.getCh();
      }
    }
    return sb;
  }

  /**
   * 문자열을 추가한다.
   *
   * @param str 추가할 문자열
   */
  addString(str: string): void {
    const len = str.length;
    for (let index = 0; index < len; index++) {
      const ch = this.addNewNormalChar();
      ch.setCode((str.codePointAt(index)! << 16) >> 16);
    }
    this.processEndOfParagraph();
  }

  /**
   * 문자열을 추가한다.
   *
   * @param str 추가할 문자열
   */
  insertString(position: number, str: string): number {
    const oldCharSize = this.getCharSize();

    const len = str.length;
    for (let index = 0; index < len; index++) {
      const ch = this.insertNewNormalChar(position + index);
      ch.setCode((str.codePointAt(index)! << 16) >> 16);
    }
    this.processEndOfParagraph();

    return this.getCharSize() - oldCharSize;
  }

  /**
   * 구역 정의 컨트롤를 추가하기 위한  확장 컨트롤 문자를 추가한다.
   */
  addExtendCharForSectionDefine(): void {
    const chExtend = this.addNewExtendControlChar();
    chExtend.setCode(0x0002);
    const addition = new Uint8Array(12);
    addition[3] = "s".charCodeAt(0);
    addition[2] = "e".charCodeAt(0);
    addition[1] = "c".charCodeAt(0);
    addition[0] = "d".charCodeAt(0);
    try {
      chExtend.setAddition(addition);
    } catch {
      // TODO Auto-generated catch block (was e.printStackTrace())
    }
    this.processEndOfParagraph();
  }

  /**
   * 문단 끝을 나타내는 문자를 찾아서 마지막으로 보낸다.
   */
  private processEndOfParagraph(): void {
    for (const ch of this.charList) {
      if (ch.getCode() === 0x0d /*para break*/) {
        const index = this.charList.indexOf(ch);
        this.charList.splice(index, 1);
        break;
      }
    }

    const ch2 = this.addNewNormalChar();
    ch2.setCode(0x0d);
  }

  /**
   * 단 정의 컨트롤를 추가하기 위한  확장 컨트롤 문자를 추가한다.
   */
  addExtendCharForColumnDefine(): void {
    const chExtend = this.addNewExtendControlChar();
    chExtend.setCode(0x0002);
    const addition = new Uint8Array(12);
    addition[3] = "c".charCodeAt(0);
    addition[2] = "o".charCodeAt(0);
    addition[1] = "l".charCodeAt(0);
    addition[0] = "d".charCodeAt(0);
    try {
      chExtend.setAddition(addition);
    } catch {
      // TODO Auto-generated catch block (was e.printStackTrace())
    }
    this.processEndOfParagraph();
  }

  /**
   * 표 컨트롤를 추가하기 위한  확장 컨트롤 문자를 추가한다.
   */
  addExtendCharForTable(): void {
    const chExtend = this.addNewExtendControlChar();
    chExtend.setCode(0x000b);
    const addition = new Uint8Array(12);
    addition[3] = "t".charCodeAt(0);
    addition[2] = "b".charCodeAt(0);
    addition[1] = "l".charCodeAt(0);
    addition[0] = " ".charCodeAt(0);
    try {
      chExtend.setAddition(addition);
    } catch {
      // TODO Auto-generated catch block (was e.printStackTrace())
    }
    this.processEndOfParagraph();
  }

  /**
   * 그리기 개체 컨트롤를 추가하기 위한  확장 컨트롤 문자를 추가한다.
   */
  addExtendCharForGSO(): void {
    const chExtend = this.addNewExtendControlChar();
    chExtend.setCode(0x000b);
    const addition = new Uint8Array(12);
    addition[3] = "g".charCodeAt(0);
    addition[2] = "s".charCodeAt(0);
    addition[1] = "o".charCodeAt(0);
    addition[0] = " ".charCodeAt(0);
    try {
      chExtend.setAddition(addition);
    } catch {
      // TODO Auto-generated catch block (was e.printStackTrace())
    }
    this.processEndOfParagraph();
  }

  /**
   * 하이퍼 링크의 시작을 위한 확장 컨트롤 문자를 추가한다.
   */
  addExtendCharForHyperlinkStart(): void {
    const chExtend = this.addNewExtendControlChar();
    chExtend.setCode(0x0003);
    const addition = new Uint8Array(12);
    addition[3] = "%".charCodeAt(0);
    addition[2] = "h".charCodeAt(0);
    addition[1] = "l".charCodeAt(0);
    addition[0] = "k".charCodeAt(0);
    try {
      chExtend.setAddition(addition);
    } catch {
      // TODO Auto-generated catch block (was e.printStackTrace())
    }
    this.processEndOfParagraph();
  }

  /**
   * 하이퍼 링크의 끝을 위한 확장 컨트롤 문자를 추가한다.
   */
  addExtendCharForHyperlinkEnd(): void {
    const chExtend = this.addNewInlineControlChar();
    chExtend.setCode(0x0004);
    const addition = new Uint8Array(12);
    addition[3] = "%".charCodeAt(0);
    addition[2] = "h".charCodeAt(0);
    addition[1] = "l".charCodeAt(0);
    addition[0] = "k".charCodeAt(0);
    try {
      chExtend.setAddition(addition);
    } catch {
      // TODO Auto-generated catch block (was e.printStackTrace())
    }
    this.processEndOfParagraph();
  }

  /**
   * 머리말을 위한 확장 컨트롤 문자를 추가한다.
   */
  addExtendCharForHeader(): void {
    const chExtend = this.addNewExtendControlChar();
    chExtend.setCode(0x0010);
    const addition = new Uint8Array(12);
    addition[3] = "h".charCodeAt(0);
    addition[2] = "e".charCodeAt(0);
    addition[1] = "a".charCodeAt(0);
    addition[0] = "d".charCodeAt(0);
    try {
      chExtend.setAddition(addition);
    } catch {
      // TODO Auto-generated catch block (was e.printStackTrace())
    }

    this.processEndOfParagraph();
  }

  /**
   * 머리말을 위한 확장 컨트롤 문자를 추가한다.
   */
  addExtendCharForFooter(): void {
    const chExtend = this.addNewExtendControlChar();
    chExtend.setCode(0x0010);
    const addition = new Uint8Array(12);
    addition[3] = "f".charCodeAt(0);
    addition[2] = "o".charCodeAt(0);
    addition[1] = "o".charCodeAt(0);
    addition[0] = "t".charCodeAt(0);
    try {
      chExtend.setAddition(addition);
    } catch {
      // TODO Auto-generated catch block (was e.printStackTrace())
    }
    this.processEndOfParagraph();
  }

  clone(): ParaText {
    const cloned = new ParaText();
    for (const hwpChar of this.charList) {
      cloned.charList.push(hwpChar.clone());
    }
    return cloned;
  }

  getCharSize(): number {
    let length = 0;
    for (const hwpChar of this.charList) {
      length += hwpChar.getCharSize();
    }
    return length;
  }
}
