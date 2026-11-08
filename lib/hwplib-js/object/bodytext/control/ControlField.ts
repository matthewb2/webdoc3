import type { ParameterItem } from "./bookmark/ParameterItem.js";
import { ParameterType } from "./bookmark/ParameterType.js";
import { CtrlHeaderField } from "./ctrlheader/CtrlHeaderField.js";
import { Control } from "./Control.js";

/**
 * Field (필드) control, ported from hwplib's `object.bodytext.control.ControlField`.
 */
export class ControlField extends Control {
  /**
   * @param ctrlId the ctrl-id of the ctrl header
   */
  constructor(ctrlId: number) {
    super(new CtrlHeaderField(ctrlId));
  }

  /**
   * Returns the control header for the field.
   *
   * @return control header for the field
   */
  getHeader(): CtrlHeaderField {
    return this.header as CtrlHeaderField;
  }

  /**
   * Returns the name of the field control.
   *
   * @return the name of the field control
   */
  getName(): string | null {
    if (this.ctrlData !== null) {
      if (this.ctrlData.getParameterSet().getId() === 0x021b) {
        const pi: ParameterItem | null = this.ctrlData.getParameterSet().getParameterItem(0x4000);
        if (pi !== null && pi.getType() === ParameterType.String) {
          if (pi.getValue_BSTR() !== null) {
            return pi.getValue_BSTR();
          }
        }
      }
    }
    return this.commandToName(this.getHeader().getCommand().toUTF16LEString());
  }

  private commandToName(command: string | null): string | null {
    if (command === null) {
      return null;
    }

    const properties = command.split(" ");
    if (properties !== null && properties.length >= 1) {
      const token = properties[0]!.split(":");
      if (token !== null && token.length >= 1) {
        return token[token.length - 1]!;
      }
    }
    return null;
  }

  /**
   * Sets the name of the field control.
   *
   * @param name field name
   */
  setName(name: string): void {
    if (this.ctrlData === null) {
      this.createCtrlData();
      this.ctrlData!.getParameterSet().setId(0x021b);
    }

    let pi: ParameterItem | null = this.ctrlData!.getParameterSet().getParameterItem(0x4000);
    if (pi === null) {
      pi = this.ctrlData!.getParameterSet().addNewParameterItem();
      pi.setId(0x4000);
    }

    pi.setType(ParameterType.String);
    pi.setValue_BSTR(name);
  }

  override clone(): Control {
    const cloned = new ControlField(this.header!.getCtrlId());
    cloned.copyControlPart(this);
    return cloned;
  }
}
