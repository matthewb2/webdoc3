/**
 * Type of binary data.
 * Ported from hwplib's `object.docinfo.bindata.BinDataType`.
 * Stored byte values; valueOf default = Link.
 */
export enum BinDataType {
  /** LINK. Reference to an external picture file */
  Link = 0,
  /** EMBEDDING. Picture file is embedded */
  Embedding = 1,
  /** STORAGE. OLE is embedded */
  Storage = 2,
}

export namespace BinDataType {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): BinDataType {
    return (BinDataType as Record<number, string | undefined>)[value] !== undefined
      ? (value as BinDataType)
      : BinDataType.Link;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: BinDataType): number {
    return v;
  }
}
