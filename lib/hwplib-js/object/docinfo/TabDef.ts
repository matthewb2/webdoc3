import { TabDefProperty } from "./tabdef/TabDefProperty.js";
import { TabInfo } from "./tabdef/TabInfo.js";

/**
 * Record for a tab definition.
 * Ported from hwplib's `object.docinfo.TabDef`.
 */
export class TabDef {
  /** property */
  private property: TabDefProperty;
  /** list of tab info */
  private tabInfoList: TabInfo[];

  constructor() {
    this.property = new TabDefProperty();
    this.tabInfoList = [];
  }

  getProperty(): TabDefProperty {
    return this.property;
  }

  addNewTabInfo(): TabInfo {
    const ti = new TabInfo();
    this.tabInfoList.push(ti);
    return ti;
  }

  getTabInfoList(): TabInfo[] {
    return this.tabInfoList;
  }

  clone(): TabDef {
    const cloned = new TabDef();
    cloned.property.copy(this.property);

    cloned.tabInfoList.length = 0;
    for (const tabInfo of this.tabInfoList) {
      cloned.tabInfoList.push(tabInfo.clone());
    }

    return cloned;
  }
}
