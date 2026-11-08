import { CtrlHeaderAdditionalText } from "./ctrlheader/CtrlHeaderAdditionalText.js";
import { Control } from "./Control.js";

/**
 * Additional-text (덧말) control, ported from hwplib's
 * `object.bodytext.control.ControlAdditionalText`.
 */
export class ControlAdditionalText extends Control {
  constructor() {
    super(new CtrlHeaderAdditionalText());
  }

  /**
   * Returns the control header for additional text.
   *
   * @return control header for additional text
   */
  getHeader(): CtrlHeaderAdditionalText {
    return this.header as CtrlHeaderAdditionalText;
  }

  override clone(): Control {
    const cloned = new ControlAdditionalText();
    cloned.copyControlPart(this);
    return cloned;
  }
}
