import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentArc } from "./shapecomponenteach/ShapeComponentArc.js";
import { TextBox } from "./textbox/TextBox.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 호 개체 컨트롤
 *
 * @author neolord
 */
export class ControlArc extends GsoControl {
  /**
   * 글상자
   */
  private textBox: TextBox | null;
  /**
   * 호 개체 속성
   */
  private shapeComponentArc: ShapeComponentArc;

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.Arc);

    this.textBox = null;
    this.shapeComponentArc = new ShapeComponentArc();
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
   * 호 개체의 속성 객체를 반환한다.
   *
   * @return 호 개체의 속성 객체
   */
  getShapeComponentArc(): ShapeComponentArc {
    return this.shapeComponentArc;
  }

  override clone(): Control {
    const cloned = new ControlArc();
    cloned.copyGsoControlPart(this);

    if (this.textBox !== null) {
      cloned.createTextBox();
      cloned.textBox!.copy(this.textBox);
    }

    cloned.shapeComponentArc.copy(this.shapeComponentArc);
    return cloned;
  }
}
