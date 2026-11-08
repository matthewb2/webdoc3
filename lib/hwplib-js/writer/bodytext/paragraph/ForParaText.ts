import type { Paragraph } from "../../../object/bodytext/paragraph/Paragraph.js";
import type { HWPChar } from "../../../object/bodytext/paragraph/text/HWPChar.js";
import type { HWPCharControlChar } from "../../../object/bodytext/paragraph/text/HWPCharControlChar.js";
import type { HWPCharControlExtend } from "../../../object/bodytext/paragraph/text/HWPCharControlExtend.js";
import type { HWPCharControlInline } from "../../../object/bodytext/paragraph/text/HWPCharControlInline.js";
import type { HWPCharNormal } from "../../../object/bodytext/paragraph/text/HWPCharNormal.js";
import { HWPCharType } from "../../../object/bodytext/paragraph/text/HWPCharType.js";
import { HWPTag } from "../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 문단의 텍스트 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParaText {
  /**
   * 문단의 텍스트 레코드를 쓴다.
   *
   * @param p  문단
   * @param sw 스트림 라이터
   */
  public static write(p: Paragraph, sw: StreamWriter): void {
    if (ForParaText.emptyText(p)) {
      return;
    }

    ForParaText.recordHeader(p, sw);

    for (const hc of p.getText()!.getCharList()) {
      ForParaText.hwpChar(hc, sw);
    }
  }

  private static emptyText(p: Paragraph): boolean {
    if (p.getHeader().getCharacterCount() <= 1) {
      const paraText = p.getText();
      if (paraText === null) {
        return true;
      }

      if (paraText.getCharList().length <= 1) {
        const hwpChar = paraText.getCharList()[0]!;
        if (hwpChar.getCode() === 0xd) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 문단의 텍스트 레코드의 레코드 헤더를 쓴다.
   *
   * @param p  문단
   * @param sw 스트림 라이터
   */
  private static recordHeader(p: Paragraph, sw: StreamWriter): void {
    const size = p.getHeader().getCharacterCount() * 2;
    sw.writeRecordHeader(HWPTag.PARA_TEXT, size);
  }

  /**
   * Character을 쓴다.
   *
   * @param hc 글자 객체
   * @param sw 스트림 라이터
   */
  private static hwpChar(hc: HWPChar, sw: StreamWriter): void {
    switch (hc.getType()) {
      case HWPCharType.Normal:
        ForParaText.normal(hc as HWPCharNormal, sw);
        break;
      case HWPCharType.ControlChar:
        ForParaText.controlChar(hc as HWPCharControlChar, sw);
        break;
      case HWPCharType.ControlInline:
        ForParaText.controlInline(hc as HWPCharControlInline, sw);
        break;
      case HWPCharType.ControlExtend:
        ForParaText.controlExtend(hc as HWPCharControlExtend, sw);
        break;
    }
  }

  /**
   * 일반 Character를 쓴다.
   *
   * @param hc 일반 Character
   * @param sw 스트림 라이터
   */
  private static normal(hc: HWPCharNormal, sw: StreamWriter): void {
    sw.writeUInt2(hc.getCode());
  }

  /**
   * 문자 컨트롤 Character를 쓴다.
   *
   * @param hc 문자 컨트롤 Character
   * @param sw 스트림 라이터
   */
  private static controlChar(hc: HWPCharControlChar, sw: StreamWriter): void {
    sw.writeUInt2(hc.getCode());
  }

  /**
   * 인라인 컨트롤 character을 쓴다.
   *
   * @param hc 인라인 컨트롤 character
   * @param sw 스트림 라이터
   */
  private static controlInline(hc: HWPCharControlInline, sw: StreamWriter): void {
    sw.writeUInt2(hc.getCode());
    sw.writeBytes(hc.getAddition()!);
    sw.writeUInt2(hc.getCode());
  }

  /**
   * 확장 컨트롤 Character를 쓴다.
   *
   * @param hc 확장 컨트롤 Character
   * @param sw 스트림 라이터
   */
  private static controlExtend(hc: HWPCharControlExtend, sw: StreamWriter): void {
    sw.writeUInt2(hc.getCode());
    sw.writeBytes(hc.getAddition()!);
    sw.writeUInt2(hc.getCode());
  }
}
