import type { Control } from "../Control.js";
import { FactoryForControl } from "../FactoryForControl.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentContainer } from "./shapecomponent/ShapeComponentContainer.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 묶음 개체 컨트롤
 *
 * @author neolord
 */
export class ControlContainer extends GsoControl {
  /**
   * 차일드 컨트롤 리스트
   */
  private childControlList: GsoControl[];

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.shapeComponent = new ShapeComponentContainer();

    this.setGsoId(GsoControlType.Container);

    this.childControlList = [];
  }

  addNewChildControl(gsoType: GsoControlType): GsoControl {
    const gc = FactoryForControl.createGso(gsoType, null);
    this.childControlList.push(gc);
    return gc;
  }

  /**
   * 차일드 컨트롤을 리스트에 추가한다.
   *
   * @param childControl 차일드 컨트롤
   */
  addChildControl(childControl: GsoControl): void {
    this.childControlList.push(childControl);
  }

  /**
   * 차일드 컨트롤의 리스트를 반환한다.
   *
   * @return 차일드 컨트롤의 리스트
   */
  getChildControlList(): GsoControl[] {
    return this.childControlList;
  }

  override clone(): Control {
    const cloned = new ControlContainer();
    cloned.copyGsoControlPart(this);

    for (const childControl of this.childControlList) {
      cloned.childControlList.push(childControl.clone() as GsoControl);
    }

    return cloned;
  }
}
