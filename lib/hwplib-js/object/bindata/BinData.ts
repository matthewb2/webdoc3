import { EmbeddedBinaryData } from "./EmbeddedBinaryData.js";
import type { BinDataCompress } from "../docinfo/bindata/BinDataCompress.js";

/**
 * Binary data, ported from hwplib's `object.bindata.BinData`.
 * Stored in the HWP file's "BinData" storage.
 */
export class BinData {
  /**
   * the list of binary data (such as images) embedded in the HWP file
   */
  private embeddedBinaryDataList: EmbeddedBinaryData[];

  constructor() {
    this.embeddedBinaryDataList = [];
  }

  /**
   * Creates a new embedded binary data object, adds it to the list, and returns it.
   */
  addNewEmbeddedBinaryData(): EmbeddedBinaryData;
  /**
   * Creates a new embedded binary data object with the given values and adds it to the list.
   */
  addNewEmbeddedBinaryData(name: string, data: Uint8Array, compressMethod: BinDataCompress): void;
  addNewEmbeddedBinaryData(
    name?: string,
    data?: Uint8Array,
    compressMethod?: BinDataCompress,
  ): EmbeddedBinaryData | void {
    const ebd = new EmbeddedBinaryData();
    this.embeddedBinaryDataList.push(ebd);
    if (name === undefined) {
      return ebd;
    }
    ebd.setName(name);
    ebd.setData(data!);
    ebd.setCompressMethod(compressMethod!);
  }

  /**
   * Returns the list of embedded binary data.
   */
  getEmbeddedBinaryDataList(): EmbeddedBinaryData[] {
    return this.embeddedBinaryDataList;
  }

  copy(from: BinData, deepCopyImage: boolean): void {
    this.embeddedBinaryDataList.length = 0;
    for (const embeddedBinaryData of from.embeddedBinaryDataList) {
      this.embeddedBinaryDataList.push(embeddedBinaryData.clone(deepCopyImage));
    }
  }
}
