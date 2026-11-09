import { BlankFileMaker } from '@hwplib-js';
import type { HWPFile } from '@hwplib-js';
import type { DocumentModel, ParagraphNode, TableNode } from '../types';

// Control type IDs (from hwplib-js ControlType).
const CTRL_SECTION_DEFINE = 0x73656364; // 'secd'
const CTRL_COLUMN_DEFINE = 0x636f6c64; // 'cold'
const CTRL_TABLE = 0x74626c20; // 'tbl '

// Layout defaults (px) matching the editor.
const TABLE_GRID_WIDTH_PX = 623;
const DEFAULT_ROW_HEIGHT_PX = 28;

function pxToHwpUnit(px: number): number {
  return Math.max(0, Math.round(px * 75));
}

export class Doc3Adapter {
  private docModel: DocumentModel;

  constructor(docModel: DocumentModel) {
    this.docModel = docModel;
  }

  public convert(): HWPFile {
    // Start from a fully valid blank HWP (proper FileHeader, complete DocInfo with
    // face names/border fills/char/tab/numbering/para shapes/styles, compatible/layout,
    // scripts, and one section). This ensures DocInfo is correctly injected.
    const hwpFile = BlankFileMaker.make();
    this.buildBodyText(hwpFile);
    return hwpFile;
  }

  private buildBodyText(hwpFile: HWPFile): void {
    const body = hwpFile.getBodyText();
    const section = body.getSectionList()[0] as any;
    if (!section) return;

    // Replace the blank-maker's default paragraph(s) with content from docModel.
    section.deleteAllParagraphs();

    if (!this.docModel || this.docModel.length === 0) {
      this.addTextParagraph(section, '', true);
      return;
    }

    let paraIndex = 0;
    for (const node of this.docModel) {
      if (node.type === 'paragraph') {
        this.addTextParagraph(section, this.paragraphText(node), paraIndex === 0);
        paraIndex++;
      } else if (node.type === 'table') {
        this.addTableParagraph(section, node, paraIndex === 0);
        paraIndex++;
      }
    }

    if (paraIndex === 0) this.addTextParagraph(section, '', true);
  }

  private paragraphText(paraNode: ParagraphNode): string {
    return (paraNode.children || []).map((r) => r.text || '').join('');
  }

  /**
   * First paragraph of a section must carry section/column define controls and their
   * extend chars in text (mirrors BlankFileMaker's EmptyParagraphAdder.add(section)).
   */
  private addTextParagraph(section: any, text: string, isFirst: boolean): void {
    const p = section.addNewParagraph();
    this.setupParaHeader(p, isFirst);

    p.createText();
    const paraText = p.getText();
    if (isFirst) {
      paraText.addExtendCharForSectionDefine();
      paraText.addExtendCharForColumnDefine();
    }
    paraText.addString(text || '');

    p.createCharShape();
    p.getCharShape().addParaCharShape(0, 0);
    p.createLineSeg();
    this.setupDefaultLineSeg(p);

    if (isFirst) {
      this.addSectionDefine(p);
      this.addColumnDefine(p);
    }
  }

  private addTableParagraph(section: any, tableNode: TableNode, isFirst: boolean): void {
    const p = section.addNewParagraph();
    this.setupParaHeader(p, isFirst);

    p.createText();
    const paraText = p.getText();
    if (isFirst) {
      paraText.addExtendCharForSectionDefine();
      paraText.addExtendCharForColumnDefine();
    }
    paraText.addExtendCharForTable();

    p.createCharShape();
    p.getCharShape().addParaCharShape(0, 0);
    p.createLineSeg();
    this.setupDefaultLineSeg(p);

    if (isFirst) {
      this.addSectionDefine(p);
      this.addColumnDefine(p);
    }

    const tableCtrl = p.addNewControl(CTRL_TABLE);
    this.fillTableControl(tableCtrl, tableNode);
  }

  private fillTableControl(tableCtrl: any, tableNode: TableNode): void {
    const rows = tableNode.rows || [];
    const rowCount = Math.max(1, rows.length);
    const colCount = this.tableColCount(tableNode);
    const colWidthsPx = this.resolveColWidthsPx(tableNode, colCount);
    const colWidthsHu = colWidthsPx.map(pxToHwpUnit);
    const totalWidthHu = colWidthsHu.reduce((a, b) => a + b, 0) || pxToHwpUnit(TABLE_GRID_WIDTH_PX);
    const rowHeightsHu = rows.map((r) => pxToHwpUnit(r.height ?? DEFAULT_ROW_HEIGHT_PX));
    if (rowHeightsHu.length === 0) rowHeightsHu.push(pxToHwpUnit(DEFAULT_ROW_HEIGHT_PX));
    const totalHeightHu = rowHeightsHu.reduce((a, b) => a + b, 0);

    // GSO/control header (table treated as object): set total size.
    const header = tableCtrl.getHeader?.();
    if (header) {
      header.setWidth?.(totalWidthHu);
      header.setHeight?.(totalHeightHu);
      header.setOutterMarginLeft?.(0);
      header.setOutterMarginRight?.(0);
      header.setOutterMarginTop?.(0);
      header.setOutterMarginBottom?.(0);
    }

    const table = tableCtrl.getTable();
    table.getProperty?.().setValue?.(0x00000006);
    table.setRowCount?.(rowCount);
    table.setColumnCount?.(colCount);
    table.setCellSpacing?.(0);
    table.setLeftInnerMargin?.(141);
    table.setRightInnerMargin?.(141);
    table.setTopInnerMargin?.(141);
    table.setBottomInnerMargin?.(141);
    table.setBorderFillId?.(1);
    const cc = table.getCellCountOfRowList?.();
    if (cc) {
      cc.length = 0;
      for (let r = 0; r < rowCount; r++) cc.push((rows[r]?.cells || []).filter((c: any) => !c?.merged).length || colCount);
    }

    for (let r = 0; r < rowCount; r++) {
      const rowNode = rows[r];
      const row = tableCtrl.addNewRow();
      const cells = rowNode?.cells || [];
      let colIndex = 0;
      for (let ci = 0; ci < cells.length; ci++) {
        const cellNode: any = cells[ci];
        if (cellNode?.merged) continue; // placeholder covered by a span
        const cell = row.addNewCell();
        const colSpan = Math.max(1, Number(cellNode?.colSpan) || 1);
        const rowSpan = Math.max(1, Number(cellNode?.rowSpan) || 1);
        const wHu = this.spanWidth(colWidthsHu, colIndex, colSpan);
        const hHu = this.spanHeight(rowHeightsHu, r, rowSpan);
        this.fillCell(cell, cellNode, r, colIndex, rowSpan, colSpan, wHu, hHu);
        colIndex += colSpan;
      }
      // Ensure at least an empty cell if row had no real cells.
      if (row.getCellList().length === 0) {
        const cell = row.addNewCell();
        this.fillCell(cell, null, r, 0, 1, 1, colWidthsHu[0] || pxToHwpUnit(200), rowHeightsHu[r] || pxToHwpUnit(DEFAULT_ROW_HEIGHT_PX));
      }
    }
  }

  private tableColCount(tableNode: TableNode): number {
    const rows = tableNode.rows || [];
    let max = 0;
    for (const row of rows) {
      let c = 0;
      for (const cell of row.cells || []) c += Math.max(1, Number((cell as any).colSpan) || 1);
      if (c > max) max = c;
    }
    if (max > 0) return max;
    if (Array.isArray(tableNode.colWidths) && tableNode.colWidths.length > 0) return tableNode.colWidths.length;
    return 1;
  }

  private resolveColWidthsPx(tableNode: TableNode, colCount: number): number[] {
    if (Array.isArray(tableNode.colWidths) && tableNode.colWidths.length > 0) {
      const out = tableNode.colWidths.slice(0, colCount).map((n) => Math.max(1, Number(n) || 0));
      while (out.length < colCount) out.push(Math.max(1, Math.round(TABLE_GRID_WIDTH_PX / colCount)));
      return out;
    }
    const w = Math.max(1, Math.round(TABLE_GRID_WIDTH_PX / Math.max(1, colCount)));
    return Array.from({ length: colCount }, () => w);
  }

  private spanWidth(colWidthsHu: number[], start: number, span: number): number {
    let sum = 0;
    for (let i = 0; i < span; i++) sum += colWidthsHu[start + i] || colWidthsHu[colWidthsHu.length - 1] || pxToHwpUnit(200);
    return Math.max(1, sum);
  }

  private spanHeight(rowHeightsHu: number[], start: number, span: number): number {
    let sum = 0;
    for (let i = 0; i < span; i++) sum += rowHeightsHu[start + i] || rowHeightsHu[rowHeightsHu.length - 1] || pxToHwpUnit(DEFAULT_ROW_HEIGHT_PX);
    return Math.max(1, sum);
  }

  private fillCell(
    cell: any,
    cellNode: any,
    rowIndex: number,
    colIndex: number,
    rowSpan: number,
    colSpan: number,
    widthHu: number,
    heightHu: number,
  ): void {
    const lh = cell.getListHeader();
    const marginL = 510, marginR = 510, marginT = 141, marginB = 141;
    lh.setParaCount?.(1); // autosetter refines
    lh.getProperty?.().setValue?.(0);
    lh.setColIndex?.(colIndex);
    lh.setRowIndex?.(rowIndex);
    lh.setColSpan?.(colSpan);
    lh.setRowSpan?.(rowSpan);
    lh.setWidth?.(widthHu);
    lh.setHeight?.(heightHu);
    lh.setLeftMargin?.(marginL);
    lh.setRightMargin?.(marginR);
    lh.setTopMargin?.(marginT);
    lh.setBottomMargin?.(marginB);
    lh.setBorderFillId?.(1);
    lh.setTextWidth?.(Math.max(0, widthHu - marginL - marginR));
    lh.setFieldName?.('');

    const paraList = cell.getParagraphList();
    paraList.deleteAllParagraphs?.();
    const p = paraList.addNewParagraph();
    const text = (cellNode?.children || []).map((r: any) => r?.text || '').join('');
    this.setupCellParagraph(p, text);
  }

  private setupCellParagraph(p: any, text: string): void {
    const h = p.getHeader();
    h.setLastInList(true);
    h.setParaShapeId(3);
    h.setStyleId(0);
    h.setCharShapeCount(1);
    h.setRangeTagCount(0);
    h.setLineAlignCount(1);
    h.setInstanceID(0);
    h.setIsMergedByTrack(0);
    h.getDivideSort().setValue(0);

    p.createText();
    p.getText().addString(text || '');

    p.createCharShape();
    p.getCharShape().addParaCharShape(0, 0);
    p.createLineSeg();
    this.setupDefaultLineSeg(p);
  }

  private setupParaHeader(p: any, isFirst: boolean): void {
    const h = p.getHeader();
    h.setLastInList(true);
    h.setParaShapeId(3); // "바탕글"
    h.setStyleId(0);
    h.setCharShapeCount(1);
    h.setRangeTagCount(0);
    h.setLineAlignCount(1);
    h.setInstanceID(0);
    h.setIsMergedByTrack(0);
    if (isFirst) {
      h.getControlMask().setValue(4);
      h.getDivideSort().setValue(3);
    } else {
      h.getDivideSort().setValue(0);
    }
  }

  private setupDefaultLineSeg(p: any): void {
    const lineSeg = p.getLineSeg();
    if (!lineSeg) return;
    const item = lineSeg.addNewLineSegItem();
    item.setTextStartPosition(0);
    item.setLineVerticalPosition(0);
    item.setLineHeight(1000);
    item.setTextPartHeight(1000);
    item.setDistanceBaseLineToLineVerticalPosition(850);
    item.setLineSpace(600);
    item.setStartPositionFromColumn(0);
    item.setSegmentWidth(42520);
    item.getTag().setValue(393216);
  }

  private addSectionDefine(p: any): void {
    const sd = p.addNewControl(CTRL_SECTION_DEFINE);
    const header = sd.getHeader();
    header.getProperty?.().setValue?.(0);
    header.setColumnGap?.(1134);
    header.setVerticalLineAlign?.(0);
    header.setHorizontalLineAlign?.(0);
    header.setDefaultTabGap?.(8000);
    header.setNumberParaShapeId?.(1);
    header.setPageStartNumber?.(0);
    header.setImageStartNumber?.(0);
    header.setTableStartNumber?.(0);
    header.setEquationStartNumber?.(0);
    header.setDefaultLanguage?.(1042);

    const pd = sd.getPageDef?.();
    if (pd) {
      pd.setPaperWidth?.(59528);
      pd.setPaperHeight?.(84188);
      pd.setLeftMargin?.(8504);
      pd.setRightMargin?.(8504);
      pd.setTopMargin?.(5668);
      pd.setBottomMargin?.(4252);
      pd.setHeaderMargin?.(4252);
      pd.setFooterMargin?.(4252);
      pd.setGutterMargin?.(0);
      pd.getProperty?.().setValue?.(0);
    }

    for (const shape of [sd.getFootNoteShape?.(), sd.getEndNoteShape?.()]) {
      if (!shape) continue;
      shape.getProperty?.().setValue?.(0);
      shape.getUserSymbol?.().fromUTF16LEString?.('\u0000');
      shape.getBeforeDecorativeLetter?.().fromUTF16LEString?.('\u0000');
      shape.getAfterDecorativeLetter?.().fromUTF16LEString?.(')');
      shape.setStartNumber?.(1);
      shape.setDivideLineTopMargin?.(850);
      shape.setDivideLineBottomMargin?.(567);
    }

    const borderFill = (bf: any) => {
      if (!bf) return;
      bf.getProperty?.().setValue?.(1);
      bf.setLeftGap?.(1417);
      bf.setRightGap?.(1417);
      bf.setTopGap?.(1417);
      bf.setBottomGap?.(1417);
      bf.setBorderFillId?.(1);
    };
    borderFill(sd.getBothPageBorderFill?.());
    borderFill(sd.getEvenPageBorderFill?.());
    borderFill(sd.getOddPageBorderFill?.());
  }

  private addColumnDefine(p: any): void {
    const cd = p.addNewControl(CTRL_COLUMN_DEFINE);
    const header = cd.getHeader();
    header.getProperty?.().setValue?.(4100);
    header.setGapBetweenColumn?.(0);
    header.setProperty2?.(0);
    header.getDivideLine?.()?.setType?.(0);
    header.getDivideLine?.()?.setThickness?.(0);
    header.getDivideLine?.()?.getColor?.()?.setValue?.(0);
  }
}
