import { FileVersion } from "./FileVersion.js";

/**
 * File recognition information, ported from hwplib's `object.fileheader.FileHeader`.
 * Stored in the HWP file's "FileHeader" stream.
 *
 * Note: several boolean flag fields share a name with their Java accessor method
 * (e.g. field `isDistribution` + method `isDistribution()`). Java keeps field and method
 * in separate namespaces, but TypeScript does not, so the backing fields for those flags
 * are prefixed with `_`. The accessor method names are unchanged.
 */
export class FileHeader {
  /** file version */
  private version: FileVersion;
  /** whether compressed */
  private compressed = false;
  /** whether a password is set */
  private _hasPassword = false;
  /** whether it is a distribution document */
  private _isDistribution = false;
  /** whether scripts are saved */
  private saveScript = false;
  /** whether it is a DRM-secured document */
  private _isDRMDocument = false;
  /** whether the XMLTemplate storage exists */
  private _hasXMLTemplate = false;
  /** whether document history management exists */
  private _hasDocumentHistory = false;
  /** whether digital signature information exists */
  private _hasSignature = false;
  /** whether public certificate encryption is used */
  private encryptPublicCertification = false;
  /** whether the digital signature is spare-saved */
  private savePrepareSignature = false;
  /** whether it is a public certificate DRM-secured document */
  private _isPublicCertificationDRMDocument = false;
  /** whether it is a CCL document */
  private _isCCLDocument = false;

  constructor() {
    this.version = new FileVersion();
  }

  /**
   * Returns the HWP file's signature, used to check whether a file is an HWP file.
   */
  static getFileSignature(): Uint8Array {
    return new Uint8Array([
      0x48, 0x57, 0x50, 0x20, 0x44, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x20, 0x46, 0x69,
      0x6c, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00,
    ]);
  }

  getVersion(): FileVersion {
    return this.version;
  }

  isCompressed(): boolean {
    return this.compressed;
  }

  setCompressed(compressed: boolean): void {
    this.compressed = compressed;
  }

  hasPassword(): boolean {
    return this._hasPassword;
  }

  setHasPassword(hasPassword: boolean): void {
    this._hasPassword = hasPassword;
  }

  isDistribution(): boolean {
    return this._isDistribution;
  }

  setDistribution(isDistribution: boolean): void {
    this._isDistribution = isDistribution;
  }

  isSaveScript(): boolean {
    return this.saveScript;
  }

  setSaveScript(saveScript: boolean): void {
    this.saveScript = saveScript;
  }

  isDRMDocument(): boolean {
    return this._isDRMDocument;
  }

  setDRMDocument(isDRMDocument: boolean): void {
    this._isDRMDocument = isDRMDocument;
  }

  hasXMLTemplate(): boolean {
    return this._hasXMLTemplate;
  }

  setHasXMLTemplate(hasXMLTemplate: boolean): void {
    this._hasXMLTemplate = hasXMLTemplate;
  }

  hasDocumentHistory(): boolean {
    return this._hasDocumentHistory;
  }

  setHasDocumentHistory(hasDocumentHistory: boolean): void {
    this._hasDocumentHistory = hasDocumentHistory;
  }

  hasSignature(): boolean {
    return this._hasSignature;
  }

  setHasSignature(hasSignature: boolean): void {
    this._hasSignature = hasSignature;
  }

  isEncryptPublicCertification(): boolean {
    return this.encryptPublicCertification;
  }

  setEncryptPublicCertification(encryptPublicCertification: boolean): void {
    this.encryptPublicCertification = encryptPublicCertification;
  }

  isSavePrepareSignature(): boolean {
    return this.savePrepareSignature;
  }

  setSavePrepareSignature(savePrepareSignature: boolean): void {
    this.savePrepareSignature = savePrepareSignature;
  }

  isPublicCertificationDRMDocument(): boolean {
    return this._isPublicCertificationDRMDocument;
  }

  setPublicCertificationDRMDocument(isPublicCertificationDRMDocument: boolean): void {
    this._isPublicCertificationDRMDocument = isPublicCertificationDRMDocument;
  }

  isCCLDocument(): boolean {
    return this._isCCLDocument;
  }

  setCCLDocument(isCCLDocument: boolean): void {
    this._isCCLDocument = isCCLDocument;
  }

  copy(from: FileHeader): void {
    this.version.copy(from.version);
    this.compressed = from.compressed;
    this._hasPassword = from._hasPassword;
    this._isDistribution = from._isDistribution;
    this.saveScript = from.saveScript;
    this._isDRMDocument = from._isDRMDocument;
    this._hasXMLTemplate = from._hasXMLTemplate;
    this._hasDocumentHistory = from._hasDocumentHistory;
    this._hasSignature = from._hasSignature;
    this.encryptPublicCertification = from.encryptPublicCertification;
    this.savePrepareSignature = from.savePrepareSignature;
    this._isPublicCertificationDRMDocument = from._isPublicCertificationDRMDocument;
    this._isCCLDocument = from._isCCLDocument;
  }
}
