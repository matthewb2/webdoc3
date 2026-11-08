/**
 * A string-valued enum: each member stores the `str` token used in the serialized form-object
 * property string. Represented as a plain numeric enum merged with a namespace providing the
 * Java instance `toString()` (as `toString(pt)`) and static `fromString(str)` (default NULL).
 */
export enum PropertyType {
  NULL,
  Set,
  WString,
  Int,
  Bool,
}

export namespace PropertyType {
  const strs: Record<PropertyType, string> = {
    [PropertyType.NULL]: "",
    [PropertyType.Set]: "set",
    [PropertyType.WString]: "wstring",
    [PropertyType.Int]: "int",
    [PropertyType.Bool]: "bool",
  };

  export function toString(pt: PropertyType): string {
    return strs[pt];
  }

  export function fromString(str: string): PropertyType {
    for (const pt of [
      PropertyType.NULL,
      PropertyType.Set,
      PropertyType.WString,
      PropertyType.Int,
      PropertyType.Bool,
    ]) {
      if (strs[pt] === str) {
        return pt;
      }
    }
    return PropertyType.NULL;
  }
}
