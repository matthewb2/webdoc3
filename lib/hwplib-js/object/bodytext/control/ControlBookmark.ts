import { CtrlHeaderBookmark } from "./ctrlheader/CtrlHeaderBookmark.js";
import { Control } from "./Control.js";

/**
 * Bookmark control, ported from hwplib's `object.bodytext.control.ControlBookmark`.
 */
export class ControlBookmark extends Control {
  constructor() {
    super(new CtrlHeaderBookmark());
  }

  /**
   * Returns the control header for the bookmark.
   *
   * @return control header for the bookmark
   */
  getHeader(): CtrlHeaderBookmark {
    return this.header as CtrlHeaderBookmark;
  }

  override clone(): Control {
    const cloned = new ControlBookmark();
    cloned.copyControlPart(this);
    return cloned;
  }
}
