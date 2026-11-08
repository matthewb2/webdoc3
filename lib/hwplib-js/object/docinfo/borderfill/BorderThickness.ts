/**
 * 테두리선의 두께
 * Ported from hwplib's `object.docinfo.borderfill.BorderThickness`.
 *
 * @author neolord
 */
export enum BorderThickness {
  /** 0.1 mm */
  MM0_1 = 0,
  /** 0.12 mm */
  MM0_12 = 1,
  /** 0.15 mm */
  MM0_15 = 2,
  /** 0.2 mm */
  MM0_2 = 3,
  /** 0.25 mm */
  MM0_25 = 4,
  /** 0.3 mm */
  MM0_3 = 5,
  /** 0.4 mm */
  MM0_4 = 6,
  /** 0.5 mm */
  MM0_5 = 7,
  /** 0.6 mm */
  MM0_6 = 8,
  /** 0.7 mm */
  MM0_7 = 9,
  /** 1.0 mm */
  MM1_0 = 10,
  /** 1.5 mm */
  MM1_5 = 11,
  /** 2.0 mm */
  MM2_0 = 12,
  /** 3.0 mm */
  MM3_0 = 13,
  /** 4.0 mm */
  MM4_0 = 14,
  /** 5.0 mm */
  MM5_0 = 15,
}

export namespace BorderThickness {
  /** Java valueOf(byte): the matching constant, or the default (MM0_1) when unknown. */
  export function valueOf(value: number): BorderThickness {
    return (BorderThickness as Record<number, string | undefined>)[value] !== undefined
      ? (value as BorderThickness)
      : BorderThickness.MM0_1;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: BorderThickness): number {
    return v;
  }
}
