import { BitFlag } from "../../../util/binary/BitFlag.js";
import { BinDataType } from "./BinDataType.js";
import { BinDataCompress } from "./BinDataCompress.js";
import { BinDataState } from "./BinDataState.js";

/**
 * Property of binary data.
 * Ported from hwplib's `object.docinfo.bindata.BinDataProperty`.
 */
export class BinDataProperty {
  /** The value stored in the file (unsigned 2 byte) */
  private value: number = 0;

  public constructor() {}

  /** Returns the value stored in the file. */
  public getValue(): number {
    return this.value;
  }

  /** Sets the value stored in the file. */
  public setValue(value: number): void {
    this.value = value;
  }

  /** Returns the type of the binary data. (0~3 BitFlag) */
  public getType(): BinDataType {
    return BinDataType.valueOf(BitFlag.getRange(this.value, 0, 3));
  }

  /** Sets the type of the binary data. (0~3 BitFlag) */
  public setType(type: BinDataType): void {
    this.value = BitFlag.setRange(this.value, 0, 3, type);
  }

  /** Returns the compression method of the binary data. (4~5 BitFlag) */
  public getCompress(): BinDataCompress {
    return BinDataCompress.valueOf(BitFlag.getRange(this.value, 4, 5));
  }

  /** Sets the compression method of the binary data. (4~5 BitFlag) */
  public setCompress(compress: BinDataCompress): void {
    this.value = BitFlag.setRange(this.value, 4, 5, compress);
  }

  /** Returns the state of the binary data. (8~9 BitFlag) */
  public getState(): BinDataState {
    return BinDataState.valueOf(BitFlag.getRange(this.value, 8, 9));
  }

  /** Sets the state of the binary data. (8~9 BitFlag) */
  public setState(state: BinDataState): void {
    this.value = BitFlag.setRange(this.value, 8, 9, state);
  }

  public copy(from: BinDataProperty): void {
    this.value = from.value;
  }
}
