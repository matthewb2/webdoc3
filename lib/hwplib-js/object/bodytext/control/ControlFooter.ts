import { CtrlHeaderFooter } from "./ctrlheader/CtrlHeaderFooter.js";
import { ListHeaderForHeaderFooter } from "./headerfooter/ListHeaderForHeaderFooter.js";
import { ParagraphList } from "../paragraph/ParagraphList.js";
import { Control } from "./Control.js";

/**
 * Footer (꼬리말) control, ported from hwplib's `object.bodytext.control.ControlFooter`.
 */
export class ControlFooter extends Control {
  /**
   * List header for header/footer.
   */
  private listHeader: ListHeaderForHeaderFooter;
  /**
   * Paragraph list.
   */
  private paragraphList: ParagraphList;

  constructor() {
    super(new CtrlHeaderFooter());

    this.listHeader = new ListHeaderForHeaderFooter();
    this.paragraphList = new ParagraphList();
  }

  /**
   * Returns the control header for the footer.
   *
   * @return control header for the footer
   */
  getHeader(): CtrlHeaderFooter {
    return this.header as CtrlHeaderFooter;
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
    const cloned = new ControlFooter();
    cloned.copyControlPart(this);
    cloned.listHeader.copy(this.listHeader);
    cloned.paragraphList.copy(this.paragraphList);
    return cloned;
  }
}
