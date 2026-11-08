import type { ControlContainer } from "../../../../object/bodytext/control/gso/ControlContainer.js";
import { ShapeComponentContainer } from "../../../../object/bodytext/control/gso/shapecomponent/ShapeComponentContainer.js";
import type { InstanceID } from "../../InstanceID.js";
import { ForGsoControl } from "./ForGsoControl.js";

/**
 * 묶음 컨트롤을 쓰기 전에 자동 설정하기 위한 객체
 *
 * @author neolord
 */
export class ForControlContainer {
  /**
   * 묶음 컨트롤을 자동 설정하다.
   *
   * @param cont 묶음 컨트롤
   * @param iid  인스턴스 id
   */
  public static autoSet(cont: ControlContainer, iid: InstanceID): void {
    ForControlContainer.shapeComponent(cont);
    ForControlContainer.childControls(cont, iid);
  }

  /**
   * 묶음 컨트롤의 객체 공통 속성 레코드를 자동 설정한다.
   *
   * @param cont 묶음 컨트롤
   */
  private static shapeComponent(cont: ControlContainer): void {
    const scc = cont.getShapeComponent() as ShapeComponentContainer;
    scc.getChildControlIdList().length = 0;
    for (const child of cont.getChildControlList()) {
      scc.addChildControlId(child.getGsoId());
    }
  }

  /**
   * 묶음 컨트롤의 자식 컨트롤들을 자동 설정한다.
   *
   * @param cont 묶음 컨트롤
   * @param iid  인스턴스 id
   */
  private static childControls(cont: ControlContainer, iid: InstanceID): void {
    for (const child of cont.getChildControlList()) {
      ForGsoControl.autoSet(child, iid);
    }
  }
}
