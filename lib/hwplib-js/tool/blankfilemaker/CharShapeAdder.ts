import type { CharShape } from "../../object/docinfo/CharShape.js";
import type { DocInfo } from "../../object/docinfo/DocInfo.js";

export class CharShapeAdder {
  public static add(docInfo: DocInfo): void {
    CharShapeAdder.charShape1(docInfo.addNewCharShape());
    CharShapeAdder.charShape2(docInfo.addNewCharShape());
    CharShapeAdder.charShape3(docInfo.addNewCharShape());
    CharShapeAdder.charShape4(docInfo.addNewCharShape());
    CharShapeAdder.charShape5(docInfo.addNewCharShape());
  }

  private static charShape1(charShape: CharShape): void {
    charShape.getFaceNameIds().setForAll(1);
    charShape.getRatios().setForAll(100);
    charShape.getCharSpaces().setForAll(0);
    charShape.getRelativeSizes().setForAll(100);
    charShape.getCharOffsets().setForAll(0);
    charShape.setBaseSize(1000);
    charShape.getProperty().setValue(0);
    charShape.setShadowGap1(10);
    charShape.setShadowGap2(10);
    charShape.getCharColor().setValue(0);
    charShape.getUnderLineColor().setValue(0);
    charShape.getShadeColor().setValue(-1);
    charShape.getShadowColor().setValue(11711154);
    charShape.setBorderFillId(2);
    charShape.getStrikeLineColor().setValue(0);
  }

  private static charShape2(charShape: CharShape): void {
    charShape.getFaceNameIds().setForAll(0);
    charShape.getRatios().setForAll(100);
    charShape.getCharSpaces().setForAll(0);
    charShape.getRelativeSizes().setForAll(100);
    charShape.getCharOffsets().setForAll(0);
    charShape.setBaseSize(1000);
    charShape.getProperty().setValue(0);
    charShape.setShadowGap1(10);
    charShape.setShadowGap2(10);
    charShape.getCharColor().setValue(0);
    charShape.getUnderLineColor().setValue(0);
    charShape.getShadeColor().setValue(-1);
    charShape.getShadowColor().setValue(11711154);
    charShape.setBorderFillId(2);
    charShape.getStrikeLineColor().setValue(0);
  }

  private static charShape3(charShape: CharShape): void {
    charShape.getFaceNameIds().setForAll(0);
    charShape.getRatios().setForAll(100);
    charShape.getCharSpaces().setForAll(0);
    charShape.getRelativeSizes().setForAll(100);
    charShape.getCharOffsets().setForAll(0);
    charShape.setBaseSize(900);
    charShape.getProperty().setValue(0);
    charShape.setShadowGap1(10);
    charShape.setShadowGap2(10);
    charShape.getCharColor().setValue(0);
    charShape.getUnderLineColor().setValue(0);
    charShape.getShadeColor().setValue(-1);
    charShape.getShadowColor().setValue(11711154);
    charShape.setBorderFillId(2);
    charShape.getStrikeLineColor().setValue(0);
  }

  private static charShape4(charShape: CharShape): void {
    charShape.getFaceNameIds().setForAll(1);
    charShape.getRatios().setForAll(100);
    charShape.getCharSpaces().setForAll(0);
    charShape.getRelativeSizes().setForAll(100);
    charShape.getCharOffsets().setForAll(0);
    charShape.setBaseSize(900);
    charShape.getProperty().setValue(0);
    charShape.setShadowGap1(10);
    charShape.setShadowGap2(10);
    charShape.getCharColor().setValue(0);
    charShape.getUnderLineColor().setValue(0);
    charShape.getShadeColor().setValue(-1);
    charShape.getShadowColor().setValue(11711154);
    charShape.setBorderFillId(2);
    charShape.getStrikeLineColor().setValue(0);
  }

  private static charShape5(charShape: CharShape): void {
    charShape.getFaceNameIds().setForAll(0);
    charShape.getRatios().setForAll(100);
    charShape.getCharSpaces().setForAll(-5);
    charShape.getRelativeSizes().setForAll(100);
    charShape.getCharOffsets().setForAll(0);
    charShape.setBaseSize(900);
    charShape.getProperty().setValue(0);
    charShape.setShadowGap1(10);
    charShape.setShadowGap2(10);
    charShape.getCharColor().setValue(0);
    charShape.getUnderLineColor().setValue(0);
    charShape.getShadeColor().setValue(-1);
    charShape.getShadowColor().setValue(11711154);
    charShape.setBorderFillId(2);
    charShape.getStrikeLineColor().setValue(0);
  }
}
