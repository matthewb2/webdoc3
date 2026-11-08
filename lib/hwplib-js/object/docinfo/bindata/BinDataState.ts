/**
 * State of binary data.
 * Ported from hwplib's `object.docinfo.bindata.BinDataState`.
 * Stored byte values; valueOf default = NotAccess.
 */
export enum BinDataState {
  /** Has not been accessed yet */
  NotAccess = 0,
  /** Access succeeded and the file was found */
  SuccessAccess = 1,
  /** Access failed (error state) */
  FailAccess = 2,
  /** Link access failed but was ignored */
  FailAccessButIgnore = 3,
}

export namespace BinDataState {
  /** Java valueOf(byte): the matching constant, or the default when the value is unknown. */
  export function valueOf(value: number): BinDataState {
    return (BinDataState as Record<number, string | undefined>)[value] !== undefined
      ? (value as BinDataState)
      : BinDataState.NotAccess;
  }
  /** Java getValue(): the stored numeric value (identity). */
  export function getValue(v: BinDataState): number {
    return v;
  }
}
