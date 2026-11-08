import { CtrlHeaderFootnote } from "./ctrlheader/CtrlHeaderFootnote.js";
import { ListHeaderForFootnodeEndnote } from "./footnoteendnote/ListHeaderForFootnodeEndnote.js";
import { ParagraphList } from "../paragraph/ParagraphList.js";
import { Control } from "./Control.js";

/**
 * Footnote (각주) control, ported from hwplib's `object.bodytext.control.ControlFootnote`.
 */
export class ControlFootnote extends Control {
  /**
   * List header for footnote/endnote.
   */
  private listHeader: ListHeaderForFootnodeEndnote;
  /**
   * Paragraph list.
   */
  private paragraphList: ParagraphList;

  constructor() {
    super(new CtrlHeaderFootnote());

    this.listHeader = new ListHeaderForFootnodeEndnote();
    this.paragraphList = new ParagraphList();
  }

  /**
   * Returns the control header for the footnote.
   *
   * @return control header for the footnote
   */
  getHeader(): CtrlHeaderFootnote {
    return this.header as CtrlHeaderFootnote;
  }

  /**
   * Returns the list header for footnote/endnote.
   *
   * @return list header for footnote/endnote
   */
  getListHeader(): ListHeaderForFootnodeEndnote {
    return this.listHeader;
  }

  /**
   * Returns the paragraph list.
   *
   * @return paragraph list
   */
  getParagraphList(): ParagraphList {
    return this.paragraphList;
  }

  override clone(): Control {
    const cloned = new ControlFootnote();
    cloned.copyControlPart(this);
    cloned.listHeader.copy(this.listHeader);
    cloned.paragraphList.copy(this.paragraphList);
    return cloned;
  }
}
