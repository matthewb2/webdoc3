import { HWPWriter as HwplibWriter } from '@hwplib-js';
import type { DocumentModel } from '../types';
import { Doc3Adapter } from './doc3xAdapter';

export class HwpWriter {
  private docModel: DocumentModel;

  constructor(docModel: DocumentModel) {
    this.docModel = docModel;
  }

  public write(): Uint8Array {
    const adapter = new Doc3Adapter(this.docModel);
    const hwpFile = adapter.convert();
    return HwplibWriter.toBytes(hwpFile);
  }
}
