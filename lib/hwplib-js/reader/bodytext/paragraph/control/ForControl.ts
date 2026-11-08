import type { Control } from "../../../../object/bodytext/control/Control.js";
import { ControlType } from "../../../../object/bodytext/control/ControlType.js";
import type { ControlField } from "../../../../object/bodytext/control/ControlField.js";
import type { ControlTable } from "../../../../object/bodytext/control/ControlTable.js";
import type { ControlEquation } from "../../../../object/bodytext/control/ControlEquation.js";
import type { ControlSectionDefine } from "../../../../object/bodytext/control/ControlSectionDefine.js";
import type { ControlColumnDefine } from "../../../../object/bodytext/control/ControlColumnDefine.js";
import type { ControlHeader } from "../../../../object/bodytext/control/ControlHeader.js";
import type { ControlFooter } from "../../../../object/bodytext/control/ControlFooter.js";
import type { ControlFootnote } from "../../../../object/bodytext/control/ControlFootnote.js";
import type { ControlEndnote } from "../../../../object/bodytext/control/ControlEndnote.js";
import type { ControlAutoNumber } from "../../../../object/bodytext/control/ControlAutoNumber.js";
import type { ControlNewNumber } from "../../../../object/bodytext/control/ControlNewNumber.js";
import type { ControlPageHide } from "../../../../object/bodytext/control/ControlPageHide.js";
import type { ControlPageOddEvenAdjust } from "../../../../object/bodytext/control/ControlPageOddEvenAdjust.js";
import type { ControlPageNumberPosition } from "../../../../object/bodytext/control/ControlPageNumberPosition.js";
import type { ControlIndexMark } from "../../../../object/bodytext/control/ControlIndexMark.js";
import type { ControlBookmark } from "../../../../object/bodytext/control/ControlBookmark.js";
import type { ControlOverlappingLetter } from "../../../../object/bodytext/control/ControlOverlappingLetter.js";
import type { ControlAdditionalText } from "../../../../object/bodytext/control/ControlAdditionalText.js";
import type { ControlHiddenComment } from "../../../../object/bodytext/control/ControlHiddenComment.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";
import { ForControlAdditionalText } from "./ForControlAdditionalText.js";
import { ForControlAutoNumber } from "./ForControlAutoNumber.js";
import { ForControlBookmark } from "./ForControlBookmark.js";
import { ForControlColumnDefine } from "./ForControlColumnDefine.js";
import { ForControlEndnote } from "./ForControlEndnote.js";
import { ForControlEquation } from "./ForControlEquation.js";
import { ForControlField } from "./ForControlField.js";
import { ForControlFooter } from "./ForControlFooter.js";
import { ForControlFootnote } from "./ForControlFootnote.js";
import { ForControlHeader } from "./ForControlHeader.js";
import { ForControlHiddenComment } from "./ForControlHiddenComment.js";
import { ForControlIndexMark } from "./ForControlIndexMark.js";
import { ForControlNewNumber } from "./ForControlNewNumber.js";
import { ForControlOverlappingLetter } from "./ForControlOverlappingLetter.js";
import { ForControlPageHide } from "./ForControlPageHide.js";
import { ForControlPageNumberPosition } from "./ForControlPageNumberPosition.js";
import { ForControlPageOddEvenAdjust } from "./ForControlPageOddEvenAdjust.js";
import { ForControlSectionDefine } from "./ForControlSectionDefine.js";
import { ForControlTable } from "./ForControlTable.js";

/**
 * 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControl {
  /**
   * 컨트롤의 종류에 따라 컨트롤을 읽는다.
   *
   * @param c  컨트롤 객체
   * @param sr 스트림 리더
   */
  public static read(c: Control, sr: StreamReader): void {
    if (ControlType.isField(ControlType.getCtrlId(c.getType()))) {
      // 필드
      ForControl.field(c, sr);
      return;
    }
    switch (c.getType()) {
      case ControlType.Table: // 표
        ForControl.table(c, sr);
        break;
      case ControlType.Equation: // 수식
        ForControl.equation(c, sr);
        break;
      case ControlType.SectionDefine: // 구역 정의
        ForControl.sectionDefine(c, sr);
        break;
      case ControlType.ColumnDefine: // 단 정의
        ForControl.columnDefine(c, sr);
        break;
      case ControlType.Header: // 머리말
        ForControl.header(c, sr);
        break;
      case ControlType.Footer: // 꼬리말
        ForControl.footer(c, sr);
        break;
      case ControlType.Footnote: // 각주
        ForControl.footnote(c, sr);
        break;
      case ControlType.Endnote: // 미주
        ForControl.endnote(c, sr);
        break;
      case ControlType.AutoNumber: // 자동 번호
        ForControl.autoNumber(c, sr);
        break;
      case ControlType.NewNumber: // 새 번호 지정
        ForControl.newNumber(c, sr);
        break;
      case ControlType.PageHide: // 감추기
        ForControl.pageHide(c, sr);
        break;
      case ControlType.PageOddEvenAdjust:
        ForControl.pageOddEvenAdjust(c, sr);
        break;
      case ControlType.PageNumberPosition: // 쪽 번호 위치
        ForControl.pageNumberPositon(c, sr);
        break;
      case ControlType.IndexMark: // 찾아보기 표식
        ForControl.indexMark(c, sr);
        break;
      case ControlType.Bookmark: // 책갈피
        ForControl.bookmark(c, sr);
        break;
      case ControlType.OverlappingLetter: // 글자 겹침
        ForControl.overlappingLetter(c, sr);
        break;
      case ControlType.AdditionalText: // 덧말
        ForControl.additionalText(c, sr);
        break;
      case ControlType.HiddenComment: // 숨은 설명
        ForControl.hiddenComment(c, sr);
        break;
      default:
        break;
    }
  }

  /**
   * 필드 컨트를을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static field(c: Control, sr: StreamReader): void {
    ForControlField.read(c as ControlField, sr);
  }

  /**
   * 표 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static table(c: Control, sr: StreamReader): void {
    const fct = new ForControlTable();
    fct.read(c as ControlTable, sr);
  }

  /**
   * 한글 수식 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static equation(c: Control, sr: StreamReader): void {
    const fce = new ForControlEquation();
    fce.read(c as ControlEquation, sr);
  }

  /**
   * 구역 정의 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static sectionDefine(c: Control, sr: StreamReader): void {
    const fcsd = new ForControlSectionDefine();
    fcsd.read(c as ControlSectionDefine, sr);
  }

  /**
   * 단 정의 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static columnDefine(c: Control, sr: StreamReader): void {
    ForControlColumnDefine.read(c as ControlColumnDefine, sr);
  }

  /**
   * 머리말 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static header(c: Control, sr: StreamReader): void {
    const fch = new ForControlHeader();
    fch.read(c as ControlHeader, sr);
  }

  /**
   * 꼬리말 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static footer(c: Control, sr: StreamReader): void {
    const fcf = new ForControlFooter();
    fcf.read(c as ControlFooter, sr);
  }

  /**
   * 각주 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static footnote(c: Control, sr: StreamReader): void {
    const fcf = new ForControlFootnote();
    fcf.read(c as ControlFootnote, sr);
  }

  /**
   * 미주 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static endnote(c: Control, sr: StreamReader): void {
    const fce = new ForControlEndnote();
    fce.read(c as ControlEndnote, sr);
  }

  /**
   * 자동 번호 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static autoNumber(c: Control, sr: StreamReader): void {
    ForControlAutoNumber.read(c as ControlAutoNumber, sr);
  }

  /**
   * 새 번호 지정 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static newNumber(c: Control, sr: StreamReader): void {
    ForControlNewNumber.read(c as ControlNewNumber, sr);
  }

  /**
   * 감추기 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static pageHide(c: Control, sr: StreamReader): void {
    ForControlPageHide.read(c as ControlPageHide, sr);
  }

  /**
   * 홀/짝수 조정 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static pageOddEvenAdjust(c: Control, sr: StreamReader): void {
    ForControlPageOddEvenAdjust.read(c as ControlPageOddEvenAdjust, sr);
  }

  /**
   * 쪽 번호 위치 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static pageNumberPositon(c: Control, sr: StreamReader): void {
    ForControlPageNumberPosition.read(c as ControlPageNumberPosition, sr);
  }

  /**
   * 찾아보기 표식 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static indexMark(c: Control, sr: StreamReader): void {
    ForControlIndexMark.read(c as ControlIndexMark, sr);
  }

  /**
   * 책갈피 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static bookmark(c: Control, sr: StreamReader): void {
    ForControlBookmark.read(c as ControlBookmark, sr);
  }

  /**
   * 글자 겹침 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static overlappingLetter(c: Control, sr: StreamReader): void {
    ForControlOverlappingLetter.read(c as ControlOverlappingLetter, sr);
  }

  /**
   * 덧말 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static additionalText(c: Control, sr: StreamReader): void {
    ForControlAdditionalText.read(c as ControlAdditionalText, sr);
  }

  /**
   * 숨은 설명 컨트롤을 읽는다.
   *
   * @param c  컨트롤
   * @param sr 스트림 리더
   */
  private static hiddenComment(c: Control, sr: StreamReader): void {
    const fchc = new ForControlHiddenComment();
    fchc.read(c as ControlHiddenComment, sr);
  }
}
