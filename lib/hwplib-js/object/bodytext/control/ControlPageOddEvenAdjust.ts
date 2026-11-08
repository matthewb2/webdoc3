import { CtrlHeaderPageOddEvenAdjust } from "./ctrlheader/CtrlHeaderPageOddEvenAdjust.js";
import { Control } from "./Control.js";

/**
 * Page odd/even-adjust control, ported from hwplib's
 * `object.bodytext.control.ControlPageOddEvenAdjust`.
 */
export class ControlPageOddEvenAdjust extends Control {
  constructor() {
    super(new CtrlHeaderPageOddEvenAdjust());
  }

  /**
   * Returns the control header for the odd/even-adjust control.
   *
   * @return control header for the odd/even-adjust control
   */
  getHeader(): CtrlHeaderPageOddEvenAdjust {
    return this.header as CtrlHeaderPageOddEvenAdjust;
  }

  override clone(): Control {
    const cloned = new ControlPageOddEvenAdjust();
    cloned.copyControlPart(this);
    return cloned;
  }
}
