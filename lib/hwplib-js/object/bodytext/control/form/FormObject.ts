import type { FormObjectType } from "./FormObjectType.js";
import { PropertySet } from "./properties/PropertySet.js";

export class FormObject {
  private type: FormObjectType | null;
  private properties: PropertySet;

  public constructor() {
    this.type = null;
    this.properties = new PropertySet("");
  }

  public getType(): FormObjectType | null {
    return this.type;
  }

  public setType(type: FormObjectType): void {
    this.type = type;
  }

  public getProperties(): PropertySet {
    return this.properties;
  }

  public copy(from: FormObject): void {
    this.type = from.type;
    this.properties.copy(from.properties);
  }
}
