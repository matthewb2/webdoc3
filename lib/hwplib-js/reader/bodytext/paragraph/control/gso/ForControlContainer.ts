import { ForGsoControl } from "./ForGsoControl.js";
import type { ControlContainer } from "../../../../../object/bodytext/control/gso/ControlContainer.js";
import type { ShapeComponentContainer } from "../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponentContainer.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 묶은 컨트롤의 나머지 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlContainer {
  /**
   * 묶은 컨트롤의 나머지 부분을 읽는다.
   *
   * @param container 묶은 컨트롤
   * @param sr        스트림 리더
   */
  public static readRest(
    container: ControlContainer,
    sr: StreamReader,
  ): void {
    const scc = container.getShapeComponent() as ShapeComponentContainer;
    const childCount = scc.getChildControlIdList().length;
    for (let index = 0; index < childCount; index++) {
      const fgc = new ForGsoControl();
      const gc = fgc.readInContainer(sr);
      container.addChildControl(gc);
    }
  }
}
