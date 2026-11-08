import { CtrlHeaderGso } from "./ctrlheader/CtrlHeaderGso.js";
import { EQEdit } from "./equation/EQEdit.js";
import { Caption } from "./gso/caption/Caption.js";
import { Control } from "./Control.js";
import { ControlType } from "./ControlType.js";

/**
 * Equation (수식) control, ported from hwplib's `object.bodytext.control.ControlEquation`.
 */
export class ControlEquation extends Control {
  /**
   * Caption.
   */
  private caption: Caption | null = null;
  /**
   * Equation information.
   */
  private eqEdit: EQEdit;

  constructor() {
    super(new CtrlHeaderGso(ControlType.Equation));

    this.eqEdit = new EQEdit();
  }

  /**
   * Returns the control header for the drawing object.
   *
   * @return control header for the drawing object
   */
  getHeader(): CtrlHeaderGso {
    return this.header as CtrlHeaderGso;
  }

  /**
   * Creates the caption object.
   */
  createCaption(): void {
    this.caption = new Caption();
  }

  /**
   * Deletes the caption object.
   */
  deleteCaption(): void {
    this.caption = null;
  }

  /**
   * Returns the caption object.
   *
   * @return caption object
   */
  getCaption(): Caption | null {
    return this.caption;
  }

  /**
   * Returns the equation information object.
   *
   * @return equation information object
   */
  getEQEdit(): EQEdit {
    return this.eqEdit;
  }

  override clone(): Control {
    const cloned = new ControlEquation();
    cloned.copyControlPart(this);

    if (this.caption !== null) {
      cloned.createCaption();
      cloned.caption!.copy(this.caption);
    }

    cloned.eqEdit.copy(this.eqEdit);

    return cloned;
  }
}
