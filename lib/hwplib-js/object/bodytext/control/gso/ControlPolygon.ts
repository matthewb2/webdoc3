import type { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { ShapeComponentPolygon } from "./shapecomponenteach/ShapeComponentPolygon.js";
import { TextBox } from "./textbox/TextBox.js";
import { GsoControl } from "./GsoControl.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 다각형 개체 컨트롤
 *
 * @author neolord
 */
export class ControlPolygon extends GsoControl {
  /**
   * 글상자
   */
  private textBox: TextBox | null;
  /**
   * 다각형 개체 속성
   */
  private shapeComponentPolygon: ShapeComponentPolygon;

  /**
   * 생성자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);
    this.setGsoId(GsoControlType.Polygon);

    this.textBox = null;
    this.shapeComponentPolygon = new ShapeComponentPolygon();
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
   * 다각형 개체의 속성 객체를 반환한다.
   *
   * @return 다각형 개체의 속성 객체
   */
  getShapeComponentPolygon(): ShapeComponentPolygon {
    return this.shapeComponentPolygon;
  }

  override clone(): Control {
    const cloned = new ControlPolygon();
    cloned.copyGsoControlPart(this);

    if (this.textBox !== null) {
      cloned.createTextBox();
      cloned.textBox!.copy(this.textBox);
    }

    cloned.shapeComponentPolygon.copy(this.shapeComponentPolygon);
    return cloned;
  }
}
