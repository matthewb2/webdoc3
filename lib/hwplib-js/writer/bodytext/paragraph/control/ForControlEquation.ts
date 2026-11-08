import type { ControlEquation } from "../../../../object/bodytext/control/ControlEquation.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForEQEdit } from "./eqed/ForEQEdit.js";
import { ForCaption } from "./gso/part/ForCaption.js";
import { ForCtrlHeaderGso } from "./gso/part/ForCtrlHeaderGso.js";

/**
 * 수식 컨트롤을 쓰기 위한 컨트롤
 *
 * @author neolord
 */
export class ForControlEquation {
  /**
   * 수식 컨트롤을 쓴다.
   *
   * @param eqed 수식 컨트롤
   * @param sw   스트림 라이터
   */
  public static write(eqed: ControlEquation, sw: StreamWriter): void {
    ForCtrlHeaderGso.write(eqed.getHeader(), sw);

    sw.upRecordLevel();

    ForCaption.write(eqed.getCaption(), sw);
    ForEQEdit.write(eqed.getEQEdit(), sw);

    sw.downRecordLevel();
  }
}
