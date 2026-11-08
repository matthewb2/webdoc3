import type { RecordHeader } from "../RecordHeader.js";
import { UnknownRecord } from "../etc/UnknownRecord.js";
import { DocumentProperties } from "./DocumentProperties.js";
import { IDMappings } from "./IDMappings.js";
import { BinData } from "./BinData.js";
import { FaceName } from "./FaceName.js";
import { BorderFill } from "./BorderFill.js";
import { CharShape } from "./CharShape.js";
import { TabDef } from "./TabDef.js";
import { Numbering } from "./Numbering.js";
import { Bullet } from "./Bullet.js";
import { ParaShape } from "./ParaShape.js";
import { Style } from "./Style.js";
import { CompatibleDocument } from "./CompatibleDocument.js";
import { LayoutCompatibility } from "./LayoutCompatibility.js";
import { MemoShape } from "./MemoShape.js";

/**
 * Object representing document information. Stored in the "DocInfo" stream of an HWP file.
 * Ported from hwplib's `object.docinfo.DocInfo`.
 */
export class DocInfo {
  /** document properties */
  private documentProperties: DocumentProperties;
  /** id mapping header */
  private idMappings: IDMappings;
  /** binary data list */
  private binDataList: BinData[];
  /** Hangul font list */
  private hangulFaceNameList: FaceName[];
  /** English font list */
  private englishFaceNameList: FaceName[];
  /** Hanja font list */
  private hanjaFaceNameList: FaceName[];
  /** Japanese font list */
  private japaneseFaceNameList: FaceName[];
  /** etc font list */
  private etcFaceNameList: FaceName[];
  /** symbol font list */
  private symbolFaceNameList: FaceName[];
  /** user font list */
  private userFaceNameList: FaceName[];
  /** border/background list */
  private borderFillList: BorderFill[];
  /** character shape list */
  private charShapeList: CharShape[];
  /** tab definition list */
  private tabDefList: TabDef[];
  /** paragraph numbering list */
  private numberingList: Numbering[];
  /** bullet list */
  private bulletList: Bullet[];
  /** paragraph shape list */
  private paraShapeList: ParaShape[];
  /** style list */
  private styleList: Style[];
  /** arbitrary document data */
  private docData: UnknownRecord | null;
  /** distribute document data */
  private distributeDocData: UnknownRecord | null;
  /** compatible document */
  private compatibleDocument: CompatibleDocument | null;
  /** layout compatibility */
  private layoutCompatibility: LayoutCompatibility | null;
  /** track change information */
  private trackChange: UnknownRecord | null;
  /** memo shape list */
  private memoShapeList: MemoShape[];
  /** forbidden characters */
  private forbiddenChar: UnknownRecord | null;
  /** track change contents and shapes */
  private trackChange2List: UnknownRecord[];
  /** track change authors */
  private trackChangeAuthorList: UnknownRecord[];

  constructor() {
    this.documentProperties = new DocumentProperties();
    this.idMappings = new IDMappings();
    this.binDataList = [];
    this.hangulFaceNameList = [];
    this.englishFaceNameList = [];
    this.hanjaFaceNameList = [];
    this.japaneseFaceNameList = [];
    this.etcFaceNameList = [];
    this.symbolFaceNameList = [];
    this.userFaceNameList = [];
    this.borderFillList = [];
    this.charShapeList = [];
    this.tabDefList = [];
    this.numberingList = [];
    this.bulletList = [];
    this.paraShapeList = [];
    this.styleList = [];
    this.docData = null;
    this.distributeDocData = null;
    this.compatibleDocument = null;
    this.layoutCompatibility = null;
    this.trackChange = null;
    this.memoShapeList = [];
    this.forbiddenChar = null;
    this.trackChange2List = [];
    this.trackChangeAuthorList = [];
  }

  getDocumentProperties(): DocumentProperties {
    return this.documentProperties;
  }

  getIDMappings(): IDMappings {
    return this.idMappings;
  }

  addNewBinData(): BinData {
    const bd = new BinData();
    this.binDataList.push(bd);
    return bd;
  }

  getBinDataList(): BinData[] {
    return this.binDataList;
  }

  addNewHangulFaceName(): FaceName {
    const fn = new FaceName();
    this.hangulFaceNameList.push(fn);
    return fn;
  }

  getHangulFaceNameList(): FaceName[] {
    return this.hangulFaceNameList;
  }

  addNewEnglishFaceName(): FaceName {
    const fn = new FaceName();
    this.englishFaceNameList.push(fn);
    return fn;
  }

  getEnglishFaceNameList(): FaceName[] {
    return this.englishFaceNameList;
  }

  addNewHanjaFaceName(): FaceName {
    const fn = new FaceName();
    this.hanjaFaceNameList.push(fn);
    return fn;
  }

  getHanjaFaceNameList(): FaceName[] {
    return this.hanjaFaceNameList;
  }

  addNewJapaneseFaceName(): FaceName {
    const fn = new FaceName();
    this.japaneseFaceNameList.push(fn);
    return fn;
  }

  getJapaneseFaceNameList(): FaceName[] {
    return this.japaneseFaceNameList;
  }

  addNewEtcFaceName(): FaceName {
    const fn = new FaceName();
    this.etcFaceNameList.push(fn);
    return fn;
  }

  getEtcFaceNameList(): FaceName[] {
    return this.etcFaceNameList;
  }

  addNewSymbolFaceName(): FaceName {
    const fn = new FaceName();
    this.symbolFaceNameList.push(fn);
    return fn;
  }

  getSymbolFaceNameList(): FaceName[] {
    return this.symbolFaceNameList;
  }

  addNewUserFaceName(): FaceName {
    const fn = new FaceName();
    this.userFaceNameList.push(fn);
    return fn;
  }

  getUserFaceNameList(): FaceName[] {
    return this.userFaceNameList;
  }

  addNewBorderFill(): BorderFill {
    const bf = new BorderFill();
    this.borderFillList.push(bf);
    return bf;
  }

  getBorderFillList(): BorderFill[] {
    return this.borderFillList;
  }

  addNewCharShape(): CharShape {
    const cs = new CharShape();
    this.charShapeList.push(cs);
    return cs;
  }

  getCharShapeList(): CharShape[] {
    return this.charShapeList;
  }

  addNewTabDef(): TabDef {
    const td = new TabDef();
    this.tabDefList.push(td);
    return td;
  }

  getTabDefList(): TabDef[] {
    return this.tabDefList;
  }

  addNewNumbering(): Numbering {
    const n = new Numbering();
    this.numberingList.push(n);
    return n;
  }

  getNumberingList(): Numbering[] {
    return this.numberingList;
  }

  addNewBullet(): Bullet {
    const b = new Bullet();
    this.bulletList.push(b);
    return b;
  }

  getBulletList(): Bullet[] {
    return this.bulletList;
  }

  addNewParaShape(): ParaShape {
    const ps = new ParaShape();
    this.paraShapeList.push(ps);
    return ps;
  }

  getParaShapeList(): ParaShape[] {
    return this.paraShapeList;
  }

  addNewStyle(): Style {
    const s = new Style();
    this.styleList.push(s);
    return s;
  }

  getStyleList(): Style[] {
    return this.styleList;
  }

  createDocData(rh: RecordHeader): void {
    this.docData = new UnknownRecord(rh);
  }

  deleteDocData(): void {
    this.docData = null;
  }

  getDocData(): UnknownRecord | null {
    return this.docData;
  }

  createDistributeDocData(rh: RecordHeader): void {
    this.distributeDocData = new UnknownRecord(rh);
  }

  deleteDistributeDocData(): void {
    this.distributeDocData = null;
  }

  getDistributeDocData(): UnknownRecord | null {
    return this.distributeDocData;
  }

  createCompatibleDocument(): void {
    this.compatibleDocument = new CompatibleDocument();
  }

  deleteCompatibleDocument(): void {
    this.compatibleDocument = null;
  }

  getCompatibleDocument(): CompatibleDocument | null {
    return this.compatibleDocument;
  }

  createLayoutCompatibility(): void {
    this.layoutCompatibility = new LayoutCompatibility();
  }

  deleteLayoutCompatibility(): void {
    this.layoutCompatibility = null;
  }

  getLayoutCompatibility(): LayoutCompatibility | null {
    return this.layoutCompatibility;
  }

  createTrackChange(rh: RecordHeader): void {
    this.trackChange = new UnknownRecord(rh);
  }

  deleteTrackChange(): void {
    this.trackChange = null;
  }

  getTrackChange(): UnknownRecord | null {
    return this.trackChange;
  }

  addNewMemoShape(): MemoShape {
    const memoShape = new MemoShape();
    this.memoShapeList.push(memoShape);
    return memoShape;
  }

  getMemoShapeList(): MemoShape[] {
    return this.memoShapeList;
  }

  createForbiddenChar(rh: RecordHeader): void {
    this.forbiddenChar = new UnknownRecord(rh);
  }

  deleteForbiddenChar(): void {
    this.forbiddenChar = null;
  }

  getForbiddenChar(): UnknownRecord | null {
    return this.forbiddenChar;
  }

  addNewTrackChange2(rh: RecordHeader): UnknownRecord {
    const ur = new UnknownRecord(rh);
    this.trackChange2List.push(ur);
    return ur;
  }

  getTrackChange2List(): UnknownRecord[] {
    return this.trackChange2List;
  }

  addNewTrackChangeAuthor(rh: RecordHeader): UnknownRecord {
    const ur = new UnknownRecord(rh);
    this.trackChangeAuthorList.push(ur);
    return ur;
  }

  getTrackChangeAuthorList(): UnknownRecord[] {
    return this.trackChangeAuthorList;
  }

  copy(from: DocInfo): void {
    this.documentProperties.copy(from.documentProperties);
    this.idMappings.copy(from.idMappings);

    this.binDataList.length = 0;
    for (const binData of from.binDataList) {
      this.binDataList.push(binData.clone());
    }

    this.copyFaceNameList(from.hangulFaceNameList, this.hangulFaceNameList);
    this.copyFaceNameList(from.englishFaceNameList, this.englishFaceNameList);
    this.copyFaceNameList(from.hanjaFaceNameList, this.hanjaFaceNameList);
    this.copyFaceNameList(from.japaneseFaceNameList, this.japaneseFaceNameList);
    this.copyFaceNameList(from.etcFaceNameList, this.etcFaceNameList);
    this.copyFaceNameList(from.symbolFaceNameList, this.symbolFaceNameList);
    this.copyFaceNameList(from.userFaceNameList, this.userFaceNameList);

    this.borderFillList.length = 0;
    for (const borderFill of from.borderFillList) {
      this.borderFillList.push(borderFill.clone());
    }

    this.charShapeList.length = 0;
    for (const charShape of from.charShapeList) {
      this.charShapeList.push(charShape.clone());
    }

    this.tabDefList.length = 0;
    for (const tabDef of from.tabDefList) {
      this.tabDefList.push(tabDef.clone());
    }

    this.numberingList.length = 0;
    for (const numbering of from.numberingList) {
      this.numberingList.push(numbering.clone());
    }

    this.bulletList.length = 0;
    for (const bullet of from.bulletList) {
      this.bulletList.push(bullet.clone());
    }

    this.paraShapeList.length = 0;
    for (const paraShape of from.paraShapeList) {
      this.paraShapeList.push(paraShape.clone());
    }

    this.styleList.length = 0;
    for (const style of from.styleList) {
      this.styleList.push(style.clone());
    }

    if (from.docData != null) {
      this.docData = from.docData.clone();
    } else {
      this.docData = null;
    }

    if (from.distributeDocData != null) {
      this.distributeDocData = from.distributeDocData.clone();
    } else {
      this.distributeDocData = null;
    }

    if (from.compatibleDocument != null) {
      this.compatibleDocument = from.compatibleDocument.clone();
    } else {
      this.compatibleDocument = null;
    }

    if (from.layoutCompatibility != null) {
      this.layoutCompatibility = from.layoutCompatibility.clone();
    } else {
      this.layoutCompatibility = null;
    }

    if (from.trackChange != null) {
      this.trackChange = from.trackChange.clone();
    } else {
      this.trackChange = null;
    }

    this.memoShapeList.length = 0;
    for (const memoShape of from.memoShapeList) {
      this.memoShapeList.push(memoShape.clone());
    }

    if (from.forbiddenChar != null) {
      this.forbiddenChar = from.forbiddenChar.clone();
    } else {
      this.forbiddenChar = null;
    }

    this.trackChange2List.length = 0;
    for (const unknownRecord of from.trackChange2List) {
      this.trackChange2List.push(unknownRecord.clone());
    }

    this.trackChangeAuthorList.length = 0;
    for (const unknownRecord of from.trackChangeAuthorList) {
      this.trackChangeAuthorList.push(unknownRecord.clone());
    }
  }

  private copyFaceNameList(from: FaceName[], to: FaceName[]): void {
    to.length = 0;
    for (const faceName of from) {
      to.push(faceName.clone());
    }
  }
}
