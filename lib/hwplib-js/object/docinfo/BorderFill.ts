import { BorderFillProperty } from "./borderfill/BorderFillProperty.js";
import { EachBorder } from "./borderfill/EachBorder.js";
import { FillInfo } from "./borderfill/fillinfo/FillInfo.js";

/**
 * Record representing the shape of a border/background.
 * Ported from hwplib's `object.docinfo.BorderFill`.
 */
export class BorderFill {
  /** property */
  private property: BorderFillProperty;
  /** property of the left border line */
  private leftBorder: EachBorder;
  /** property of the right border line */
  private rightBorder: EachBorder;
  /** property of the top border line */
  private topBorder: EachBorder;
  /** property of the bottom border line */
  private bottomBorder: EachBorder;
  /** property of the diagonal border line */
  private diagonalBorder: EachBorder;
  /** fill information */
  private fillInfo: FillInfo;

  constructor() {
    this.property = new BorderFillProperty();
    this.leftBorder = new EachBorder();
    this.rightBorder = new EachBorder();
    this.topBorder = new EachBorder();
    this.bottomBorder = new EachBorder();
    this.diagonalBorder = new EachBorder();
    this.fillInfo = new FillInfo();
  }

  getProperty(): BorderFillProperty {
    return this.property;
  }

  getLeftBorder(): EachBorder {
    return this.leftBorder;
  }

  getRightBorder(): EachBorder {
    return this.rightBorder;
  }

  getTopBorder(): EachBorder {
    return this.topBorder;
  }

  getBottomBorder(): EachBorder {
    return this.bottomBorder;
  }

  getDiagonalBorder(): EachBorder {
    return this.diagonalBorder;
  }

  getFillInfo(): FillInfo {
    return this.fillInfo;
  }

  clone(): BorderFill {
    const cloned = new BorderFill();
    cloned.property.copy(this.property);
    cloned.leftBorder.copy(this.leftBorder);
    cloned.rightBorder.copy(this.rightBorder);
    cloned.topBorder.copy(this.topBorder);
    cloned.bottomBorder.copy(this.bottomBorder);
    cloned.diagonalBorder.copy(this.diagonalBorder);
    cloned.fillInfo.copy(this.fillInfo);
    return cloned;
  }
}
