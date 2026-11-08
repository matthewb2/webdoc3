/**
 * Compression method of binary data.
 * Ported from hwplib's `object.docinfo.bindata.BinDataCompress`.
 * Stored byte values; valueOf default = ByStorageDefault.
 */
export enum BinDataCompress {
  /** Follow the default mode of the storage */
  ByStorageDefault = 0,
  /** Always compress */
  Compress = 1,
  /** Never compress */
  NoCompress = 2,
}

export namespace BinDataCompress {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): BinDataCompress {
    return (BinDataCompress as Record<number, string | undefined>)[value] !== undefined
      ? (value as BinDataCompress)
      : BinDataCompress.ByStorageDefault;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: BinDataCompress): number {
    return v;
  }
}
