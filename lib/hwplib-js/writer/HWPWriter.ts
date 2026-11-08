import type { HWPFile } from "../object/HWPFile.js";
import type { EmbeddedBinaryData } from "../object/bindata/EmbeddedBinaryData.js";
import type { Section } from "../object/bodytext/Section.js";
import { BinDataCompress } from "../object/docinfo/bindata/BinDataCompress.js";
import type { FileVersion } from "../object/fileheader/FileVersion.js";
import { CompoundFileWriter } from "../util/compoundFile/writer/CompoundFileWriter.js";
import { AutoSetter } from "./autosetter/AutoSetter.js";
import { InstanceID } from "./autosetter/InstanceID.js";
import { ForFileHeader } from "./ForFileHeader.js";
import { ForSection } from "./bodytext/ForSection.js";
import { ForMemo } from "./bodytext/paragraph/memo/ForMemo.js";
import { ForDocInfo } from "./docinfo/ForDocInfo.js";

/**
 * 한글 파일을 쓰기 위한 객체
 *
 * @author neolord
 */
export class HWPWriter {
  /**
   * 한글 파일 객체를 바이트 배열로 쓴다.
   *
   * @param hwpFile 한글 파일 객체
   * @return 쓰여진 바이트 배열
   */
  public static toBytes(hwpFile: HWPFile): Uint8Array {
    if (hwpFile.getFileHeader().hasPassword()) {
      throw new Error("Files with passwords are not supported.");
    }

    const w = new HWPWriter(hwpFile);
    w.autoSet();
    w.fileHeader();
    w.docInfo();
    w.bodyText();
    w.binData();
    w.summaryInformation();
    w.scripts();
    w.docOptions();
    return w.cfw.write();
  }

  /**
   * 한글 파일
   */
  private hwpFile: HWPFile;
  /**
   * MS Compound 파일을 쓰기 위한 라이터 객체
   */
  private cfw: CompoundFileWriter;

  /**
   * 생성자
   *
   * @param hwpFile 한글 파일
   */
  private constructor(hwpFile: HWPFile) {
    this.hwpFile = hwpFile;
    this.cfw = new CompoundFileWriter();
  }

  /**
   * 파일을 쓰기 전에 자동으로 설정할 수 있는 값들을 설정한다.
   */
  private autoSet(): void {
    const iid = new InstanceID();
    AutoSetter.autoSet(this.hwpFile, iid);
  }

  /**
   * FileHeader 스트림을 쓴다.
   */
  private fileHeader(): void {
    const sw = this.cfw.openCurrentStream("FileHeader", false, this.getVersion());
    ForFileHeader.write(this.hwpFile.getFileHeader(), sw);
    this.cfw.closeCurrentStream();
  }

  /**
   * 파일 버전을 반환한다.
   *
   * @return 파일 버전
   */
  private getVersion(): FileVersion {
    return this.hwpFile.getFileHeader().getVersion();
  }

  /**
   * DocInfo 스트림을 쓴다.
   */
  private docInfo(): void {
    const sw = this.cfw.openCurrentStream("DocInfo", this.isCompressed(), this.getVersion());
    sw.setDocInfo(this.hwpFile.getDocInfo());
    new ForDocInfo().write(this.hwpFile.getDocInfo(), sw);
    this.cfw.closeCurrentStream();
  }

  /**
   * 압축된 파일인지 여부를 반환한다.
   *
   * @return 압축된 파일인지 여부
   */
  private isCompressed(): boolean {
    return this.hwpFile.getFileHeader().isCompressed();
  }

  /**
   * BodyText 스토리지를 쓴다.
   */
  private bodyText(): void {
    this.cfw.openCurrentStorage("BodyText");

    let index = 0;
    for (const s of this.hwpFile.getBodyText().getSectionList()) {
      this.section(index, s);
      index++;
    }

    this.cfw.closeCurrentStorage();
  }

  /**
   * Section 스트림을 쓴다.
   *
   * @param index 섹션 인덱스
   * @param s     구역 객체
   */
  private section(index: number, s: Section): void {
    const sw = this.cfw.openCurrentStream("Section" + index, this.isCompressed(), this.getVersion());
    sw.setDocInfo(this.hwpFile.getDocInfo());

    ForSection.write(s, sw);
    if (this.isLastSection(index) && this.hwpFile.getBodyText().getMemoList() !== null) {
      for (const memo of this.hwpFile.getBodyText().getMemoList()!) {
        ForMemo.write(memo, sw);
      }
    }

    this.cfw.closeCurrentStream();
  }

  private isLastSection(index: number): boolean {
    return index + 1 === this.hwpFile.getBodyText().getSectionList().length;
  }

  /**
   * BinData 스토리지를 쓴다.
   */
  private binData(): void {
    if (this.hasBinData()) {
      this.cfw.openCurrentStorage("BinData");

      for (const ebd of this.hwpFile.getBinData().getEmbeddedBinaryDataList()) {
        this.embeddedBinaryData(ebd);
      }

      this.cfw.closeCurrentStorage();
    }
  }

  /**
   * 첨부된 바이너리 데이터가 있는지 여부를 반환한다.
   *
   * @return 첨부된 바이너리 데이터가 있는지 여부
   */
  private hasBinData(): boolean {
    return this.hwpFile.getBinData().getEmbeddedBinaryDataList().length > 0;
  }

  /**
   * 첨부된 바이너리 데이터를 쓴다.
   *
   * @param ebd 첨부된 바이너리 데이터에 대한 정보
   */
  private embeddedBinaryData(ebd: EmbeddedBinaryData): void {
    const sw = this.cfw.openCurrentStream(
      ebd.getName()!,
      this.isCompressBinData(ebd.getCompressMethod()!),
      this.getVersion(),
    );
    sw.writeBytes(ebd.getData()!);
    this.cfw.closeCurrentStream();
  }

  /**
   * BinData의 압축 여부를 반환한다.
   *
   * @param compressMethod 압축 방법
   * @return BinData의 압축 여부
   */
  private isCompressBinData(compressMethod: BinDataCompress): boolean {
    switch (compressMethod) {
      case BinDataCompress.ByStorageDefault:
        return this.isCompressed();
      case BinDataCompress.Compress:
        return true;
      case BinDataCompress.NoCompress:
        return false;
    }
    return false;
  }

  private summaryInformation(): void {
    const si = this.hwpFile.getSummaryInformation();
    if (si !== null) {
      if (si.length > 0) {
        this.cfw.saveToStream("HwpSummaryInformation", si);
      }
    }
  }

  private scripts(): void {
    this.cfw.openCurrentStorage("Scripts");

    if (this.hwpFile.getScripts().getDefaultJScript() !== null) {
      const sw = this.cfw.openCurrentStream("DefaultJScript", this.isCompressed(), this.getVersion());
      sw.writeBytes(this.hwpFile.getScripts().getDefaultJScript()!);
      this.cfw.closeCurrentStream();
    }

    if (this.hwpFile.getScripts().getJScriptVersion() !== null) {
      const sw = this.cfw.openCurrentStream("JScriptVersion", this.isCompressed(), this.getVersion());
      sw.writeBytes(this.hwpFile.getScripts().getJScriptVersion()!);
      this.cfw.closeCurrentStream();
    }

    this.cfw.closeCurrentStorage();
  }

  private docOptions(): void {
    this.cfw.openCurrentStorage("DocOptions");
    this.cfw.closeCurrentStorage();
  }
}
