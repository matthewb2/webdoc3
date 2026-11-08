import { CtrlHeaderPageNumberPosition } from "./ctrlheader/CtrlHeaderPageNumberPosition.js";
import { Control } from "./Control.js";

/**
 * Page-number-position control, ported from hwplib's
 * `object.bodytext.control.ControlPageNumberPosition`.
 */
export class ControlPageNumberPosition extends Control {
  constructor() {
    super(new CtrlHeaderPageNumberPosition());
  }

  /**
   * Returns the control header for the page-number-position control.
   *
   * @return control header for the page-number-position control
   */
  getHeader(): CtrlHeaderPageNumberPosition {
    return this.header as CtrlHeaderPageNumberPosition;
  }

  override clone(): Control {
    const cloned = new ControlPageNumberPosition();
    cloned.copyControlPart(this);
    return cloned;
  }
}
