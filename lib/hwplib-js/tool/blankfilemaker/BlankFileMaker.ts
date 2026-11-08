import { HWPFile } from "../../object/HWPFile.js";
import type { Section } from "../../object/bodytext/Section.js";
import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import type { DocumentProperties } from "../../object/docinfo/DocumentProperties.js";
import type { LayoutCompatibility } from "../../object/docinfo/LayoutCompatibility.js";
import { CompatibleDocumentSort } from "../../object/docinfo/compatibledocument/CompatibleDocumentSort.js";
import type { CaretPosition } from "../../object/docinfo/documentproperties/CaretPosition.js";
import type { StartNumber } from "../../object/docinfo/documentproperties/StartNumber.js";
import type { FileHeader } from "../../object/fileheader/FileHeader.js";
import { FaceNameAdder } from "./FaceNameAdder.js";
import { BorderFillAdder } from "./BorderFillAdder.js";
import { CharShapeAdder } from "./CharShapeAdder.js";
import { TabDefAdder } from "./TabDefAdder.js";
import { NumberingAdder } from "./NumberingAdder.js";
import { ParaShapeAdder } from "./ParaShapeAdder.js";
import { StyleAdder } from "./StyleAdder.js";
import { EmptyParagraphAdder } from "./EmptyParagraphAdder.js";

export class BlankFileMaker {
  public static make(): HWPFile {
    const hwpFile = new HWPFile();
    BlankFileMaker.setFileHeader(hwpFile.getFileHeader());

    const docInfo = hwpFile.getDocInfo();
    BlankFileMaker.setDocumentProperties(docInfo.getDocumentProperties());

    FaceNameAdder.add(docInfo);
    BorderFillAdder.add(docInfo);
    CharShapeAdder.add(docInfo);
    TabDefAdder.add(docInfo);
    NumberingAdder.add(docInfo);
    ParaShapeAdder.add(docInfo);
    StyleAdder.add(docInfo);
    BlankFileMaker.compatibleDocument(docInfo);
    BlankFileMaker.layoutCompatibility(docInfo);

    const section: Section = hwpFile.getBodyText().addNewSection();
    EmptyParagraphAdder.add(section);

    BlankFileMaker.setScript(hwpFile);
    return hwpFile;
  }

  private static setFileHeader(fileHeader: FileHeader): void {
    fileHeader.getVersion().setVersionParts(5, 0, 3, 4);
    fileHeader.setCompressed(true);
    fileHeader.setHasPassword(false);
    fileHeader.setDistribution(false);
    fileHeader.setSaveScript(false);
    fileHeader.setDRMDocument(false);
    fileHeader.setHasXMLTemplate(false);
    fileHeader.setHasDocumentHistory(false);
    fileHeader.setHasSignature(false);
    fileHeader.setEncryptPublicCertification(false);
    fileHeader.setSavePrepareSignature(false);
    fileHeader.setPublicCertificationDRMDocument(false);
    fileHeader.setCCLDocument(false);
  }

  private static setDocumentProperties(documentProperties: DocumentProperties): void {
    documentProperties.setSectionCount(1);

    const startNumber: StartNumber = documentProperties.getStartNumber();
    startNumber.setPage(1);
    startNumber.setFootnote(1);
    startNumber.setEndnote(1);
    startNumber.setPicture(1);
    startNumber.setTable(1);
    startNumber.setEquation(1);

    const caretPosition: CaretPosition = documentProperties.getCaretPosition();
    caretPosition.setListID(0);
    caretPosition.setParagraphID(0);
    caretPosition.setPositionInParagraph(0);
  }

  private static compatibleDocument(docInfo: DocInfo): void {
    docInfo.createCompatibleDocument();
    docInfo.getCompatibleDocument()!.setTargetProgream(CompatibleDocumentSort.HWPCurrent);
  }

  private static layoutCompatibility(docInfo: DocInfo): void {
    docInfo.createLayoutCompatibility();
    const layoutCompatibility: LayoutCompatibility = docInfo.getLayoutCompatibility()!;
    layoutCompatibility.setLetterLevelFormat(0);
    layoutCompatibility.setParagraphLevelFormat(0);
    layoutCompatibility.setSectionLevelFormat(0);
    layoutCompatibility.setObjectLevelFormat(0);
    layoutCompatibility.setFieldLevelFormat(0);
  }

  private static setScript(hwpFile: HWPFile): void {
    const compressed_jsVersion = new Uint8Array([
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    hwpFile.getScripts().setJScriptVersion(compressed_jsVersion);

    const compressed_defaultJScript = new Uint8Array([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0xff, 0xff, 0xff, 0xff,
    ]);
    hwpFile.getScripts().setDefaultJScript(compressed_defaultJScript);
  }
}
