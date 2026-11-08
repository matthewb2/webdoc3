import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentCurve } from "./shapecomponenteach/ShapeComponentCurve.js";
import { TextBox } from "./textbox/TextBox.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 곡선 개체 컨트롤
 *
 * @author neolord
 */
export class ControlCurve extends GsoControl {
  /**
   * 글상자
   */
  private textBox: TextBox | null;
  /**
   * 곡선 개체 속성
   */
  private shapeComponentCurve: ShapeComponentCurve;

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.Curve);

    this.textBox = null;
    this.shapeComponentCurve = new ShapeComponentCurve();
  }

  /**
   * 글상자 객체를 생성한다.
   */
  createTextBox(): void {
    this.textBox = new TextBox();
  }

  /**
   * 글상자 객체를 삭제한다.
   */
  deleteTextBox(): void {
    this.textBox = null;
  }

  /**
   * 글상자 객체를 반환한다.
   *
   * @return 글상자 객체
   */
  getTextBox(): TextBox | null {
    return this.textBox;
  }

  /**
   * 곡선 개체의 속성 객체를 반환한다.
   *
   * @return 곡선 개체의 속성 객체
   */
  getShapeComponentCurve(): ShapeComponentCurve {
    return this.shapeComponentCurve;
  }

  override clone(): Control {
    const cloned = new ControlCurve();
    cloned.copyGsoControlPart(this);

    if (this.textBox !== null) {
      cloned.createTextBox();
      cloned.textBox!.copy(this.textBox);
    }

    cloned.shapeComponentCurve.copy(this.shapeComponentCurve);
    return cloned;
  }
}
