import type { PropertyType } from "./PropertyType.js";

export abstract class Property {
  private name: string | null = null;

  public constructor() {}

  public getName(): string | null {
    return this.name;
  }

  public setName(name: string | null): void {
    this.name = name;
  }

  public abstract getType(): PropertyType;

  public abstract clone(): Property;
}
