import type { BinDataCompress } from "../docinfo/bindata/BinDataCompress.js";

/**
 * Binary data (such as images) used within the HWP file,
 * ported from hwplib's `object.bindata.EmbeddedBinaryData`.
 */
export class EmbeddedBinaryData {
  /**
   * the name of the binary data
   */
  private name: string | null = null;
  /**
   * the actual data
   */
  private data: Uint8Array | null = null;
  /**
   * the compression method
   */
  private compressMethod: BinDataCompress | null = null;

  constructor() {}

  getName(): string | null {
    return this.name;
  }

  setName(name: string | null): void {
    this.name = name;
  }

  getData(): Uint8Array | null {
    return this.data;
  }

  setData(data: Uint8Array | null): void {
    this.data = data;
  }

  getCompressMethod(): BinDataCompress | null {
    return this.compressMethod;
  }

  setCompressMethod(compressMethod: BinDataCompress | null): void {
    this.compressMethod = compressMethod;
  }

  clone(deepCopyImage: boolean): EmbeddedBinaryData {
    const cloned = new EmbeddedBinaryData();
    cloned.name = this.name;
    if (deepCopyImage) {
      cloned.data = this.data!.slice();
    } else {
      cloned.data = this.data;
    }
    cloned.compressMethod = this.compressMethod;
    return cloned;
  }
}
