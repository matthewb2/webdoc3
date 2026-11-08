import { BinDataProperty } from "./bindata/BinDataProperty.js";

/**
 * Record representing binary data.
 * Ported from hwplib's `object.docinfo.BinData`.
 */
export class BinData {
  /** property */
  private property: BinDataProperty;
  /** absolute path of the linked file, when Type is "LINK" */
  private absolutePathForLink: string | null = null;
  /** relative path of the linked file, when Type is "LINK" */
  private relativePathForLink: string | null = null;
  /** id of the binary data stored in BINDATASTORAGE, when Type is "EMBEDDING" or "STORAGE" */
  private binDataID = 0;
  /** extension (without ".") when Type is "EMBEDDING" */
  private extensionForEmbedding: string | null = null;

  constructor() {
    this.property = new BinDataProperty();
  }

  getProperty(): BinDataProperty {
    return this.property;
  }

  getAbsolutePathForLink(): string | null {
    return this.absolutePathForLink;
  }

  setAbsolutePathForLink(absolutePathForLink: string | null): void {
    this.absolutePathForLink = absolutePathForLink;
  }

  getRelativePathForLink(): string | null {
    return this.relativePathForLink;
  }

  setRelativePathForLink(relativePathForLink: string | null): void {
    this.relativePathForLink = relativePathForLink;
  }

  getBinDataID(): number {
    return this.binDataID;
  }

  setBinDataID(binDataID: number): void {
    this.binDataID = binDataID;
  }

  getExtensionForEmbedding(): string | null {
    return this.extensionForEmbedding;
  }

  setExtensionForEmbedding(extensionForEmbedding: string | null): void {
    this.extensionForEmbedding = extensionForEmbedding;
  }

  clone(): BinData {
    const cloned = new BinData();
    cloned.property.copy(this.property);
    cloned.absolutePathForLink = this.absolutePathForLink;
    cloned.relativePathForLink = this.relativePathForLink;
    cloned.binDataID = this.binDataID;
    cloned.extensionForEmbedding = this.extensionForEmbedding;
    return cloned;
  }
}
