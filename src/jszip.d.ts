declare module 'jszip' {
  export interface ZipObject {
    asText(): string;
    asUint8Array(): Uint8Array;
  }
  export default class JSZip {
    constructor(data?: unknown);
    file(name: string): ZipObject | null;
  }
}
