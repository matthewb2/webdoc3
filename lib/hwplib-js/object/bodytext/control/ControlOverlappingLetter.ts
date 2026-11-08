import { CtrlHeaderOverlappingLetter } from "./ctrlheader/CtrlHeaderOverlappingLetter.js";
import { Control } from "./Control.js";

/**
 * Overlapping-letter control, ported from hwplib's
 * `object.bodytext.control.ControlOverlappingLetter`.
 */
export class ControlOverlappingLetter extends Control {
  constructor() {
    super(new CtrlHeaderOverlappingLetter());
  }

  /**
   * Returns the control header for overlapping letters.
   *
   * @return control header for overlapping letters
   */
  getHeader(): CtrlHeaderOverlappingLetter {
    return this.header as CtrlHeaderOverlappingLetter;
  }

  override clone(): Control {
    const cloned = new ControlOverlappingLetter();
    cloned.copyControlPart(this);
    return cloned;
  }
}
