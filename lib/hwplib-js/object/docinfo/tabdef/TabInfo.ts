import type { TabSort } from "./TabSort.js";
import type { BorderType } from "../borderfill/BorderType.js";

/**
 * Object for tab information.
 * Ported from hwplib's `object.docinfo.tabdef.TabInfo`.
 */
export class TabInfo {
  /** Position of the tab */
  private position: number = 0;
  /** Sort (kind) of the tab */
  private tabSort: TabSort | null = null;
  /** Fill sort (kind) */
  private fillSort: BorderType | null = null;

  public constructor() {}

  /** Returns the position of the tab. */
  public getPosition(): number {
    return this.position;
  }

  /** Sets the position of the tab. */
  public setPosition(position: number): void {
    this.position = position;
  }

  /** Returns the sort of the tab. */
  public getTabSort(): TabSort | null {
    return this.tabSort;
  }

  /** Sets the sort of the tab. */
  public setTabSort(tabSort: TabSort): void {
    this.tabSort = tabSort;
  }

  /** Returns the fill sort. */
  public getFillSort(): BorderType | null {
    return this.fillSort;
  }

  /** Sets the fill sort. */
  public setFillSort(fillSort: BorderType): void {
    this.fillSort = fillSort;
  }

  public clone(): TabInfo {
    const cloned = new TabInfo();
    cloned.position = this.position;
    cloned.tabSort = this.tabSort;
    cloned.fillSort = this.fillSort;
    return cloned;
  }
}
