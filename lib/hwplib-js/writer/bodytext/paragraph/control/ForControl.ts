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
import type { ControlForm } from "../../../../object/bodytext/control/ControlForm.js";
import type { GsoControl } from "../../../../object/bodytext/control/gso/GsoControl.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForControlForm } from "./form/ForControlForm.js";
import { ForGsoControl } from "./gso/ForGsoControl.js";
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
 * 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControl {
  /**
   * 컨트롤을 쓴다.
   *
   * @param c  컨트롤
   * @param sw 스트림 라이터
   */
  public static write(c: Control, sw: StreamWriter): void {
    if (ControlType.isField(ControlType.getCtrlId(c.getType()))) {
      ForControlField.write(c as ControlField, sw);
      return;
    }
    switch (c.getType()) {
      case ControlType.Table: // 표
        ForControlTable.write(c as ControlTable, sw);
        break;
      case ControlType.Equation: // 수식
        ForControlEquation.write(c as ControlEquation, sw);
        break;
      case ControlType.SectionDefine: // 구역 정의
        ForControlSectionDefine.write(c as ControlSectionDefine, sw);
        break;
      case ControlType.ColumnDefine: // 단 정의
        ForControlColumnDefine.write(c as ControlColumnDefine, sw);
        break;
      case ControlType.Header: // 머리말
        ForControlHeader.write(c as ControlHeader, sw);
        break;
      case ControlType.Footer: // 꼬리말
        ForControlFooter.write(c as ControlFooter, sw);
        break;
      case ControlType.Footnote: // 각주
        ForControlFootnote.write(c as ControlFootnote, sw);
        break;
      case ControlType.Endnote: // 미주
        ForControlEndnote.write(c as ControlEndnote, sw);
        break;
      case ControlType.AutoNumber: // 자동 번호
        ForControlAutoNumber.write(c as ControlAutoNumber, sw);
        break;
      case ControlType.NewNumber: // 새 번호 지정
        ForControlNewNumber.write(c as ControlNewNumber, sw);
        break;
      case ControlType.PageHide: // 감추기
        ForControlPageHide.write(c as ControlPageHide, sw);
        break;
      case ControlType.PageOddEvenAdjust:
        ForControlPageOddEvenAdjust.write(c as ControlPageOddEvenAdjust, sw);
        break;
      case ControlType.PageNumberPosition: // 쪽 번호 위치
        ForControlPageNumberPosition.write(c as ControlPageNumberPosition, sw);
        break;
      case ControlType.IndexMark: // 찾아보기 표식
        ForControlIndexMark.write(c as ControlIndexMark, sw);
        break;
      case ControlType.Bookmark: // 책갈피
        ForControlBookmark.write(c as ControlBookmark, sw);
        break;
      case ControlType.OverlappingLetter: // 글자 겹침
        ForControlOverlappingLetter.write(c as ControlOverlappingLetter, sw);
        break;
      case ControlType.AdditionalText: // 덧말
        ForControlAdditionalText.write(c as ControlAdditionalText, sw);
        break;
      case ControlType.HiddenComment: // 숨은 설명
        ForControlHiddenComment.write(c as ControlHiddenComment, sw);
        break;
      case ControlType.Form: // 양식 개체
        ForControlForm.write(c as ControlForm, sw);
        break;
      case ControlType.Gso:
        ForGsoControl.write(c as GsoControl, sw);
        break;
      default:
        break;
    }
  }
}
