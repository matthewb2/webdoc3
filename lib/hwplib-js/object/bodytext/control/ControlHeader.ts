import { CtrlHeaderHeader } from "./ctrlheader/CtrlHeaderHeader.js";
import { ListHeaderForHeaderFooter } from "./headerfooter/ListHeaderForHeaderFooter.js";
import { ParagraphList } from "../paragraph/ParagraphList.js";
import { Control } from "./Control.js";

/**
 * Header (머리말) control, ported from hwplib's `object.bodytext.control.ControlHeader`.
 */
export class ControlHeader extends Control {
  /**
   * List header for header/footer.
   */
  private listHeader: ListHeaderForHeaderFooter;
  /**
   * Paragraph list.
   */
  private paragraphList: ParagraphList;

  constructor() {
    super(new CtrlHeaderHeader());

    this.listHeader = new ListHeaderForHeaderFooter();
    this.paragraphList = new ParagraphList();
  }

  /**
   * Returns the control header for the header.
   *
   * @return control header for the header
   */
  getHeader(): CtrlHeaderHeader {
    return this.header as CtrlHeaderHeader;
  }

  /**
   * Returns the list header for header/footer.
   *
   * @return list header for header/footer
   */
  getListHeader(): ListHeaderForHeaderFooter {
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
    const cloned = new ControlHeader();
    cloned.copyControlPart(this);
    cloned.listHeader.copy(this.listHeader);
    cloned.paragraphList.copy(this.paragraphList);
    return cloned;
  }
}
