import { ControlType } from "../ControlType.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 책갈피 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderBookmark extends CtrlHeader {
  /**
   * 생성자
   */
  constructor() {
    super(ControlType.Bookmark);
  }

  override copy(from: CtrlHeader): void {
  }
}
