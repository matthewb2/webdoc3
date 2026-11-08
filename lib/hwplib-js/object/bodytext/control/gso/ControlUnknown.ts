import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

export class ControlUnknown extends GsoControl {
  /**
   * 생성자
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.Unknown);
  }

  override clone(): Control {
    const cloned = new ControlUnknown();
    cloned.copyGsoControlPart(this);
    return cloned;
  }
}
