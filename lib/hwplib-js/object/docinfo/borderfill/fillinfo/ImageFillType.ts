/**
 * 이미지 채우기 유형
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.ImageFillType`.
 *
 * @author neolord
 */
export enum ImageFillType {
  /** 바둑판식으로-모두 */
  TileAll = 0,
  /** 바둑판식으로-가로/위 */
  TileHorizonalTop = 1,
  /** 바둑판식으로-가로/아래 */
  TileHorizonalBottom = 2,
  /** 바둑판식으로-세로/왼쪽 */
  TileVerticalLeft = 3,
  /** 바둑판식으로-세로/오른쪽 */
  TileVerticalRight = 4,
  /** 크기에 맞추어 */
  FitSize = 5,
  /** 가운데로 */
  Center = 6,
  /** 가운데 위로 */
  CenterTop = 7,
  /** 가운데 아래로 */
  CenterBottom = 8,
  /** 왼쪽 가운데로 */
  LeftCenter = 9,
  /** 왼쪽 위로 */
  LeftTop = 10,
  /** 왼쪽 아래로 */
  LeftBottom = 11,
  /** 오른쪽 가운데로 */
  RightCenter = 12,
  /** 오른쪽 위로 */
  RightTop = 13,
  /** 오른쪽 아래로 */
  RightBottom = 14,
  /** 원래 크기에 비래하여 */
  Zoom = 15,
}

export namespace ImageFillType {
  /** Java valueOf(byte): the matching constant, or the default (Center) when unknown. */
  export function valueOf(value: number): ImageFillType {
    return (ImageFillType as Record<number, string | undefined>)[value] !== undefined
      ? (value as ImageFillType)
      : ImageFillType.Center;
  }

  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: ImageFillType): number {
    return v;
  }
}
