import { BinData } from "./bindata/BinData.js";
import { BodyText } from "./bodytext/BodyText.js";
import { DocInfo } from "./docinfo/DocInfo.js";
import { FileHeader } from "./fileheader/FileHeader.js";
import { Scripts } from "./Scripts.js";

/**
 * Object representing an HWP file, ported from hwplib's `object.HWPFile`.
 *
 * Note: hwplib stores the summary information as an Apache POI HPSF `SummaryInformation`
 * object. The POI/HPSF layer is not ported (it is replaced by `cfb` — see MIGRATION_PLAN.md),
 * so the summary information is represented here as the raw bytes of the
 * "HwpSummaryInformation" stream (`Uint8Array | null`), and `copySummaryInformation`
 * deep-copies those bytes instead of round-tripping through a POI `PropertySet`.
 */
export class HWPFile {
  /**
   * Object representing file recognition information. Stored in the "FileHeader" stream.
   */
  private fileHeader: FileHeader;
  /**
   * Object representing document information. Stored in the "DocInfo" stream.
   */
  private docInfo: DocInfo;
  /**
   * Object representing the body text. Stored in the "BodyText" storage.
   */
  private bodyText: BodyText;
  /**
   * Object representing binary data. Stored in the "BinData" storage.
   */
  private binData: BinData;
  private summaryInformation: Uint8Array | null = null;
  private scripts: Scripts;

  constructor() {
    this.fileHeader = new FileHeader();
    this.docInfo = new DocInfo();
    this.bodyText = new BodyText();
    this.binData = new BinData();
    this.scripts = new Scripts();
  }

  getFileHeader(): FileHeader {
    return this.fileHeader;
  }

  getDocInfo(): DocInfo {
    return this.docInfo;
  }

  getBodyText(): BodyText {
    return this.bodyText;
  }

  getBinData(): BinData {
    return this.binData;
  }

  getSummaryInformation(): Uint8Array | null {
    return this.summaryInformation;
  }

  setSummaryInformation(summaryInformation: Uint8Array | null): void {
    this.summaryInformation = summaryInformation;
  }

  getScripts(): Scripts {
    return this.scripts;
  }

  clone(deepCopyImage: boolean): HWPFile {
    const cloned = new HWPFile();
    cloned.copy(this, deepCopyImage);
    return cloned;
  }

  copy(from: HWPFile, deepCopyImage: boolean): void {
    this.fileHeader.copy(from.fileHeader);
    this.docInfo.copy(from.docInfo);
    this.bodyText.copy(from.bodyText);
    this.binData.copy(from.binData, deepCopyImage);
    if (from.summaryInformation !== null) {
      this.copySummaryInformation(from.summaryInformation);
    }
    this.scripts.copy(from.scripts);
  }

  private copySummaryInformation(from: Uint8Array): void {
    this.summaryInformation = from.slice();
  }
}
