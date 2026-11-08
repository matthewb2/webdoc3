import { Property } from "./Property.js";
import { PropertyType } from "./PropertyType.js";

export class PropertyNormal extends Property {
  private type: PropertyType | null = null;
  private value: string | null = null;

  public constructor(name: string | null) {
    super();
    this.setName(name);
  }

  public override getType(): PropertyType {
    return this.type!;
  }

  public setType(type: PropertyType): void {
    this.type = type;
  }

  public getValue(): string | null {
    return this.value;
  }

  public setValue(value: string | null): void {
    this.value = value;
  }

  public override clone(): Property {
    const cloned = new PropertyNormal(this.getName());
    cloned.type = this.type;
    cloned.value = this.value;
    return cloned;
  }

  public override toString(): string {
    let sb = "";
    if (this.type === PropertyType.WString) {
      sb =
        sb +
        this.getName() +
        ":" +
        PropertyType.toString(this.type!) +
        ":" +
        this.value!.length +
        ":" +
        this.value;
    } else {
      sb = sb + this.getName() + ":" + PropertyType.toString(this.type!) + ":" + this.value;
    }
    return sb;
  }
}
