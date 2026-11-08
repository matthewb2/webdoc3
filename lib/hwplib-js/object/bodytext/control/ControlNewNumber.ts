import { CtrlHeaderNewNumber } from "./ctrlheader/CtrlHeaderNewNumber.js";
import { Control } from "./Control.js";

/**
 * New-number control, ported from hwplib's `object.bodytext.control.ControlNewNumber`.
 */
export class ControlNewNumber extends Control {
  constructor() {
    super(new CtrlHeaderNewNumber());
  }

  /**
   * Returns the control header for the new-number control.
   *
   * @return control header for the new-number control
   */
  getHeader(): CtrlHeaderNewNumber {
    return this.header as CtrlHeaderNewNumber;
  }

  override clone(): Control {
    const cloned = new ControlNewNumber();
    cloned.copyControlPart(this);
    return cloned;
  }
}
