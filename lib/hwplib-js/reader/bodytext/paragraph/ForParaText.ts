import { HWPChar } from "../../../object/bodytext/paragraph/text/HWPChar.js";
import type { HWPCharControlExtend } from "../../../object/bodytext/paragraph/text/HWPCharControlExtend.js";
import type { HWPCharControlInline } from "../../../object/bodytext/paragraph/text/HWPCharControlInline.js";
import { HWPCharType } from "../../../object/bodytext/paragraph/text/HWPCharType.js";
import type { ParaText } from "../../../object/bodytext/paragraph/text/ParaText.js";
import type { Paragraph } from "../../../object/bodytext/paragraph/Paragraph.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";

/**
 * 문단의 텍스트 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForParaText {
  /**
   * 문단의 텍스트 레코드를 읽는다.
   *
   * @param p  문단
   * @param sr 스트림 리더
   */
  public static read(p: Paragraph, sr: StreamReader): void {
    p.createText();

    const recordSize = sr.getCurrentRecordHeader().getSize();
    let read = 0;
    while (read < recordSize) {
      read += ForParaText.hwpChar(p.getText()!, sr);
    }
  }

  /**
   * HWP문자를 종류에 따라 읽는다.
   *
   * @param paraText 문단의 텍스트 레코드
   * @param sr       스트림 리더
   * @return 읽은 byte 수
   */
  private static hwpChar(paraText: ParaText, sr: StreamReader): number {
    const code = sr.readUInt2();
    switch (HWPChar.type(code)) {
      case HWPCharType.Normal:
        paraText.addNewNormalChar().setCode(code);
        return 2;
      case HWPCharType.ControlChar:
        paraText.addNewCharControlChar().setCode(code);
        return 2;
      case HWPCharType.ControlExtend:
        ForParaText.extendChar(paraText.addNewExtendControlChar(), sr);
        return 16;
      case HWPCharType.ControlInline:
        ForParaText.inlineChar(paraText.addNewInlineControlChar(), sr);
        return 16;
    }
    return 2;
  }

  /**
   * 확장 컨트롤 문자을 읽는다.
   *
   * @param extendChar 확장 컨트롤 문자
   * @param sr         스트림 리더
   */
  private static extendChar(extendChar: HWPCharControlExtend, sr: StreamReader): void {
    const addition = sr.readBytes(12);
    extendChar.setAddition(addition);
    extendChar.setCode(sr.readSInt2());
  }

  /**
   * 인라인 컨트를 문자를 읽는다.
   *
   * @param inlineChar 인라인 컨트를 문자
   * @param sr         스트림 리더
   */
  private static inlineChar(inlineChar: HWPCharControlInline, sr: StreamReader): void {
    const addition = sr.readBytes(12);
    inlineChar.setAddition(addition);
    inlineChar.setCode(sr.readSInt2());
  }
}
