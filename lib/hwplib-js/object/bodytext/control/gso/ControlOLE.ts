import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentOLE } from "./shapecomponenteach/ShapeComponentOLE.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * OLE 개체 컨트롤
 *
 * @author neolord
 */
export class ControlOLE extends GsoControl {
  /**
   * OLE 개체 속성
   */
  private shapeComponentOLE: ShapeComponentOLE;

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.OLE);

    this.shapeComponentOLE = new ShapeComponentOLE();
  }

  /**
   * OLE 개체의 속성 객체을 반환한다.
   *
   * @return OLE 개체의 속성 객체
   */
  getShapeComponentOLE(): ShapeComponentOLE {
    return this.shapeComponentOLE;
  }

  override clone(): Control {
    const cloned = new ControlOLE();
    cloned.copyGsoControlPart(this);
    cloned.shapeComponentOLE.copy(this.shapeComponentOLE);
    return cloned;
  }
}
