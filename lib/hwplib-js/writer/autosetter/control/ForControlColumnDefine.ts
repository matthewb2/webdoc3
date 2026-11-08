import type { ControlColumnDefine } from "../../../object/bodytext/control/ControlColumnDefine.js";

/**
 * 단 정의 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlColumnDefine {
  /**
   * 단 정의 컨트롤을 자동 설정한다.
   *
   * @param cd 단 정의 컨트롤
   */
  public static autoSet(cd: ControlColumnDefine): void {
    const h = cd.getHeader();

    if (h.getProperty().isSameWidth() === false) {
      if (h.getColumnInfoList().length > 1) {
        h.getProperty().setColumnCount(h.getColumnInfoList().length);
      } else {
        h.getProperty().setColumnCount(1);
      }
    }
  }
}
