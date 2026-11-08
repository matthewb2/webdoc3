import type { ControlColumnDefine } from "../../object/bodytext/control/ControlColumnDefine.js";
import { ControlType } from "../../object/bodytext/control/ControlType.js";
import type { CtrlHeaderColumnDefine } from "../../object/bodytext/control/ctrlheader/CtrlHeaderColumnDefine.js";
import type { Paragraph } from "../../object/bodytext/paragraph/Paragraph.js";
import { BorderThickness } from "../../object/docinfo/borderfill/BorderThickness.js";
import { BorderType } from "../../object/docinfo/borderfill/BorderType.js";

export class ColumnDefineAdder {
  public static add(paragraph: Paragraph): void {
    const columnDefine = paragraph.addNewControl(
      ControlType.ColumnDefine,
    ) as ControlColumnDefine;
    ColumnDefineAdder.header(columnDefine.getHeader());
  }

  private static header(header: CtrlHeaderColumnDefine): void {
    header.getProperty().setValue(4100);
    header.setGapBetweenColumn(0);
    header.setProperty2(0);
    header.getDivideLine().setType(BorderType.None);
    header.getDivideLine().setThickness(BorderThickness.MM0_1);
    header.getDivideLine().getColor().setValue(0);
  }
}
