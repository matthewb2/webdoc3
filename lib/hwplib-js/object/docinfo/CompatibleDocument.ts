import type { CompatibleDocumentSort } from "./compatibledocument/CompatibleDocumentSort.js";

/**
 * Record for a compatible document.
 * Ported from hwplib's `object.docinfo.CompatibleDocument`.
 */
export class CompatibleDocument {
  /** kind of target program */
  private targetProgream: CompatibleDocumentSort | null = null;

  constructor() {}

  getTargetProgream(): CompatibleDocumentSort | null {
    return this.targetProgream;
  }

  setTargetProgream(targetProgream: CompatibleDocumentSort | null): void {
    this.targetProgream = targetProgream;
  }

  clone(): CompatibleDocument {
    const cloned = new CompatibleDocument();
    cloned.targetProgream = this.targetProgream;
    return cloned;
  }
}
