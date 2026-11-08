import { CtrlHeaderAutoNumber } from "./ctrlheader/CtrlHeaderAutoNumber.js";
import { Control } from "./Control.js";

/**
 * Auto-number control, ported from hwplib's `object.bodytext.control.ControlAutoNumber`.
 */
export class ControlAutoNumber extends Control {
  constructor() {
    super(new CtrlHeaderAutoNumber());
  }

  /**
   * Returns the control header for the auto-number control.
   *
   * @return control header for the auto-number control
   */
  getHeader(): CtrlHeaderAutoNumber {
    return this.header as CtrlHeaderAutoNumber;
  }

  override clone(): Control {
    const cloned = new ControlAutoNumber();
    cloned.copyControlPart(this);
    return cloned;
  }
}
