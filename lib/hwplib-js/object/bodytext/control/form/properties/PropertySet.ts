import { Property } from "./Property.js";
import { PropertyType } from "./PropertyType.js";
import { PropertyNormal } from "./PropertyNormal.js";
import { HWPString } from "../../../../etc/HWPString.js";

export class PropertySet extends Property {
  private propertyMap: Map<string, Property>;

  public constructor(name: string | null) {
    super();
    this.setName(name);
    this.propertyMap = new Map<string, Property>();
  }

  public addNewNormalProperty(name: string, type: string): PropertyNormal {
    const propertyNormal = new PropertyNormal(name);
    propertyNormal.setType(PropertyType.fromString(type));
    this.propertyMap.set(name, propertyNormal);
    return propertyNormal;
  }

  public addNewPropertySet(name: string): PropertySet {
    const propertySet = new PropertySet(name);
    this.propertyMap.set(name, propertySet);
    return propertySet;
  }

  public getProperty(name: string): Property | null {
    const property = this.propertyMap.get(name);
    return property !== undefined ? property : null;
  }

  public getNames(): Set<string> {
    return new Set<string>(this.propertyMap.keys());
  }

  public override getType(): PropertyType {
    return PropertyType.Set;
  }

  public copy(from: PropertySet): void {
    this.setName(from.getName());

    this.propertyMap.clear();
    for (const [key, value] of from.propertyMap) {
      this.propertyMap.set(key, value.clone());
    }
  }

  public override clone(): Property {
    const cloned = new PropertySet(this.getName());
    for (const [key, value] of this.propertyMap) {
      cloned.propertyMap.set(key, value.clone());
    }
    return cloned;
  }

  public parse(data: string): void {
    while (data.length > 0) {
      let position = data.indexOf(":");
      const name = data.substring(0, position);
      data = data.substring(position + 1);

      position = data.indexOf(":");
      const type = data.substring(0, position);
      data = data.substring(position + 1);

      if (type === "set") {
        position = data.indexOf(":");
        const length = parseInt(data.substring(0, position), 10);
        data = data.substring(position + 1);
        const setData = data.substring(0, length);
        data = data.substring(length + 1);

        this.addNewPropertySet(name).parse(setData);
      } else if (type === "wstring") {
        position = data.indexOf(":");
        const length = parseInt(data.substring(0, position), 10);
        data = data.substring(position + 1);

        const value = data.substring(0, length);
        data = data.substring(length + 1);

        this.addNewNormalProperty(name, type).setValue(value);
      } else {
        position = data.indexOf(" ");
        const value = data.substring(0, position);
        data = data.substring(position + 1);

        this.addNewNormalProperty(name, type).setValue(value);
      }
    }
  }

  public override toString(): string {
    let sb = "";
    if (this.getName() !== null && this.getName()!.length > 0) {
      let sb2 = "";
      for (const property of this.propertyMap.values()) {
        sb2 = sb2 + property.toString() + " ";
      }

      sb =
        sb +
        this.getName() +
        ":" +
        PropertyType.toString(this.getType()) +
        ":" +
        sb2.length +
        ":" +
        sb2;
    } else {
      for (const property of this.propertyMap.values()) {
        sb = sb + property.toString() + " ";
      }
    }
    return sb;
  }

  public toHWPString(): HWPString {
    const ret = new HWPString();
    ret.fromUTF16LEString(this.toString());
    return ret;
  }
}
