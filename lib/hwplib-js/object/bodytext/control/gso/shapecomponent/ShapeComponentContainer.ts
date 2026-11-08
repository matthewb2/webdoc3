import { ShapeComponent } from "./ShapeComponent.js";

/**
 * Object common attribute record for a container control.
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponent.ShapeComponentContainer`.
 *
 * @author neolord
 */
export class ShapeComponentContainer extends ShapeComponent {
  /**
   * List of ids of controls included in the container
   */
  private childControlIdList: number[];

  /**
   * Constructor
   */
  public constructor() {
    super();
    this.childControlIdList = [];
  }

  /**
   * Adds an id of a control included in the container to the list.
   *
   * @param id an id of a control included in the container
   */
  public addChildControlId(id: number): void {
    this.childControlIdList.push(id);
  }

  /**
   * Returns the list of ids of controls included in the container.
   *
   * @return the list of ids of controls included in the container
   */
  public getChildControlIdList(): number[] {
    return this.childControlIdList;
  }

  public override copy(from: ShapeComponent): void {
    this.copyShapeComponent(from);
    const from2 = from as ShapeComponentContainer;

    this.childControlIdList.length = 0;
    for (const childControlId of from2.childControlIdList) {
      this.childControlIdList.push(childControlId);
    }
  }
}
