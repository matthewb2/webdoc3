/**
 * ID mapping header record. Stores the counts of the other objects in the "DocInfo" stream.
 * Ported from hwplib's `object.docinfo.IDMappings`.
 */
export class IDMappings {
  private binDataCount = 0;
  private hangulFaceNameCount = 0;
  private englishFaceNameCount = 0;
  private hanjaFaceNameCount = 0;
  private japaneseFaceNameCount = 0;
  private etcFaceNameCount = 0;
  private symbolFaceNameCount = 0;
  private userFaceNameCount = 0;
  private borderFillCount = 0;
  private charShapeCount = 0;
  private tabDefCount = 0;
  private numberingCount = 0;
  private bulletCount = 0;
  private paraShapeCount = 0;
  private styleCount = 0;
  /** memo shape count (5.0.2.1 and above) */
  private memoShapeCount = 0;
  /** track change count (5.0.3.2 and above) */
  private trackChangeCount = 0;
  /** track change author count (5.0.3.2 and above) */
  private trackChangeAuthorCount = 0;

  constructor() {}

  getBinDataCount(): number {
    return this.binDataCount;
  }

  setBinDataCount(binDataCount: number): void {
    this.binDataCount = binDataCount;
  }

  getHangulFaceNameCount(): number {
    return this.hangulFaceNameCount;
  }

  setHangulFaceNameCount(hangulFaceNameCount: number): void {
    this.hangulFaceNameCount = hangulFaceNameCount;
  }

  getEnglishFaceNameCount(): number {
    return this.englishFaceNameCount;
  }

  setEnglishFaceNameCount(englishFaceNameCount: number): void {
    this.englishFaceNameCount = englishFaceNameCount;
  }

  getHanjaFaceNameCount(): number {
    return this.hanjaFaceNameCount;
  }

  setHanjaFaceNameCount(hanjaFaceNameCount: number): void {
    this.hanjaFaceNameCount = hanjaFaceNameCount;
  }

  getJapaneseFaceNameCount(): number {
    return this.japaneseFaceNameCount;
  }

  setJapaneseFaceNameCount(japaneseFaceNameCount: number): void {
    this.japaneseFaceNameCount = japaneseFaceNameCount;
  }

  getEtcFaceNameCount(): number {
    return this.etcFaceNameCount;
  }

  setEtcFaceNameCount(etcFaceNameCount: number): void {
    this.etcFaceNameCount = etcFaceNameCount;
  }

  getSymbolFaceNameCount(): number {
    return this.symbolFaceNameCount;
  }

  setSymbolFaceNameCount(symbolFaceNameCount: number): void {
    this.symbolFaceNameCount = symbolFaceNameCount;
  }

  getUserFaceNameCount(): number {
    return this.userFaceNameCount;
  }

  setUserFaceNameCount(userFaceNameCount: number): void {
    this.userFaceNameCount = userFaceNameCount;
  }

  getBorderFillCount(): number {
    return this.borderFillCount;
  }

  setBorderFillCount(borderFillCount: number): void {
    this.borderFillCount = borderFillCount;
  }

  getCharShapeCount(): number {
    return this.charShapeCount;
  }

  setCharShapeCount(charShapeCount: number): void {
    this.charShapeCount = charShapeCount;
  }

  getTabDefCount(): number {
    return this.tabDefCount;
  }

  setTabDefCount(tabDefCount: number): void {
    this.tabDefCount = tabDefCount;
  }

  getNumberingCount(): number {
    return this.numberingCount;
  }

  setNumberingCount(numberingCount: number): void {
    this.numberingCount = numberingCount;
  }

  getBulletCount(): number {
    return this.bulletCount;
  }

  setBulletCount(bulletCount: number): void {
    this.bulletCount = bulletCount;
  }

  getParaShapeCount(): number {
    return this.paraShapeCount;
  }

  setParaShapeCount(paraShapeCount: number): void {
    this.paraShapeCount = paraShapeCount;
  }

  getStyleCount(): number {
    return this.styleCount;
  }

  setStyleCount(styleCount: number): void {
    this.styleCount = styleCount;
  }

  getMemoShapeCount(): number {
    return this.memoShapeCount;
  }

  setMemoShapeCount(memoShapeCount: number): void {
    this.memoShapeCount = memoShapeCount;
  }

  getTrackChangeCount(): number {
    return this.trackChangeCount;
  }

  setTrackChangeCount(trackChangeCount: number): void {
    this.trackChangeCount = trackChangeCount;
  }

  getTrackChangeAuthorCount(): number {
    return this.trackChangeAuthorCount;
  }

  setTrackChangeAuthorCount(trackChangeAuthorCount: number): void {
    this.trackChangeAuthorCount = trackChangeAuthorCount;
  }

  copy(from: IDMappings): void {
    this.binDataCount = from.binDataCount;
    this.hangulFaceNameCount = from.hangulFaceNameCount;
    this.englishFaceNameCount = from.englishFaceNameCount;
    this.hanjaFaceNameCount = from.hanjaFaceNameCount;
    this.japaneseFaceNameCount = from.japaneseFaceNameCount;
    this.etcFaceNameCount = from.etcFaceNameCount;
    this.symbolFaceNameCount = from.symbolFaceNameCount;
    this.userFaceNameCount = from.userFaceNameCount;
    this.borderFillCount = from.borderFillCount;
    this.charShapeCount = from.charShapeCount;
    this.tabDefCount = from.tabDefCount;
    this.numberingCount = from.numberingCount;
    this.bulletCount = from.bulletCount;
    this.paraShapeCount = from.paraShapeCount;
    this.styleCount = from.styleCount;
    this.memoShapeCount = from.memoShapeCount;
    this.trackChangeCount = from.trackChangeCount;
    this.trackChangeAuthorCount = from.trackChangeAuthorCount;
  }
}
