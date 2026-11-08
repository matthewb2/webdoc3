import { CtrlHeader } from "./CtrlHeader.js";

export class CtrlHeaderDefault extends CtrlHeader {
  /**
   * 생성자
   *
   * @param ctrlId 컨트롤 아이디
   */
  constructor(ctrlId: number) {
    super(ctrlId);
  }

  override copy(from: CtrlHeader): void {
    // nothing
  }
}
