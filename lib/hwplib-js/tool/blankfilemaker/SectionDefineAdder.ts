import type { ControlSectionDefine } from "../../object/bodytext/control/ControlSectionDefine.js";
import { ControlType } from "../../object/bodytext/control/ControlType.js";
import type { CtrlHeaderSectionDefine } from "../../object/bodytext/control/ctrlheader/CtrlHeaderSectionDefine.js";
import type { FootEndNoteShape } from "../../object/bodytext/control/sectiondefine/FootEndNoteShape.js";
import type { PageBorderFill } from "../../object/bodytext/control/sectiondefine/PageBorderFill.js";
import type { PageDef } from "../../object/bodytext/control/sectiondefine/PageDef.js";
import type { Paragraph } from "../../object/bodytext/paragraph/Paragraph.js";
import { BorderThickness } from "../../object/docinfo/borderfill/BorderThickness.js";
import { BorderType } from "../../object/docinfo/borderfill/BorderType.js";

export class SectionDefineAdder {
  public static add(paragraph: Paragraph): void {
    const sectionDefine = paragraph.addNewControl(
      ControlType.SectionDefine,
    ) as ControlSectionDefine;
    SectionDefineAdder.header(sectionDefine.getHeader());
    SectionDefineAdder.pageDef(sectionDefine.getPageDef());
    SectionDefineAdder.footNoteShape(sectionDefine.getFootNoteShape());
    SectionDefineAdder.endNoteShape(sectionDefine.getEndNoteShape());
    SectionDefineAdder.pageBorderFill(sectionDefine.getBothPageBorderFill());
    SectionDefineAdder.pageBorderFill(sectionDefine.getEvenPageBorderFill());
    SectionDefineAdder.pageBorderFill(sectionDefine.getOddPageBorderFill());
  }

  private static header(header: CtrlHeaderSectionDefine): void {
    header.getProperty().setValue(0);
    header.setColumnGap(1134);
    header.setVerticalLineAlign(0);
    header.setHorizontalLineAlign(0);
    header.setDefaultTabGap(8000);
    header.setNumberParaShapeId(1);
    header.setPageStartNumber(0);
    header.setImageStartNumber(0);
    header.setTableStartNumber(0);
    header.setEquationStartNumber(0);
    header.setDefaultLanguage(0);
  }

  private static pageDef(pageDef: PageDef): void {
    pageDef.setPaperWidth(59528);
    pageDef.setPaperHeight(84188);
    pageDef.setLeftMargin(8504);
    pageDef.setRightMargin(8504);
    pageDef.setTopMargin(5668);
    pageDef.setBottomMargin(4252);
    pageDef.setHeaderMargin(4252);
    pageDef.setFooterMargin(4252);
    pageDef.setGutterMargin(0);
    pageDef.getProperty().setValue(0);
  }

  private static footNoteShape(footNoteShape: FootEndNoteShape): void {
    footNoteShape.getProperty().setValue(0);
    footNoteShape.getUserSymbol().fromUTF16LEString("\u0000");
    footNoteShape.getBeforeDecorativeLetter().fromUTF16LEString("\u0000");
    footNoteShape.getAfterDecorativeLetter().fromUTF16LEString(")");
    footNoteShape.setStartNumber(1);
    footNoteShape.setDivideLineLength(-1);
    footNoteShape.setDivideLineTopMargin(850);
    footNoteShape.setDivideLineBottomMargin(567);
    footNoteShape.setBetweenNotesMargin(283);
    footNoteShape.getDivideLine().setType(BorderType.Solid);
    footNoteShape.getDivideLine().setThickness(BorderThickness.MM0_12);
    footNoteShape.getDivideLine().getColor().setValue(0);
    footNoteShape.setUnknown(0);
  }

  private static endNoteShape(endNoteShape: FootEndNoteShape): void {
    endNoteShape.getProperty().setValue(0);
    endNoteShape.getUserSymbol().fromUTF16LEString("\u0000");
    endNoteShape.getBeforeDecorativeLetter().fromUTF16LEString("\u0000");
    endNoteShape.getAfterDecorativeLetter().fromUTF16LEString(")");
    endNoteShape.setStartNumber(1);
    endNoteShape.setDivideLineLength(14692344);
    endNoteShape.setDivideLineTopMargin(850);
    endNoteShape.setDivideLineBottomMargin(567);
    endNoteShape.setBetweenNotesMargin(0);
    endNoteShape.getDivideLine().setType(BorderType.Solid);
    endNoteShape.getDivideLine().setThickness(BorderThickness.MM0_12);
    endNoteShape.getDivideLine().getColor().setValue(0);
    endNoteShape.setUnknown(0);
  }

  private static pageBorderFill(pageBorderFill: PageBorderFill): void {
    pageBorderFill.getProperty().setValue(1);
    pageBorderFill.setLeftGap(1417);
    pageBorderFill.setRightGap(1417);
    pageBorderFill.setTopGap(1417);
    pageBorderFill.setBottomGap(1417);
    pageBorderFill.setBorderFillId(1);
  }
}
