/**
 * Kind of color effect (no information).
 *
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.picture.ColorEffectSort`.
 *
 * @author neolord
 */
export enum ColorEffectSort {
  Alpha = 0,
  Alpha_Mod = 1,
  Alpha_Off = 2,
  Red = 3,
  Red_Mod = 4,
  Ref_Off = 5,
  Green = 6,
  Green_Mod = 7,
  Green_Off = 8,
  Blue = 9,
  Blue_Mod = 10,
  Blue_Off = 11,
  Hue = 12,
  Hue_Mod = 13,
  Hue_Off = 14,
  Sat = 15,
  Sat_Mod = 16,
  Sat_Off = 17,
  Lum = 18,
  Lum_Mod = 19,
  Lum_Off = 20,
  Shade = 21,
  Tint = 22,
  Gray = 23,
  Comp = 24,
  Gamma = 25,
  Inv_Gamma = 26,
  Inv = 27,
}

export namespace ColorEffectSort {
  /**
   * All enum constants, in declaration order (Java `values()`).
   */
  const allValues: ColorEffectSort[] = [
    ColorEffectSort.Alpha,
    ColorEffectSort.Alpha_Mod,
    ColorEffectSort.Alpha_Off,
    ColorEffectSort.Red,
    ColorEffectSort.Red_Mod,
    ColorEffectSort.Ref_Off,
    ColorEffectSort.Green,
    ColorEffectSort.Green_Mod,
    ColorEffectSort.Green_Off,
    ColorEffectSort.Blue,
    ColorEffectSort.Blue_Mod,
    ColorEffectSort.Blue_Off,
    ColorEffectSort.Hue,
    ColorEffectSort.Hue_Mod,
    ColorEffectSort.Hue_Off,
    ColorEffectSort.Sat,
    ColorEffectSort.Sat_Mod,
    ColorEffectSort.Sat_Off,
    ColorEffectSort.Lum,
    ColorEffectSort.Lum_Mod,
    ColorEffectSort.Lum_Off,
    ColorEffectSort.Shade,
    ColorEffectSort.Tint,
    ColorEffectSort.Gray,
    ColorEffectSort.Comp,
    ColorEffectSort.Gamma,
    ColorEffectSort.Inv_Gamma,
    ColorEffectSort.Inv,
  ];

  /**
   * Java valueOf(int): the matching constant. The file stored value may be either the raw
   * value or the raw value + 500, so both are checked; returns Alpha when unknown.
   *
   * @param value the integer value stored in the file
   * @return the enum value
   */
  export function valueOf(value: number): ColorEffectSort {
    for (const ces of allValues) {
      if (ces === value || ces + 500 === value) {
        return ces;
      }
    }
    return ColorEffectSort.Alpha;
  }

  /**
   * Java getValue(): the integer value stored in the file (raw value + 500).
   *
   * @param v the enum value
   * @return the integer value stored in the file
   */
  export function getValue(v: ColorEffectSort): number {
    return v + 500;
  }
}
