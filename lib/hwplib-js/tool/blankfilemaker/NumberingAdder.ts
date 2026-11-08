import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import type { Numbering } from "../../object/docinfo/Numbering.js";
import type { LevelNumbering } from "../../object/docinfo/numbering/LevelNumbering.js";

export class NumberingAdder {
  public static add(docInfo: DocInfo): void {
    NumberingAdder.numbering1(docInfo.addNewNumbering());
  }

  private static numbering1(numbering: Numbering): void {
    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(1);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(12);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(50);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(-1);
      levelNumbering.getNumberFormat().fromUTF16LEString("^1.");
      levelNumbering.setStartNumber(1);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(2);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(268);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(50);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(-1);
      levelNumbering.getNumberFormat().fromUTF16LEString("^2.");
      levelNumbering.setStartNumber(1);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(3);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(12);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(50);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(-1);
      levelNumbering.getNumberFormat().fromUTF16LEString("^3)");
      levelNumbering.setStartNumber(1);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(4);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(268);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(50);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(-1);
      levelNumbering.getNumberFormat().fromUTF16LEString("^4)");
      levelNumbering.setStartNumber(1);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(5);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(12);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(50);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(-1);
      levelNumbering.getNumberFormat().fromUTF16LEString("(^5)");
      levelNumbering.setStartNumber(1);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(6);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(268);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(50);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(-1);
      levelNumbering.getNumberFormat().fromUTF16LEString("(^6)");
      levelNumbering.setStartNumber(1);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(7);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(44);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(50);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(-1);
      levelNumbering.getNumberFormat().fromUTF16LEString("^7");
      levelNumbering.setStartNumber(1);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(8);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(0);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(0);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(0);
      levelNumbering.getNumberFormat().fromUTF16LEString(null);
      levelNumbering.setStartNumber(0);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(9);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(0);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(0);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(0);
      levelNumbering.getNumberFormat().fromUTF16LEString(null);
      levelNumbering.setStartNumber(0);
    } catch (e) {
      console.error(e);
    }

    try {
      const levelNumbering: LevelNumbering = numbering.getLevelNumbering(10);
      levelNumbering.getParagraphHeadInfo().getProperty().setValue(0);
      levelNumbering.getParagraphHeadInfo().setCorrectionValueForWidth(0);
      levelNumbering.getParagraphHeadInfo().setDistanceFromBody(0);
      levelNumbering.getParagraphHeadInfo().setCharShapeID(0);
      levelNumbering.getNumberFormat().fromUTF16LEString(null);
      levelNumbering.setStartNumber(0);
    } catch (e) {
      console.error(e);
    }
  }
}
