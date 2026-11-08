import { CtrlHeaderColumnDefine } from "./ctrlheader/CtrlHeaderColumnDefine.js";
import { Control } from "./Control.js";

/**
 * Column-define control, ported from hwplib's `object.bodytext.control.ControlColumnDefine`.
 */
export class ControlColumnDefine extends Control {
  constructor() {
    super(new CtrlHeaderColumnDefine());
  }

  /**
   * Returns the control header for the column definition.
   *
   * @return control header for the column definition
   */
  getHeader(): CtrlHeaderColumnDefine {
    return this.header as CtrlHeaderColumnDefine;
  }

  override clone(): Control {
    const cloned = new ControlColumnDefine();
    cloned.copyControlPart(this);
    return cloned;
  }
}
