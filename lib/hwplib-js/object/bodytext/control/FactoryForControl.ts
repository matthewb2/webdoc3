import type { CtrlHeaderGso } from "./ctrlheader/CtrlHeaderGso.js";
import type { GsoControl } from "./gso/GsoControl.js";
import { GsoControlType } from "./gso/GsoControlType.js";
import { ControlLine } from "./gso/ControlLine.js";
import { ControlRectangle } from "./gso/ControlRectangle.js";
import { ControlEllipse } from "./gso/ControlEllipse.js";
import { ControlPolygon } from "./gso/ControlPolygon.js";
import { ControlArc } from "./gso/ControlArc.js";
import { ControlCurve } from "./gso/ControlCurve.js";
import { ControlPicture } from "./gso/ControlPicture.js";
import { ControlOLE } from "./gso/ControlOLE.js";
import { ControlContainer } from "./gso/ControlContainer.js";
import { ControlObjectLinkLine } from "./gso/ControlObjectLinkLine.js";
import { ControlTextArt } from "./gso/ControlTextArt.js";
import { ControlUnknown } from "./gso/ControlUnknown.js";
import type { Control } from "./Control.js";
import { ControlType } from "./ControlType.js";
import { ControlSectionDefine } from "./ControlSectionDefine.js";
import { ControlColumnDefine } from "./ControlColumnDefine.js";
import { ControlTable } from "./ControlTable.js";
import { ControlEquation } from "./ControlEquation.js";
import { ControlHeader } from "./ControlHeader.js";
import { ControlFooter } from "./ControlFooter.js";
import { ControlFootnote } from "./ControlFootnote.js";
import { ControlEndnote } from "./ControlEndnote.js";
import { ControlAutoNumber } from "./ControlAutoNumber.js";
import { ControlNewNumber } from "./ControlNewNumber.js";
import { ControlPageHide } from "./ControlPageHide.js";
import { ControlPageOddEvenAdjust } from "./ControlPageOddEvenAdjust.js";
import { ControlPageNumberPosition } from "./ControlPageNumberPosition.js";
import { ControlIndexMark } from "./ControlIndexMark.js";
import { ControlBookmark } from "./ControlBookmark.js";
import { ControlOverlappingLetter } from "./ControlOverlappingLetter.js";
import { ControlAdditionalText } from "./ControlAdditionalText.js";
import { ControlHiddenComment } from "./ControlHiddenComment.js";
import { ControlField } from "./ControlField.js";
import { ControlForm } from "./ControlForm.js";

/**
 * Factory that creates controls, ported from hwplib's
 * `object.bodytext.control.FactoryForControl`.
 */
export class FactoryForControl {
  /**
   * Creates the control that corresponds to the given control id.
   *
   * @param ctrlId control id
   * @return the newly created control
   */
  static create(ctrlId: number): Control | null {
    if (ctrlId === ControlType.getCtrlId(ControlType.SectionDefine)) {
      return new ControlSectionDefine();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.ColumnDefine)) {
      return new ControlColumnDefine();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.Table)) {
      return new ControlTable();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.Equation)) {
      return new ControlEquation();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.Header)) {
      return new ControlHeader();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.Footer)) {
      return new ControlFooter();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.Footnote)) {
      return new ControlFootnote();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.Endnote)) {
      return new ControlEndnote();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.AutoNumber)) {
      return new ControlAutoNumber();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.NewNumber)) {
      return new ControlNewNumber();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.PageHide)) {
      return new ControlPageHide();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.PageOddEvenAdjust)) {
      return new ControlPageOddEvenAdjust();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.PageNumberPosition)) {
      return new ControlPageNumberPosition();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.IndexMark)) {
      return new ControlIndexMark();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.Bookmark)) {
      return new ControlBookmark();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.OverlappingLetter)) {
      return new ControlOverlappingLetter();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.AdditionalText)) {
      return new ControlAdditionalText();
    } else if (ctrlId === ControlType.getCtrlId(ControlType.HiddenComment)) {
      return new ControlHiddenComment();
    } else if (ControlType.isField(ctrlId)) {
      return new ControlField(ctrlId);
    }
    return null;
  }

  static createFormControl(header: CtrlHeaderGso): ControlForm {
    return new ControlForm(header);
  }

  /**
   * Creates a new drawing-object control corresponding to the given gso id.
   *
   * @param gsoId  drawing-object id
   * @param header control header for the drawing object
   * @return the newly created drawing-object control
   */
  static createGso(gsoId: number, header: CtrlHeaderGso | null): GsoControl {
    if (gsoId === GsoControlType.Line) {
      return new ControlLine(header);
    } else if (gsoId === GsoControlType.Rectangle) {
      return new ControlRectangle(header);
    } else if (gsoId === GsoControlType.Ellipse) {
      return new ControlEllipse(header);
    } else if (gsoId === GsoControlType.Polygon) {
      return new ControlPolygon(header);
    } else if (gsoId === GsoControlType.Arc) {
      return new ControlArc(header);
    } else if (gsoId === GsoControlType.Curve) {
      return new ControlCurve(header);
    } else if (gsoId === GsoControlType.Picture) {
      return new ControlPicture(header);
    } else if (gsoId === GsoControlType.OLE) {
      return new ControlOLE(header);
    } else if (gsoId === GsoControlType.Container) {
      return new ControlContainer(header);
    } else if (gsoId === GsoControlType.ObjectLinkLine) {
      return new ControlObjectLinkLine(header);
    } else if (gsoId === GsoControlType.TextArt) {
      return new ControlTextArt(header);
    } else {
      return new ControlUnknown(header);
    }
  }
}
