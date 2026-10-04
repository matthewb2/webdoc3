// src/docxExport.ts - 문서 모델(DocumentModel) → DOCX 저장 (docx 패키지 사용)
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx';
import type { DocumentModel, TableNode, TextRun as ModelRun } from '../types';

const PX_TO_TWIP = 1440 / 96;
const PX_TO_HALFPT = 1.5;

const toTwip = (px: number) => Math.round(px * PX_TO_TWIP);
const toHexColor = (color: string | undefined): string | undefined => {
  if (!color) return undefined;
  const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (m) {
    const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0').toUpperCase();
    return `${h(+m[1])}${h(+m[2])}${h(+m[3])}`;
  }
  const hex = color.match(/^#([0-9a-fA-F]{6})$/);
  if (hex) return hex[1].toUpperCase();
  return undefined;
};

const alignOf = (align: string | undefined) => {
  if (align === 'center') return AlignmentType.CENTER;
  if (align === 'right') return AlignmentType.RIGHT;
  if (align === 'justify') return AlignmentType.JUSTIFIED;
  return AlignmentType.LEFT;
};

function toTextRun(run: ModelRun): TextRun | null {
  if (!run.text) return null;
  return new TextRun({
    text: run.text,
    bold: run.bold,
    italics: run.italic,
    underline: run.underline ? { type: UnderlineType.SINGLE } : undefined,
    strike: run.strike,
    size: run.fontSize ? Math.round(run.fontSize * PX_TO_HALFPT) : undefined,
    color: toHexColor(run.color),
    font: run.fontFamily,
  });
}

function toParagraph(children: ModelRun[], align: string | undefined): Paragraph {
  const runs = (children || [])
    .map(toTextRun)
    .filter((r): r is TextRun => r !== null);
  if (runs.length === 0) return new Paragraph({ children: [new TextRun('')] });
  return new Paragraph({ alignment: alignOf(align), children: runs });
}

const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'B0B4B8' };
const CELL_MARGINS = { top: 105, left: 120, bottom: 105, right: 120 };

function toTable(table: TableNode): Table | null {
  if (table.rows.length === 0) return null;
  const maxCols = Math.max(...table.rows.map((r) => r.cells.length));
  if (maxCols <= 0) return null;
  const colW = toTwip(599 / maxCols);
  const rows = table.rows.map((row) => {
    const cells = row.cells.map((cell) => new TableCell({
      children: [toParagraph(cell.children || [], undefined)],
      width: { size: colW, type: WidthType.DXA },
      margins: { ...CELL_MARGINS },
      borders: { top: { ...CELL_BORDER }, left: { ...CELL_BORDER }, bottom: { ...CELL_BORDER }, right: { ...CELL_BORDER } },
    }));
    for (let i = row.cells.length; i < maxCols; i++) {
      cells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun('')] })],
        width: { size: colW, type: WidthType.DXA },
        margins: { ...CELL_MARGINS },
        borders: { top: { ...CELL_BORDER }, left: { ...CELL_BORDER }, bottom: { ...CELL_BORDER }, right: { ...CELL_BORDER } },
      }));
    }
    return new TableRow({ children: cells });
  });
  return new Table({
    rows,
    width: { size: toTwip(599), type: WidthType.DXA },
    columnWidths: Array.from({ length: maxCols }, () => colW),
    layout: TableLayoutType.FIXED,
  });
}

function requestDocSnapshot(worker: Worker): Promise<DocumentModel> {
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'DOC_SNAPSHOT') {
        worker.removeEventListener('message', handler);
        resolve(event.data.payload as DocumentModel);
      }
    };
    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'GET_DOC' });
  });
}

export async function saveCurrentDocumentDocx(worker: Worker, filename = 'document.docx'): Promise<void> {
  const status = document.getElementById('hwp-status') as HTMLSpanElement | null;
  try {
    if (status) status.textContent = 'DOCX 생성 중...';
    const model = await requestDocSnapshot(worker);
    const children: Array<Paragraph | Table> = [];
    model.forEach((item) => {
      if (item.type === 'paragraph') {
        children.push(toParagraph(item.children || [], (item as any).align));
      } else if (item.type === 'table') {
        const table = toTable(item as TableNode);
        if (table) children.push(table);
      }
    });
    if (children.length === 0) children.push(new Paragraph({ children: [new TextRun('')] }));
    const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
    if (status) status.textContent = `DOCX 저장 완료: ${filename}`;
  } catch (err) {
    if (status) status.textContent = `DOCX 저장 실패: ${(err as Error).message}`;
    throw err;
  }
}
