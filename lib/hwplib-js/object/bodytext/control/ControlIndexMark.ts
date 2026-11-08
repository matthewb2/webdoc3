import { CtrlHeaderIndexMark } from "./ctrlheader/CtrlHeaderIndexMark.js";
import { Control } from "./Control.js";

/**
 * Index-mark control, ported from hwplib's `object.bodytext.control.ControlIndexMark`.
 */
export class ControlIndexMark extends Control {
  constructor() {
    super(new CtrlHeaderIndexMark());
  }

  /**
   * Returns the control header for the index mark.
   *
   * @return control header for the index mark
   */
  getHeader(): CtrlHeaderIndexMark {
    return this.header as CtrlHeaderIndexMark;
  }

  override clone(): Control {
    const cloned = new ControlIndexMark();
    cloned.copyControlPart(this);
    return cloned;
  }
}
