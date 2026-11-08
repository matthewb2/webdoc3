import type { ControlArc } from "../../../../object/bodytext/control/gso/ControlArc.js";
import type { ControlContainer } from "../../../../object/bodytext/control/gso/ControlContainer.js";
import type { ControlCurve } from "../../../../object/bodytext/control/gso/ControlCurve.js";
import type { ControlEllipse } from "../../../../object/bodytext/control/gso/ControlEllipse.js";
import type { ControlPolygon } from "../../../../object/bodytext/control/gso/ControlPolygon.js";
import type { ControlRectangle } from "../../../../object/bodytext/control/gso/ControlRectangle.js";
import type { GsoControl } from "../../../../object/bodytext/control/gso/GsoControl.js";
import { GsoControlType } from "../../../../object/bodytext/control/gso/GsoControlType.js";
import type { TextBox } from "../../../../object/bodytext/control/gso/textbox/TextBox.js";
import { ForParagraphList } from "../../ForParagraphList.js";
import type { InstanceID } from "../../InstanceID.js";
import { ForControlContainer } from "./ForControlContainer.js";
import { ForCaption } from "./part/ForCaption.js";
import { ForCtrlHeaderGso } from "./part/ForCtrlHeaderGso.js";

/**
 * 각각의 그리기 개체 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForGsoControl {
  /**
   * 그리기 개체 컨트롤를 자동 설정한다.
   *
   * @param gc  그리기 개체 컨트롤
   * @param iid 인스턴스 아이디
   */
  public static autoSet(gc: GsoControl, iid: InstanceID): void {
    ForCtrlHeaderGso.autoSet(gc.getHeader(), gc.getCaption(), iid);
    ForCaption.autoSet(gc.getCaption(), iid);
    ForGsoControl.restPart(gc, iid);
  }

  /**
   * 그리기 개체 컨트롤 별의 나머지 부분을 자동 설정한다.
   *
   * @param gc  그리기 개체 컨트롤
   * @param iid 인스턴스 id
   */
  private static restPart(gc: GsoControl, iid: InstanceID): void {
    switch (gc.getGsoType()) {
      case GsoControlType.Arc:
        ForGsoControl.arc(gc as ControlArc, iid);
        break;
      case GsoControlType.Container:
        ForGsoControl.container(gc as ControlContainer, iid);
        break;
      case GsoControlType.Curve:
        ForGsoControl.curve(gc as ControlCurve, iid);
        break;
      case GsoControlType.Ellipse:
        ForGsoControl.ellipse(gc as ControlEllipse, iid);
        break;
      case GsoControlType.Line:
        break;
      case GsoControlType.OLE:
        break;
      case GsoControlType.Picture:
        break;
      case GsoControlType.Polygon:
        ForGsoControl.polygon(gc as ControlPolygon, iid);
        break;
      case GsoControlType.Rectangle:
        ForGsoControl.rectangle(gc as ControlRectangle, iid);
        break;
      case GsoControlType.ObjectLinkLine:
        break;
      case GsoControlType.TextArt:
        break;
    }
  }

  /**
   * 호 컨트롤의 나머지 부분을 자동 설정한다.
   *
   * @param arc 호 개체 컨트롤
   * @param iid 인스턴스 id
   */
  private static arc(arc: ControlArc, iid: InstanceID): void {
    ForGsoControl.textBox(arc.getTextBox(), iid);
  }

  /**
   * 글상자를 자동 설정한다.
   *
   * @param tb  글상자 객체
   * @param iid 인스턴스 id
   */
  private static textBox(tb: TextBox | null, iid: InstanceID): void {
    if (tb === null) {
      return;
    }

    ForGsoControl.listHeader(tb);
    ForParagraphList.autoSet(tb.getParagraphList(), iid);
  }

  /**
   * 글상자의 리스트 헤더 레코드를 자동 설정한다.
   *
   * @param tb 글상자
   */
  private static listHeader(tb: TextBox): void {
    tb.getListHeader().setParaCount(tb.getParagraphList().getParagraphCount());
  }

  /**
   * 묶음 컨트롤의 나머지 부분을 자동 설정한다.
   *
   * @param cont 묶음 컨트롤
   * @param iid  인스턴스 id
   */
  private static container(cont: ControlContainer, iid: InstanceID): void {
    ForControlContainer.autoSet(cont, iid);
  }

  /**
   * 곡선 컨트롤의 나머지 부분을 자동 설정한다.
   *
   * @param curv 곡선 컨트롤
   * @param iid  인스턴스 id
   */
  private static curve(curv: ControlCurve, iid: InstanceID): void {
    ForGsoControl.textBox(curv.getTextBox(), iid);
  }

  /**
   * 타원 컨트롤의 나머지 부분을 자동 설정한다.
   *
   * @param ell 타원 컨트롤
   * @param iid 인스턴스 id
   */
  private static ellipse(ell: ControlEllipse, iid: InstanceID): void {
    ForGsoControl.textBox(ell.getTextBox(), iid);
  }

  /**
   * 다각형 컨트롤의 나머지 부분을 자동 설정한다.
   *
   * @param poly 다각형 컨트롤
   * @param iid  인스턴스 id
   */
  private static polygon(poly: ControlPolygon, iid: InstanceID): void {
    ForGsoControl.textBox(poly.getTextBox(), iid);
  }

  /**
   * 사각형 컨트롤의 나머지 부분을 자동 설정한다.
   *
   * @param rect 사각형 컨트롤
   * @param iid  인스턴스 id
   */
  private static rectangle(rect: ControlRectangle, iid: InstanceID): void {
    ForGsoControl.textBox(rect.getTextBox(), iid);
  }
}
