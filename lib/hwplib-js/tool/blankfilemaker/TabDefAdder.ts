import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import type { TabDef } from "../../object/docinfo/TabDef.js";

export class TabDefAdder {
  public static add(docInfo: DocInfo): void {
    TabDefAdder.tabDef1(docInfo.addNewTabDef());
    TabDefAdder.tabDef2(docInfo.addNewTabDef());
  }

  private static tabDef1(tabDef: TabDef): void {
    tabDef.getProperty().setValue(0);
  }

  private static tabDef2(tabDef: TabDef): void {
    tabDef.getProperty().setValue(1);
  }
}
