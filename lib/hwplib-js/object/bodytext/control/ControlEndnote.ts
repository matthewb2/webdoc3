import { CtrlHeaderEndnote } from "./ctrlheader/CtrlHeaderEndnote.js";
import { ListHeaderForFootnodeEndnote } from "./footnoteendnote/ListHeaderForFootnodeEndnote.js";
import { ParagraphList } from "../paragraph/ParagraphList.js";
import { Control } from "./Control.js";

/**
 * Endnote (미주) control, ported from hwplib's `object.bodytext.control.ControlEndnote`.
 */
export class ControlEndnote extends Control {
  /**
   * List header for footnote/endnote.
   */
  private listHeader: ListHeaderForFootnodeEndnote;
  /**
   * Paragraph list.
   */
  private paragraphList: ParagraphList;

  constructor() {
    super(new CtrlHeaderEndnote());

    this.listHeader = new ListHeaderForFootnodeEndnote();
    this.paragraphList = new ParagraphList();
  }

  /**
   * Returns the control header for the endnote.
   *
   * @return control header for the endnote
   */
  getHeader(): CtrlHeaderEndnote {
    return this.header as CtrlHeaderEndnote;
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
    const cloned = new ControlEndnote();
    cloned.copyControlPart(this);
    cloned.listHeader.copy(this.listHeader);
    cloned.paragraphList.copy(this.paragraphList);
    return cloned;
  }
}
