import { HWPFile } from "../object/HWPFile.js";
import { BinDataCompress } from "../object/docinfo/bindata/BinDataCompress.js";
import { HWPTag } from "../object/etc/HWPTag.js";
import type { FileVersion } from "../object/fileheader/FileVersion.js";
import { CompoundFileReader } from "../util/compoundFile/reader/CompoundFileReader.js";
import type { StreamReader } from "../util/compoundFile/reader/StreamReader.js";
import { ForSection } from "./bodytext/ForSection.js";
import { ForMemo } from "./bodytext/memo/ForMemo.js";
import { ForDocInfo } from "./docinfo/ForDocInfo.js";
import { ForFileHeader } from "./ForFileHeader.js";

/**
 * 한글 파일을 읽기 위한 객체
 *
 * @author neolord
 */
export class HWPReader {
  /**
   * HWP파일을 나타내는 객체
   */
  private hwpFile!: HWPFile;
  /**
   * MS Compound 파일을 읽기 위한 리더 객체
   */
  private cfr!: CompoundFileReader;

  /**
   * 생성자
   */
  private constructor() {}

  /**
   * hwp 파일을 읽는다.
   *
   * @param data hwp파일의 바이트 배열
   * @return HWPFile 객체
   */
  public static fromBytes(data: Uint8Array): HWPFile {
    const r = new HWPReader();
    r.hwpFile = new HWPFile();
    r.cfr = new CompoundFileReader(data);

    r.fileHeader();
    if (r.hasPassword()) {
      throw new Error("Files with passwords are not supported.");
    }

    r.docInfo();
    r.bodyText();
    r.binData();
    r.summaryInformation();
    r.scripts();

    return r.hwpFile;
  }

  /**
   * FileHeader 스트림을 읽는다.
   */
  private fileHeader(): void {
    const sr = this.cfr.getChildStreamReader("FileHeader", false, null);
    ForFileHeader.read(this.hwpFile.getFileHeader(), sr);
  }

  /**
   * 암호화된 파일인지 여부를 반환한다.
   *
   * @return 암호화된 파일인지 여부
   */
  private hasPassword(): boolean {
    return this.hwpFile.getFileHeader().hasPassword();
  }

  /**
   * 배포용 문서 파일인지 여부를 반환한다.
   *
   * @return 암호화된 파일인지 여부
   */
  private isDistribution(): boolean {
    return this.hwpFile.getFileHeader().isDistribution();
  }

  /**
   * DocInfo 스트림을 읽는다.
   */
  private docInfo(): void {
    const sr = this.cfr.getChildStreamReader("DocInfo", this.isCompressed(), this.getVersion());
    new ForDocInfo().read(this.hwpFile.getDocInfo(), sr);
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
   * 파일의 버전을 반환한다.
   *
   * @return 파일의 버전
   */
  private getVersion(): FileVersion {
    return this.hwpFile.getFileHeader().getVersion();
  }

  /**
   * BodyText 스토리지를 읽는다.
   */
  private bodyText(): void {
    if (!this.isDistribution()) {
      this.cfr.moveChildStorage("BodyText");
    } else {
      this.cfr.moveChildStorage("ViewText");
    }

    const sectionCount = this.hwpFile.getDocInfo().getDocumentProperties().getSectionCount();
    for (let index = 0; index < sectionCount; index++) {
      this.section(index);
    }

    this.cfr.moveParentStorage();
  }

  /**
   * Section 스트림을 읽는다.
   *
   * @param index 섹션 인덱스
   */
  private section(index: number): void {
    const sr = this.streamReader("Section" + index);
    sr.setDocInfo(this.hwpFile.getDocInfo());
    ForSection.read(this.hwpFile.getBodyText().addNewSection(), sr);
    if (this.isLastSection(index)) {
      this.memo(sr);
    }
  }

  private streamReader(name: string): StreamReader {
    if (!this.isDistribution()) {
      return this.cfr.getChildStreamReader(name, this.isCompressed(), this.getVersion());
    } else {
      return this.cfr.getChildStreamReaderForDistribution(name, this.isCompressed(), this.getVersion());
    }
  }

  private isLastSection(index: number): boolean {
    return index + 1 === this.hwpFile.getDocInfo().getDocumentProperties().getSectionCount();
  }

  private memo(sr: StreamReader): void {
    while (!sr.isEndOfStream()) {
      if (sr.isImmediatelyAfterReadingHeader() === false) {
        sr.readRecordHeader();
      }

      if (sr.getCurrentRecordHeader().getTagID() === HWPTag.MEMO_LIST) {
        ForMemo.read(this.hwpFile.getBodyText().addNewMemo(), sr);
      }
    }
  }

  /**
   * BinData 스토리지를 읽는다.
   */
  private binData(): void {
    if (this.cfr.isChildStorage("BinData")) {
      this.cfr.moveChildStorage("BinData");

      const ss = this.cfr.listChildNames();
      for (const name of ss) {
        const id = this.nameToID(name);
        const compressMethod = this.getCompressMethod(id);
        this.hwpFile
          .getBinData()
          .addNewEmbeddedBinaryData(name, this.readEmbeddedBinaryData(name, compressMethod), compressMethod);
      }

      this.cfr.moveParentStorage();
    }
  }

  private nameToID(name: string): number {
    const id = name.substring(3, 7);
    return parseInt(id, 16);
  }

  private getCompressMethod(id: number): BinDataCompress {
    const binData = this.hwpFile.getDocInfo().getBinDataList()[id - 1];
    if (binData != null) {
      return binData.getProperty().getCompress();
    }
    return BinDataCompress.ByStorageDefault;
  }

  /**
   * BinData 스토리지 아래에 스트림을 읽는다.
   *
   * @param name           스트림 이름
   * @param compressMethod 압축 방법
   * @return 스트림에 저장된 데이타
   */
  private readEmbeddedBinaryData(name: string, compressMethod: BinDataCompress): Uint8Array {
    const sr = this.cfr.getChildStreamReader(name, this.isCompressBinData(compressMethod), null);
    const binaryData = sr.readBytes(sr.getSize());
    return binaryData;
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
    let data: Uint8Array | null;
    try {
      data = this.cfr.getChildStreamData("HwpSummaryInformation");
    } catch {
      data = null;
    }

    if (data !== null) {
      this.hwpFile.setSummaryInformation(data);
    }
  }

  private scripts(): void {
    if (this.cfr.isChildStorage("Scripts")) {
      this.cfr.moveChildStorage("Scripts");

      {
        const sr = this.streamReader("DefaultJScript");
        const data = sr.readBytes(sr.getSize());
        this.hwpFile.getScripts().setDefaultJScript(data);
      }

      {
        const sr = this.streamReader("JScriptVersion");
        const data = sr.readBytes(sr.getSize());
        this.hwpFile.getScripts().setJScriptVersion(data);
      }

      this.cfr.moveParentStorage();
    }
  }
}
