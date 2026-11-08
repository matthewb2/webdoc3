import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentPicture } from "./shapecomponenteach/ShapeComponentPicture.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 그림 개체 컨트롤
 *
 * @author neolord
 */
export class ControlPicture extends GsoControl {
  /**
   * 그림 개체 속성
   */
  private shapeComponentPicture: ShapeComponentPicture;

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.Picture);

    this.shapeComponentPicture = new ShapeComponentPicture();
  }

  /**
   * 그림 개체의 속성 객체를 반환한다.
   *
   * @return 그림 개체의 속성 객체
   */
  getShapeComponentPicture(): ShapeComponentPicture {
    return this.shapeComponentPicture;
  }

  override clone(): Control {
    const cloned = new ControlPicture();
    cloned.copyGsoControlPart(this);
    cloned.shapeComponentPicture.copy(this.shapeComponentPicture);
    return cloned;
  }
}
