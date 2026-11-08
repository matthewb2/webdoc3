import { CtrlData } from "./bookmark/CtrlData.js";
import type { CtrlHeader } from "./ctrlheader/CtrlHeader.js";
import { ControlType } from "./ControlType.js";

/**
 * Abstract control object, ported from hwplib's `object.bodytext.control.Control`.
 */
export abstract class Control {
  /**
   * Control header object.
   */
  protected header: CtrlHeader | null;
  /**
   * Control data.
   */
  protected ctrlData: CtrlData | null;

  /**
   * @param header Control header object
   */
  constructor(header: CtrlHeader | null) {
    this.header = header;
    this.ctrlData = null;
  }

  /**
   * Returns the control type derived from the header's control id.
   *
   * @return control type
   */
  getType(): ControlType {
    return ControlType.ctrlIdOf(this.header!.getCtrlId());
  }

  isNullHeader(): boolean {
    return this.header === null;
  }

  /**
   * Returns whether this is a field control.
   *
   * @return whether this is a field control
   */
  isField(): boolean {
    return ControlType.isField(this.header!.getCtrlId());
  }

  /**
   * Creates the control data.
   */
  createCtrlData(): void {
    this.ctrlData = new CtrlData();
  }

  deleteCtrlData(): void {
    this.ctrlData = null;
  }

  /**
   * Returns the control data object.
   *
   * @return control data object
   */
  getCtrlData(): CtrlData | null {
    return this.ctrlData;
  }

  /**
   * Sets the control data.
   *
   * @param ctrlData control data
   */
  setCtrlData(ctrlData: CtrlData): void {
    this.ctrlData = new CtrlData();
  }

  abstract clone(): Control;

  copyControlPart(from: Control): void {
    if (from.header !== null) {
      this.header!.copy(from.header);
    } else {
      this.header = null;
    }

    if (from.ctrlData !== null) {
      this.createCtrlData();
      this.ctrlData!.copy(from.ctrlData);
    } else {
      this.ctrlData = null;
    }
  }
}
