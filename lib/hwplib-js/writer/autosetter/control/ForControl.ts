import type { Control } from "../../../object/bodytext/control/Control.js";
import type { ControlColumnDefine } from "../../../object/bodytext/control/ControlColumnDefine.js";
import type { ControlEndnote } from "../../../object/bodytext/control/ControlEndnote.js";
import type { ControlEquation } from "../../../object/bodytext/control/ControlEquation.js";
import type { ControlField } from "../../../object/bodytext/control/ControlField.js";
import type { ControlFooter } from "../../../object/bodytext/control/ControlFooter.js";
import type { ControlFootnote } from "../../../object/bodytext/control/ControlFootnote.js";
import type { ControlHeader } from "../../../object/bodytext/control/ControlHeader.js";
import type { ControlHiddenComment } from "../../../object/bodytext/control/ControlHiddenComment.js";
import type { ControlSectionDefine } from "../../../object/bodytext/control/ControlSectionDefine.js";
import type { ControlTable } from "../../../object/bodytext/control/ControlTable.js";
import { ControlType } from "../../../object/bodytext/control/ControlType.js";
import type { GsoControl } from "../../../object/bodytext/control/gso/GsoControl.js";
import type { InstanceID } from "../InstanceID.js";
import { ForControlColumnDefine } from "./ForControlColumnDefine.js";
import { ForControlEndNote } from "./ForControlEndNote.js";
import { ForControlEquation } from "./ForControlEquation.js";
import { ForControlField } from "./ForControlField.js";
import { ForControlFooter } from "./ForControlFooter.js";
import { ForControlFootnote } from "./ForControlFootnote.js";
import { ForControlHeader } from "./ForControlHeader.js";
import { ForControlHiddenComment } from "./ForControlHiddenComment.js";
import { ForControlSectionDefine } from "./ForControlSectionDefine.js";
import { ForControlTable } from "./ForControlTable.js";
import { ForGsoControl } from "./gso/ForGsoControl.js";

/**
 * 각각의 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControl {
  /**
   * 컨트롤을 자동 설정한다.
   *
   * @param c   컨트롤
   * @param iid 인스턴스 id
   */
  public static autoSet(c: Control, iid: InstanceID): void {
    if (c.isField()) {
      ForControlField.autoSet(c as ControlField, iid);
    } else {
      switch (c.getType()) {
        case ControlType.AdditionalText:
          break;
        case ControlType.AutoNumber:
          break;
        case ControlType.Bookmark:
          break;
        case ControlType.ColumnDefine:
          ForControlColumnDefine.autoSet(c as ControlColumnDefine);
          break;
        case ControlType.Endnote:
          ForControlEndNote.autoSet(c as ControlEndnote, iid);
          break;
        case ControlType.Equation:
          ForControlEquation.autoSet(c as ControlEquation, iid);
          break;
        case ControlType.Footer:
          ForControlFooter.autoSet(c as ControlFooter, iid);
          break;
        case ControlType.Footnote:
          ForControlFootnote.autoSet(c as ControlFootnote, iid);
          break;
        case ControlType.Gso:
          ForGsoControl.autoSet(c as GsoControl, iid);
          break;
        case ControlType.Header:
          ForControlHeader.autoSet(c as ControlHeader, iid);
          break;
        case ControlType.HiddenComment:
          ForControlHiddenComment.autoSet(c as ControlHiddenComment, iid);
          break;
        case ControlType.IndexMark:
          break;
        case ControlType.NewNumber:
          break;
        case ControlType.OverlappingLetter:
          break;
        case ControlType.PageHide:
          break;
        case ControlType.PageNumberPosition:
          break;
        case ControlType.PageOddEvenAdjust:
          break;
        case ControlType.SectionDefine:
          ForControlSectionDefine.autoSet(c as ControlSectionDefine, iid);
          break;
        case ControlType.Table:
          ForControlTable.autoSet(c as ControlTable, iid);
          break;
        case ControlType.Form:
          break;
        default:
          break;
      }
    }
  }
}
