import type { DocumentModel, TableCellNode, TableNode, TableRowNode, TextRun } from '../types';

type LocateRun = (children: TextRun[], charIndex: number) => { runIndex: number; localIndex: number };
type SeedRun = () => TextRun;

export function editTableAlign(
  documentState: DocumentModel,
  requestLayout: () => void,
  tableDocIdx: number,
  rows: number[],
  cols: number[],
  align?: string,
) {
  const valid = ['left', 'center', 'right', 'justify'];
  const value = align && valid.includes(align) ? align : 'left';
  const table = documentState[tableDocIdx];
  if (!table || table.type !== 'table') return;
  const rowSet = new Set(Array.isArray(rows) ? rows : []);
  const colSet = new Set(Array.isArray(cols) ? cols : []);
  table.rows.forEach((row, ri) => {
    if (!rowSet.has(ri)) return;
    row.cells.forEach((cell, ci) => {
      if (!colSet.has(ci)) return;
      cell.align = value as any;
    });
  });
  requestLayout();
}

export function editTableMerge(
  documentState: DocumentModel,
  requestLayout: () => void,
  tableDocIdx: number,
  r0: number,
  r1: number,
  c0: number,
  c1: number,
) {
  const table = documentState[tableDocIdx];
  if (!table || table.type !== 'table') return;
  const top = Math.max(0, Math.min(r0, r1));
  const bottom = Math.min(table.rows.length - 1, Math.max(r0, r1));
  if (bottom < top) return;
  const maxCols = Math.max(0, ...table.rows.map((row) => row.cells.length));
  const left = Math.max(0, Math.min(c0, c1));
  const right = Math.min(maxCols - 1, Math.max(c0, c1));
  if (right < left) return;
  if (bottom === top && right === left) return;
  const masterRow = table.rows[top];
  const master = masterRow && masterRow.cells[left];
  if (!master || master.merged) return;
  const merged: TextRun[] = [];
  for (let r = top; r <= bottom; r++) {
    const row = table.rows[r];
    if (!row) continue;
    for (let c = left; c <= right; c++) {
      const cell = row.cells[c];
      if (!cell) continue;
      if (r === top && c === left) continue;
      merged.push(...(cell.children || []));
      cell.children = [];
      cell.merged = true;
      delete cell.align;
    }
  }
  master.children.push(...merged);
  master.rowSpan = bottom - top + 1;
  master.colSpan = right - left + 1;
  delete master.merged;
  requestLayout();
}

export function editTableRowHeight(
  documentState: DocumentModel,
  requestLayout: () => void,
  tableDocIdx: number,
  rowIndex: number,
  height: number,
) {
  const table = documentState[tableDocIdx];
  if (!table || table.type !== 'table') return;
  const row = table.rows.find((r: any) => r && r._rowIdx === rowIndex) ?? table.rows[rowIndex];
  if (!row) return;
  const h = Math.max(24, Math.min(2000, height));
  row.height = h;
  requestLayout();
}

export function editTableColWidth(
  documentState: DocumentModel,
  requestLayout: () => void,
  tableDocIdx: number,
  colIndex: number,
  width: number,
) {
  const table = documentState[tableDocIdx];
  if (!table || table.type !== 'table') return;
  const n = Math.max(colIndex + 1, ...(table.rows.map((r) => r.cells.length)), table.colWidths?.length ?? 0);
  const base = 624 / Math.max(1, table.rows[0]?.cells.length ?? n);
  if (!table.colWidths) table.colWidths = new Array(n).fill(base);
  while (table.colWidths.length < n) table.colWidths.push(base);
  for (let i = 0; i < table.colWidths.length; i++) if (!table.colWidths[i]) table.colWidths[i] = base;
  table.colWidths[colIndex] = Math.max(24, Math.min(2000, width));
  requestLayout();
}

export function editTableBorder(
  documentState: DocumentModel,
  requestLayout: () => void,
  tableDocIdx: number,
  borderStyle: string | undefined,
) {
  const node = documentState[tableDocIdx];
  if (node && node.type === 'table') {
    (node as any).borderStyle = borderStyle;
    requestLayout();
  }
}

export function editInsertTable(
  documentState: DocumentModel,
  requestLayout: () => void,
  helpers: { locateRun: LocateRun; seedRun: SeedRun },
  docIdx: number,
  charIndex: number,
  rows: number,
  cols: number,
) {
  const { locateRun, seedRun } = helpers;
  const rCount = Math.max(1, Math.min(50, Math.floor(rows) || 2));
  const cCount = Math.max(1, Math.min(50, Math.floor(cols) || 2));
  const tableRows: TableRowNode[] = [];
  for (let r = 0; r < rCount; r++) {
    const cells: TableCellNode[] = [];
    for (let c = 0; c < cCount; c++) {
      cells.push({ type: 'table-cell', children: [{ text: '' }] });
    }
    tableRows.push({ type: 'table-row', cells });
  }
  const table: TableNode = { type: 'table', rows: tableRows };

  const item = documentState[docIdx];
  if (item?.type === 'paragraph') {
    const { runIndex, localIndex } = locateRun(item.children, Math.max(0, charIndex));
    const left: TextRun[] = [];
    const right: TextRun[] = [];
    item.children.forEach((run, i) => {
      const t = run.text || '';
      if (i < runIndex) left.push(run);
      else if (i > runIndex) right.push(run);
      else {
        left.push({ ...run, text: t.slice(0, localIndex) });
        right.push({ ...run, text: t.slice(localIndex) });
      }
    });
    const paraProps = {
      align: item.align,
      columns: item.columns,
      indent: item.indent,
      leftIndent: item.leftIndent,
      textIndent: item.textIndent,
      lineSpacing: item.lineSpacing,
      spaceBefore: item.spaceBefore,
      spaceAfter: item.spaceAfter,
    };
    const leftPara = { type: 'paragraph' as const, children: left.length > 0 ? left : [seedRun()], ...paraProps };
    const rightPara = { type: 'paragraph' as const, children: right.length > 0 ? right : [seedRun()], ...paraProps };
    documentState.splice(docIdx, 1, leftPara, table, rightPara);
  } else {
    const insertAt = Math.min(Math.max(0, docIdx + 1), documentState.length);
    const emptyPara = { type: 'paragraph' as const, children: [seedRun()] };
    documentState.splice(insertAt, 0, table, emptyPara);
  }
  requestLayout();
}

export function editMoveTable(
  documentState: DocumentModel,
  requestLayout: () => void,
  tableDocIdx: number,
  targetDocIdx: number,
) {
  if (tableDocIdx < 0 || tableDocIdx >= documentState.length) return;
  const node = documentState[tableDocIdx];
  if (!node || (node as any).type !== 'table') return;

  let insertAt = Math.max(0, Math.min(targetDocIdx, documentState.length));
  if (insertAt === tableDocIdx) return;

  documentState.splice(tableDocIdx, 1);
  if (insertAt > tableDocIdx) insertAt -= 1;
  insertAt = Math.max(0, Math.min(insertAt, documentState.length));
  documentState.splice(insertAt, 0, node);
  requestLayout();
}
