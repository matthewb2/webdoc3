/**
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.textart.TextArtShape`.
 * Stored byte values; valueOf default = PARALLELOGRAM.
 */
export enum TextArtShape {
  PARALLELOGRAM = 0,
  INVERTED_PARALLELOGRAM = 1,
  INVERTED_UPWARD_CASCADE = 2,
  INVERTED_DOWNWARD_CASCADE = 3,
  UPWARD_CASCADE = 4,
  DOWNWARD_CASCADE = 5,
  REDUCE_RIGHT = 6,
  REDUCE_LEFT = 7,
  ISOSCELES_TRAPEZOID = 8,
  INVERTED_ISOSCELES_TRAPEZOID = 9,
  TOP_RIBBON_RECTANGLE = 10,
  BOTTOM_RIBBON_RECTANGLE = 11,
  CHEVRON_DOWN = 12,
  CHEVRON = 13,
  BOW_TIE = 14,
  HEXAGON = 15,
  WAVE1 = 16,
  WAVE2 = 17,
  WAVE3 = 18,
  WAVE4 = 19,
  LEFT_TILT_CYLINDER = 20,
  RIGHT_TILT_CYLINDER = 21,
  BOTTOM_WIDE_CYLINDER = 22,
  TOP_WIDE_CYLINDER = 23,
  THIN_CURVE_UP1 = 24,
  THIN_CURVE_UP2 = 25,
  THIN_CURVE_DOWN1 = 26,
  THIN_CURVE_DOWN2 = 27,
  INVERSED_FINGERNAIL = 28,
  FINGERNAIL = 29,
  GINKO_LEAF1 = 30,
  GINKO_LEAF2 = 31,
  INFLATE_RIGHT = 32,
  INFLATE_LEFT = 33,
  INFLATE_UP_CONVEX = 34,
  INFLATE_BOTTOM_CONVEX = 35,
  DEFLATE_TOP = 36,
  DEFLATE_BOTTOM = 37,
  DEFLATE = 38,
  INFLATE = 39,
  INFLATE_TOP = 40,
  INFLATE_BOTTOM = 41,
  RECTANGLE = 42,
  LEFT_CYLINDER = 43,
  CYLINDER = 44,
  RIGHT_CYLINDER = 45,
  CIRCLE = 46,
  CURVE_DOWN = 47,
  ARCH_UP = 48,
  ARCH_DOWN = 49,
  SINGLE_LINE_CIRCLE1 = 50,
  SINGLE_LINE_CIRCLE2 = 51,
  TRIPLE_LINE_CIRCLE1 = 52,
  TRIPLE_LINE_CIRCLE2 = 53,
  DOUBLE_LINE_CIRCLE = 54,
}

export namespace TextArtShape {
  /** Java valueOf(byte): the matching constant, or PARALLELOGRAM when the value is unknown. */
  export function valueOf(value: number): TextArtShape {
    return (TextArtShape as Record<number, string | undefined>)[value] !== undefined
      ? (value as TextArtShape)
      : TextArtShape.PARALLELOGRAM;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: TextArtShape): number {
    return v;
  }
}
