import { Section } from "../../object/bodytext/Section.js";
import type { Paragraph } from "../../object/bodytext/paragraph/Paragraph.js";
import type { ParagraphList } from "../../object/bodytext/paragraph/ParagraphList.js";
import type { ParaCharShape } from "../../object/bodytext/paragraph/charshape/ParaCharShape.js";
import type { ParaHeader } from "../../object/bodytext/paragraph/header/ParaHeader.js";
import type { LineSegItem } from "../../object/bodytext/paragraph/lineseg/LineSegItem.js";
import type { ParaLineSeg } from "../../object/bodytext/paragraph/lineseg/ParaLineSeg.js";
import type { ParaText } from "../../object/bodytext/paragraph/text/ParaText.js";
import { SectionDefineAdder } from "./SectionDefineAdder.js";
import { ColumnDefineAdder } from "./ColumnDefineAdder.js";

export class EmptyParagraphAdder {
  public static add(section: Section): void;
  public static add(paragraphList: ParagraphList): void;
  public static add(arg: Section | ParagraphList): void {
    // Faithful port of hwplib's two overloaded `add` methods (Section / ParagraphList).
    // Java dispatches at compile time by static type; TS dispatches at runtime by class.
    if (arg instanceof Section) {
      const paragraph = arg.addNewParagraph();
      EmptyParagraphAdder.header(paragraph.getHeader());
      EmptyParagraphAdder.text(paragraph);
      EmptyParagraphAdder.charShape(paragraph);
      EmptyParagraphAdder.lineSeg(paragraph);
      SectionDefineAdder.add(paragraph);
      ColumnDefineAdder.add(paragraph);
    } else {
      const paragraph = arg.addNewParagraph();
      EmptyParagraphAdder.header2(paragraph.getHeader());
      EmptyParagraphAdder.charShape(paragraph);
    }
  }

  private static header(header: ParaHeader): void {
    header.setLastInList(true);
    header.setCharacterCount(17);
    header.getControlMask().setValue(4);
    header.setParaShapeId(3);
    header.setStyleId(0);
    header.getDivideSort().setValue(3);
    header.setCharShapeCount(1);
    header.setRangeTagCount(0);
    header.setLineAlignCount(1);
    header.setInstanceID(0);
    header.setIsMergedByTrack(0);
  }

  private static header2(header: ParaHeader): void {
    header.setLastInList(true);
    header.setCharacterCount(17);
    header.getControlMask().setValue(4);
    header.setParaShapeId(3);
    header.setStyleId(0);
    header.getDivideSort().setValue(0);
    header.setCharShapeCount(1);
    header.setRangeTagCount(0);
    header.setLineAlignCount(1);
    header.setInstanceID(0);
    header.setIsMergedByTrack(0);
  }

  private static text(paragraph: Paragraph): void {
    paragraph.createText();
    const paraText: ParaText = paragraph.getText()!;

    paraText.addExtendCharForSectionDefine();
    paraText.addExtendCharForColumnDefine();
  }

  private static charShape(paragraph: Paragraph): void {
    paragraph.createCharShape();
    const charShape: ParaCharShape = paragraph.getCharShape()!;
    charShape.addParaCharShape(0, 0);
  }

  private static lineSeg(paragraph: Paragraph): void {
    paragraph.createLineSeg();
    const lineSeg: ParaLineSeg = paragraph.getLineSeg()!;
    const item: LineSegItem = lineSeg.addNewLineSegItem();
    item.setTextStartPosition(0);
    item.setLineVerticalPosition(0);
    item.setLineHeight(1000);
    item.setTextPartHeight(1000);
    item.setDistanceBaseLineToLineVerticalPosition(850);
    item.setLineSpace(600);
    item.setStartPositionFromColumn(0);
    item.setSegmentWidth(42520);
    item.getTag().setValue(393216);
  }
}
