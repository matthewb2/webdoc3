import { ForGsoControl } from "./ForGsoControl.js";
import type { ControlContainer } from "../../../../../object/bodytext/control/gso/ControlContainer.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 묶음 컨트롤의 나머지 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForControlContainer {
  /**
   * 묶음 컨트롤의 나머지 부분을 쓴다.
   *
   * @param cont 묶음 컨트롤
   * @param sw   스트림 라이터
   */
  public static writeRest(cont: ControlContainer, sw: StreamWriter): void {
    ForControlContainer.childControls(cont, sw);
  }

  /**
   * 묶음 컨트롤에 포함된 컨트롤들을 쓴다.
   *
   * @param cont 묶음 컨트롤
   * @param sw   스트림 라이터
   */
  private static childControls(
    cont: ControlContainer,
    sw: StreamWriter,
  ): void {
    for (const child of cont.getChildControlList()) {
      ForGsoControl.writeInContainer(child, sw);
    }
  }
}
