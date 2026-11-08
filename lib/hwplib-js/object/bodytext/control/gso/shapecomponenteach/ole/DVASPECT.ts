/**
 * windows API DVASPECT enumeration
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ole.DVASPECT`.
 * Stored byte values; valueOf default = CONTENT.
 *
 * @author neolord
 */
export enum DVASPECT {
  /**
   * CONTENT
   */
  CONTENT = 1,
  /**
   * THUMBNAIL
   */
  THUMBNAIL = 2,
  /**
   * ICON
   */
  ICON = 4,
  /**
   * DOCPRINT
   */
  DOCPRINT = 8,
}

export namespace DVASPECT {
  /** Java valueOf(byte): the matching constant, or CONTENT when the value is unknown. */
  export function valueOf(value: number): DVASPECT {
    return (DVASPECT as Record<number, string | undefined>)[value] !== undefined
      ? (value as DVASPECT)
      : DVASPECT.CONTENT;
  }
  /** Java getValue(): the stored numeric value (identity, since the member value IS the byte). */
  export function getValue(v: DVASPECT): number {
    return v;
  }
}
