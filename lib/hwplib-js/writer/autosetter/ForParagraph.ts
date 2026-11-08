import type { Paragraph } from "../../object/bodytext/paragraph/Paragraph.js";
import type { ControlMask } from "../../object/bodytext/paragraph/header/ControlMask.js";
import type { ParaHeader } from "../../object/bodytext/paragraph/header/ParaHeader.js";
import type { ParaText } from "../../object/bodytext/paragraph/text/ParaText.js";
import { ForControl } from "./control/ForControl.js";
import type { InstanceID } from "./InstanceID.js";

/**
 * 문단 객체를 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForParagraph {
  /**
   * 문단 객체를 자동 설정한다.
   *
   * @param p          문단 객체
   * @param lastInList 리스트의 마지막 인지 여부
   * @param iid        인스턴스 id
   */
  public static autoSet(p: Paragraph, lastInList: boolean, iid: InstanceID): void {
    ForParagraph.header(p, lastInList);
    ForParagraph.controls(p, iid);
  }

  /**
   * 문단 헤더 레코드를 자동 설정한다.
   *
   * @param p          문단 객체
   * @param lastInList 리스트의 마지막 인지 여부
   */
  private static header(p: Paragraph, lastInList: boolean): void {
    const h = p.getHeader();

    h.setLastInList(lastInList);
    ForParagraph.setCharacterCount(h, p.getText());
    ForParagraph.setControlMask(h.getControlMask(), p.getText());
    if (p.getCharShape() !== null) {
      h.setCharShapeCount(p.getCharShape()!.getPositonShapeIdPairList().length);
    } else {
      h.setCharShapeCount(0);
    }
    if (p.getRangeTag() !== null) {
      h.setRangeTagCount(p.getRangeTag()!.getRangeTagItemList().length);
    } else {
      h.setRangeTagCount(0);
    }
    if (p.getLineSeg() !== null) {
      h.setLineAlignCount(p.getLineSeg()!.getLineSegItemList().length);
    } else {
      h.setLineAlignCount(0);
    }
    h.setInstanceID(0);
  }

  /**
   * 문단 헤더 레코드의 문자 개수를 자동 설정한다.
   *
   * @param h 문단 헤더 레코드
   * @param t 문단 텍스트 레코드
   */
  private static setCharacterCount(h: ParaHeader, t: ParaText | null): void {
    if (t !== null) {
      let charCount = 0;
      for (const ch of t.getCharList()) {
        charCount += ch.getCharSize();
      }

      h.setCharacterCount(charCount);
    } else {
      h.setCharacterCount(1);
    }
  }

  /**
   * 문단 헤더 레코드의 Control Mask 부분을 자동 설정한다.
   *
   * @param cm 문단 헤더 레코드의 Control Mask
   * @param t  문단 텍스트 레코드
   */
  private static setControlMask(cm: ControlMask, t: ParaText | null): void {
    cm.setValue(0);
    if (t === null) {
      return;
    }

    for (const ch of t.getCharList()) {
      switch (ch.getCode()) {
        case 2:
          cm.setHasSectColDef(true);
          break;
        case 3:
          cm.setHasFieldStart(true);
          break;
        case 4:
          cm.setHasFieldEnd(true);
          break;
        case 8:
          // Java falls through from case 8 into case 9 (no break after setHasTitleMark).
          cm.setHasTitleMark(true);
          cm.setHasTab(true);
          break;
        case 9:
          cm.setHasTab(true);
          break;
        case 10:
          cm.setHasLineBreak(true);
          break;
        case 11:
          cm.setHasGsoTable(true);
          break;
        case 15:
          cm.setHasHiddenComment(true);
          break;
        case 16:
          cm.setHasHeaderFooter(true);
          break;
        case 17:
          cm.setHasFootnoteEndnote(true);
          break;
        case 18:
          cm.setHasAutoNumber(true);
          break;
        case 21:
          cm.setHasPageControl(true);
          break;
        case 22:
          cm.setHasBookmark(true);
          break;
        case 23:
          cm.setHasAdditionalTextOverlappingLetter(true);
          break;
        case 24:
          cm.setHasHyphen(true);
          break;
        case 30:
          cm.setHasBundleBlank(true);
          break;
        case 31:
          cm.setHasFixWidthBlank(true);
          break;
      }
    }
  }

  /**
   * 문단에 포함된 컨트롤들을 자동 설정한다.
   *
   * @param p   문단
   * @param iid 인스턴스 id
   */
  private static controls(p: Paragraph, iid: InstanceID): void {
    if (p.getControlList() === null) {
      return;
    }

    for (const c of p.getControlList()!) {
      ForControl.autoSet(c, iid);
    }
  }
}
