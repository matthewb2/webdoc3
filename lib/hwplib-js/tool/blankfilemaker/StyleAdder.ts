import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import type { Style } from "../../object/docinfo/Style.js";

export class StyleAdder {
  public static add(docInfo: DocInfo): void {
    StyleAdder.style1(docInfo.addNewStyle());
    StyleAdder.style2(docInfo.addNewStyle());
    StyleAdder.style3(docInfo.addNewStyle());
    StyleAdder.style4(docInfo.addNewStyle());
    StyleAdder.style5(docInfo.addNewStyle());
    StyleAdder.style6(docInfo.addNewStyle());
    StyleAdder.style7(docInfo.addNewStyle());
    StyleAdder.style8(docInfo.addNewStyle());
    StyleAdder.style9(docInfo.addNewStyle());
    StyleAdder.style10(docInfo.addNewStyle());
    StyleAdder.style11(docInfo.addNewStyle());
    StyleAdder.style12(docInfo.addNewStyle());
    StyleAdder.style13(docInfo.addNewStyle());
    StyleAdder.style14(docInfo.addNewStyle());
  }

  private static style1(style: Style): void {
    style.setHangulName("바탕글");
    style.setEnglishName("Normal");
    style.getProeprty().setValue(0);
    style.setNextStyleId(0);
    style.setLanguageId(1042);
    style.setParaShapeId(3);
    style.setCharShapeId(0);
  }

  private static style2(style: Style): void {
    style.setHangulName("본문");
    style.setEnglishName("Body");
    style.getProeprty().setValue(0);
    style.setNextStyleId(1);
    style.setLanguageId(1042);
    style.setParaShapeId(11);
    style.setCharShapeId(0);
  }

  private static style3(style: Style): void {
    style.setHangulName("개요 1");
    style.setEnglishName("Outline 1");
    style.getProeprty().setValue(0);
    style.setNextStyleId(2);
    style.setLanguageId(1042);
    style.setParaShapeId(10);
    style.setCharShapeId(0);
  }

  private static style4(style: Style): void {
    style.setHangulName("개요 2");
    style.setEnglishName("Outline 2");
    style.getProeprty().setValue(0);
    style.setNextStyleId(3);
    style.setLanguageId(1042);
    style.setParaShapeId(9);
    style.setCharShapeId(0);
  }

  private static style5(style: Style): void {
    style.setHangulName("개요 3");
    style.setEnglishName("Outline 3");
    style.getProeprty().setValue(0);
    style.setNextStyleId(4);
    style.setLanguageId(1042);
    style.setParaShapeId(8);
    style.setCharShapeId(0);
  }

  private static style6(style: Style): void {
    style.setHangulName("개요 4");
    style.setEnglishName("Outline 4");
    style.getProeprty().setValue(0);
    style.setNextStyleId(5);
    style.setLanguageId(1042);
    style.setParaShapeId(7);
    style.setCharShapeId(0);
  }

  private static style7(style: Style): void {
    style.setHangulName("개요 5");
    style.setEnglishName("Outline 5");
    style.getProeprty().setValue(0);
    style.setNextStyleId(6);
    style.setLanguageId(1042);
    style.setParaShapeId(6);
    style.setCharShapeId(0);
  }

  private static style8(style: Style): void {
    style.setHangulName("개요 6");
    style.setEnglishName("Outline 6");
    style.getProeprty().setValue(0);
    style.setNextStyleId(7);
    style.setLanguageId(1042);
    style.setParaShapeId(5);
    style.setCharShapeId(0);
  }

  private static style9(style: Style): void {
    style.setHangulName("개요 7");
    style.setEnglishName("Outline 7");
    style.getProeprty().setValue(0);
    style.setNextStyleId(8);
    style.setLanguageId(1042);
    style.setParaShapeId(4);
    style.setCharShapeId(0);
  }

  private static style10(style: Style): void {
    style.setHangulName("쪽 번호");
    style.setEnglishName("Page Number");
    style.getProeprty().setValue(0);
    style.setNextStyleId(9);
    style.setLanguageId(1042);
    style.setParaShapeId(3);
    style.setCharShapeId(1);
  }

  private static style11(style: Style): void {
    style.setHangulName("머리말");
    style.setEnglishName("Header");
    style.getProeprty().setValue(0);
    style.setNextStyleId(10);
    style.setLanguageId(1042);
    style.setParaShapeId(2);
    style.setCharShapeId(2);
  }

  private static style12(style: Style): void {
    style.setHangulName("각주");
    style.setEnglishName("Footnote");
    style.getProeprty().setValue(0);
    style.setNextStyleId(11);
    style.setLanguageId(1042);
    style.setParaShapeId(1);
    style.setCharShapeId(3);
  }

  private static style13(style: Style): void {
    style.setHangulName("미주");
    style.setEnglishName("Endnote");
    style.getProeprty().setValue(0);
    style.setNextStyleId(12);
    style.setLanguageId(1042);
    style.setParaShapeId(1);
    style.setCharShapeId(3);
  }

  private static style14(style: Style): void {
    style.setHangulName("메모");
    style.setEnglishName("Memo");
    style.getProeprty().setValue(0);
    style.setNextStyleId(13);
    style.setLanguageId(1042);
    style.setParaShapeId(0);
    style.setCharShapeId(4);
  }
}
