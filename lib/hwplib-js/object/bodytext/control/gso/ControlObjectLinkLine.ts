import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentLineForObjectLinkLine } from "./shapecomponenteach/ShapeComponentLineForObjectLinkLine.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 객체 연결선 컨트롤
 *
 * @author neolord
 */
export class ControlObjectLinkLine extends GsoControl {
  /**
   * 선 개체 속성
   */
  private shapeComponentLine: ShapeComponentLineForObjectLinkLine;

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.ObjectLinkLine);

    this.shapeComponentLine = new ShapeComponentLineForObjectLinkLine();
  }

  /**
   * 선 개체의 속성 객체를 반환한다.
   *
   * @return 선 개체의 속성 객체
   */
  getShapeComponentLine(): ShapeComponentLineForObjectLinkLine {
    return this.shapeComponentLine;
  }

  override clone(): Control {
    const cloned = new ControlObjectLinkLine();
    cloned.copyGsoControlPart(this);
    cloned.shapeComponentLine.copy(this.shapeComponentLine);
    return cloned;
  }
}
