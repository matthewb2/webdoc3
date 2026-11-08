import { HWPCharType } from "./HWPCharType.js";

/**
 * ParaText에 저장되는 글자를 나타내는 추상 객체
 *
 * @author neolord
 */
export abstract class HWPChar {
  /**
   * 믄자 코드
   */
  protected code = 0;

  /**
   * 글자의 종류을 반환한다.
   *
   * @return 글자의 타입
   */
  abstract getType(): HWPCharType;

  /**
   * code에 해당되는 글자의 종류를 반환한다.
   *
   * @param code utf16le 문자열을 구성하는 unsigned 2 byte 한 글자
   * @return code에 해당되는 글자의 종류
   */
  static type(code: number): HWPCharType {
    if (code > 31) {
      return HWPCharType.Normal;
    }
    switch (code) {
      case 1: // 예약
      case 2: // 구역 정의/단 정의
      case 3: // 필드 시작(누름틀, 하이퍼링크, 블록 책갈피, 표 계산식 ...)
      case 11: // 그리기 개체/표/수식/양식 개체
      case 12: // 예약
      case 14: // 예약
      case 15: // 숨은 설명
      case 16: // 머리말/꼬리말
      case 17: // 각주/미주
      case 18: // 자동번호(각주, 표 등)
      case 21: // 페이지 컨트롤(감추기, 새 번호로 시작 등)
      case 22: // 책갈피/찾아보기 표식
      case 23: // 덧말/글자 겹침
        return HWPCharType.ControlExtend;
      case 4: // 필드 끝
      case 5: // 예약
      case 6: // 예약
      case 7: // 예약
      case 8: // title mark
      case 9: // 탭
      case 19: // 예약
      case 20: // 예약
        return HWPCharType.ControlInline;
      case 0: // unusable
      case 10: // 한 줄 끝(line break)
      case 13: // 문단 끝(para break)
      case 24: // 하이픈
      case 25: // 예약
      case 26: // 예약
      case 27: // 예약
      case 28: // 예약
      case 29: // 예약
      case 30: // 묶음 빈칸
      case 31: // 고정폭 빈칸
        return HWPCharType.ControlChar;
    }
    return HWPCharType.Normal;
  }

  /**
   * 문자 코드를 반환한다.
   *
   * @return 문자 코드
   */
  getCode(): number {
    return this.code;
  }

  /**
   * 문자 코드를 설정한다.
   *
   * @param code 문자 코드
   */
  setCode(code: number): void {
    this.code = code;
  }

  abstract clone(): HWPChar;

  abstract getCharSize(): number;

  isSpace(): boolean {
    return this.code === 32;
  }

  isHangul(): boolean {
    return (
      (0x0ac00 <= this.code && this.code <= 0xd7af) ||
      (0x3131 <= this.code && this.code <= 0x318e)
    );
  }

  isLineBreak(): boolean {
    return this.code === 10;
  }

  isParaBreak(): boolean {
    return this.code === 13;
  }
}
