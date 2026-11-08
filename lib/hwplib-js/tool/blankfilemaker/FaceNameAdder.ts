import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import type { FaceName } from "../../object/docinfo/FaceName.js";
import type { FontTypeInfo } from "../../object/docinfo/facename/FontTypeInfo.js";

export class FaceNameAdder {
  public static add(docInfo: DocInfo): void {
    FaceNameAdder.hangulFaceName(docInfo);
    FaceNameAdder.englishFaceName(docInfo);
    FaceNameAdder.hanjaFaceName(docInfo);
    FaceNameAdder.japaneseFaceName(docInfo);
    FaceNameAdder.etcFaceName(docInfo);
    FaceNameAdder.symbolFaceName(docInfo);
    FaceNameAdder.userFaceName(docInfo);
  }

  private static hangulFaceName(docInfo: DocInfo): void {
    FaceNameAdder.setFaceName1(docInfo.addNewHangulFaceName());
    FaceNameAdder.setFaceName2(docInfo.addNewHangulFaceName());
  }

  private static setFaceName1(faceName: FaceName): void {
    faceName.getProperty().setValue(97);
    faceName.setName("함초롬돋움");
    faceName.setSubstituteFontType(null);
    faceName.setSubstituteFontName(null);

    const fontTypeInfo: FontTypeInfo = faceName.getFontTypeInfo();
    fontTypeInfo.setFontType(2);
    fontTypeInfo.setSerifType(3);
    fontTypeInfo.setThickness(5);
    fontTypeInfo.setRatio(4);
    fontTypeInfo.setContrast(0);
    fontTypeInfo.setStrokeDeviation(1);
    fontTypeInfo.setCharacterStrokeType(1);
    fontTypeInfo.setCharacterShape(1);
    fontTypeInfo.setMiddleLine(1);
    fontTypeInfo.setxHeight(1);

    faceName.setBaseFontName("HCR Dotum");
  }

  private static setFaceName2(faceName: FaceName): void {
    faceName.getProperty().setValue(97);
    faceName.setName("함초롬바탕");
    faceName.setSubstituteFontType(null);
    faceName.setSubstituteFontName(null);

    const fontTypeInfo: FontTypeInfo = faceName.getFontTypeInfo();
    fontTypeInfo.setFontType(2);
    fontTypeInfo.setSerifType(3);
    fontTypeInfo.setThickness(5);
    fontTypeInfo.setRatio(4);
    fontTypeInfo.setContrast(0);
    fontTypeInfo.setStrokeDeviation(1);
    fontTypeInfo.setCharacterStrokeType(1);
    fontTypeInfo.setCharacterShape(1);
    fontTypeInfo.setMiddleLine(1);
    fontTypeInfo.setxHeight(1);

    faceName.setBaseFontName("HCR Batang");
  }

  private static englishFaceName(docInfo: DocInfo): void {
    FaceNameAdder.setFaceName1(docInfo.addNewEnglishFaceName());
    FaceNameAdder.setFaceName2(docInfo.addNewEnglishFaceName());
  }

  private static hanjaFaceName(docInfo: DocInfo): void {
    FaceNameAdder.setFaceName1(docInfo.addNewHanjaFaceName());
    FaceNameAdder.setFaceName2(docInfo.addNewHanjaFaceName());
  }

  private static japaneseFaceName(docInfo: DocInfo): void {
    FaceNameAdder.setFaceName1(docInfo.addNewJapaneseFaceName());
    FaceNameAdder.setFaceName2(docInfo.addNewJapaneseFaceName());
  }

  private static etcFaceName(docInfo: DocInfo): void {
    FaceNameAdder.setFaceName1(docInfo.addNewEtcFaceName());
    FaceNameAdder.setFaceName2(docInfo.addNewEtcFaceName());
  }

  private static symbolFaceName(docInfo: DocInfo): void {
    FaceNameAdder.setFaceName1(docInfo.addNewSymbolFaceName());
    FaceNameAdder.setFaceName2(docInfo.addNewSymbolFaceName());
  }

  private static userFaceName(docInfo: DocInfo): void {
    FaceNameAdder.setFaceName1(docInfo.addNewUserFaceName());
    FaceNameAdder.setFaceName2(docInfo.addNewUserFaceName());
  }
}
