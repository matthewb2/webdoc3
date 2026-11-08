declare module '@hwplib-js' {
  export class HWPFile {
    getFileHeader(): any;
    getDocInfo(): any;
    getBodyText(): any;
    getBinData(): any;
    getSummaryInformation(): Uint8Array | null;
    setSummaryInformation(summaryInformation: Uint8Array | null): void;
    getScripts(): any;
  }

  export class HWPWriter {
    static toBytes(hwpFile: HWPFile): Uint8Array;
  }

  export class BlankFileMaker {
    static make(): HWPFile;
  }
}
