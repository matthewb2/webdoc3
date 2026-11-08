import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentLine } from "./shapecomponenteach/ShapeComponentLine.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 선 개체 컨트롤
 *
 * @author neolord
 */
export class ControlLine extends GsoControl {
  /**
   * 선 개체 속성
   */
  private shapeComponentLine: ShapeComponentLine;

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.Line);

    this.shapeComponentLine = new ShapeComponentLine();
  }

  /**
   * 선 개체의 속성 객체를 반환한다.
   *
   * @return 선 개체의 속성 객체
   */
  getShapeComponentLine(): ShapeComponentLine {
    return this.shapeComponentLine;
  }

  override clone(): Control {
    const cloned = new ControlLine();
    cloned.copyGsoControlPart(this);
    cloned.shapeComponentLine.copy(this.shapeComponentLine);
    return cloned;
  }
}
