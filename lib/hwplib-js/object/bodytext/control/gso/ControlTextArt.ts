import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentTextArt } from "./shapecomponenteach/ShapeComponentTextArt.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 글맵시 컨트롤
 */
export class ControlTextArt extends GsoControl {
  /**
   * 글맵시 개체 속성
   */
  private shapeComponentTextArt: ShapeComponentTextArt;

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.TextArt);
    this.shapeComponentTextArt = new ShapeComponentTextArt();
  }

  getShapeComponentTextArt(): ShapeComponentTextArt {
    return this.shapeComponentTextArt;
  }

  override clone(): Control {
    const cloned = new ControlTextArt();
    cloned.copyGsoControlPart(this);

    cloned.shapeComponentTextArt.copy(this.shapeComponentTextArt);

    return cloned;
  }
}
