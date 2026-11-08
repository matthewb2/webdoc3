import { CtrlHeaderGso } from "./ctrlheader/CtrlHeaderGso.js";
import { FormObject } from "./form/FormObject.js";
import { Control } from "./Control.js";
import { ControlType } from "./ControlType.js";

/**
 * Form-object (양식 개체) control, ported from hwplib's `object.bodytext.control.ControlForm`.
 */
export class ControlForm extends Control {
  private formObject: FormObject;

  /**
   * @param header control header for the form object
   */
  constructor(header: CtrlHeaderGso = new CtrlHeaderGso(ControlType.Form)) {
    super(header);

    this.formObject = new FormObject();
  }

  getHeader(): CtrlHeaderGso {
    return this.header as CtrlHeaderGso;
  }

  getFormObject(): FormObject {
    return this.formObject;
  }

  override clone(): Control {
    const cloned = new ControlForm();
    cloned.copyControlPart(this);

    cloned.formObject.copy(this.formObject);
    return cloned;
  }
}
