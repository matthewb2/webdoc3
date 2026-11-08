import { CtrlHeaderPageHide } from "./ctrlheader/CtrlHeaderPageHide.js";
import { Control } from "./Control.js";

/**
 * Page-hide control, ported from hwplib's `object.bodytext.control.ControlPageHide`.
 */
export class ControlPageHide extends Control {
  constructor() {
    super(new CtrlHeaderPageHide());
  }

  /**
   * Returns the control header for the page-hide control.
   *
   * @return control header for the page-hide control
   */
  getHeader(): CtrlHeaderPageHide {
    return this.header as CtrlHeaderPageHide;
  }

  override clone(): Control {
    const cloned = new ControlPageHide();
    cloned.copyControlPart(this);
    return cloned;
  }
}
