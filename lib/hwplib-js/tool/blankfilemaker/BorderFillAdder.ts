import type { BorderFill } from "../../object/docinfo/BorderFill.js";
import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import { BorderThickness } from "../../object/docinfo/borderfill/BorderThickness.js";
import { BorderType } from "../../object/docinfo/borderfill/BorderType.js";
import type { EachBorder } from "../../object/docinfo/borderfill/EachBorder.js";
import type { PatternFill } from "../../object/docinfo/borderfill/fillinfo/PatternFill.js";
import { PatternType } from "../../object/docinfo/borderfill/fillinfo/PatternType.js";

export class BorderFillAdder {
  public static add(docInfo: DocInfo): void {
    BorderFillAdder.borderFill1(docInfo.addNewBorderFill());
    BorderFillAdder.borderFill2(docInfo.addNewBorderFill());
  }

  private static borderFill1(bf: BorderFill): void {
    bf.getProperty().setValue(0);
    BorderFillAdder.border(bf.getLeftBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getRightBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getLeftBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getTopBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getBottomBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getDiagonalBorder(), BorderType.Solid, BorderThickness.MM0_1, 0);
    bf.getFillInfo().getType().setValue(0);
  }

  private static border(
    border: EachBorder,
    type: BorderType,
    thickness: BorderThickness,
    color: number,
  ): void {
    border.setType(type);
    border.setThickness(thickness);
    border.getColor().setValue(color);
  }

  private static borderFill2(bf: BorderFill): void {
    bf.getProperty().setValue(0);
    BorderFillAdder.border(bf.getLeftBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getRightBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getLeftBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getTopBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getBottomBorder(), BorderType.None, BorderThickness.MM0_1, 0);
    BorderFillAdder.border(bf.getDiagonalBorder(), BorderType.Solid, BorderThickness.MM0_1, 0);
    bf.getFillInfo().getType().setPatternFill(true);
    bf.getFillInfo().createPatternFill();
    const pf: PatternFill = bf.getFillInfo().getPatternFill()!;
    pf.getBackColor().setValue(-1);
    pf.getPatternColor().setValue(-16777216);
    pf.setPatternType(PatternType.None);
  }
}
