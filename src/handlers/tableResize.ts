// src/handlers/tableResize.ts - table row/column resize handlers
import { getCachedPages } from '../renderHtml';
import { pageLayout } from '../layout/layoutConstants';
import { clearCellSelection, exitCellEditMode } from './tableSelection';

let rowResize: { table: HTMLTableElement; tableDocIdx: number; rowIndex: number; tr: HTMLTableRowElement; startY: number; startH: number } | null = null;
let colResize: { table: HTMLTableElement; tableDocIdx: number; colIndex: number; startX: number; startW: number; startColWidths: number[]; originalLayout: string } | null = null;

let guideV: HTMLDivElement | null = null;
let guideH: HTMLDivElement | null = null;

function ensureResizeGuides(): { v: HTMLDivElement; h: HTMLDivElement } {
  if (!guideV) {
    guideV = document.createElement('div');
    guideV.className = 'table-resize-guide table-resize-guide-v';
    document.body.appendChild(guideV);
  }
  if (!guideH) {
    guideH = document.createElement('div');
    guideH.className = 'table-resize-guide table-resize-guide-h';
    document.body.appendChild(guideH);
  }
  return { v: guideV, h: guideH };
}

function showColResizeGuide(clientX: number) {
  const { v, h } = ensureResizeGuides();
  h.style.display = 'none';
  v.style.left = `${clientX}px`;
  v.style.display = 'block';
}

function showRowResizeGuide(clientY: number) {
  const { v, h } = ensureResizeGuides();
  v.style.display = 'none';
  h.style.top = `${clientY}px`;
  h.style.display = 'block';
}

function hideResizeGuides() {
  if (guideV) guideV.style.display = 'none';
  if (guideH) guideH.style.display = 'none';
}

export function isResizingActive() { return !!(rowResize || colResize); }

export function rowResizeHit(container: HTMLDivElement, e: MouseEvent): { table: HTMLTableElement; tableDocIdx: number; rowIndex: number; tr: HTMLTableRowElement } | null {
  const td = (e.target as Element)?.closest?.('td') as HTMLTableCellElement | null;
  if (!td || !container.contains(td)) return null;
  const tr = td.closest('tr') as HTMLTableRowElement | null;
  const table = td.closest('table') as HTMLTableElement | null;
  if (!tr || !table) return null;
  const rect = tr.getBoundingClientRect();
  if (Math.abs(e.clientY - rect.bottom) > 5) return null;
  const tableDocIdx = parseInt(table.dataset.pIdx || '', 10);
  const first = tr.querySelector('td[data-r]') as HTMLTableCellElement | null;
  const rowIndex = parseInt(first?.dataset.r || td.dataset.r || '', 10);
  if (isNaN(tableDocIdx) || isNaN(rowIndex)) return null;
  return { table, tableDocIdx, rowIndex, tr };
}

export function colResizeHit(container: HTMLDivElement, e: MouseEvent): { table: HTMLTableElement; tableDocIdx: number; colIndex: number; td: HTMLTableCellElement } | null {
  const td = (e.target as Element)?.closest?.('td') as HTMLTableCellElement | null;
  if (!td || !container.contains(td)) return null;
  const table = td.closest('table') as HTMLTableElement | null;
  if (!table) return null;
  const rect = td.getBoundingClientRect();
  if (Math.abs(e.clientX - rect.right) > 5) return null;
  const tableDocIdx = parseInt(table.dataset.pIdx || '', 10);
  const startCol = parseInt(td.dataset.c || '', 10);
  if (isNaN(tableDocIdx) || isNaN(startCol)) return null;
  const colSpan = Math.max(1, td.colSpan || 1);
  const colIndex = startCol + colSpan - 1;
  return { table, tableDocIdx, colIndex, td };
}

let containerRef: HTMLDivElement | null = null;
let workerRef: Worker | null = null;

const onRowResizeMove = (e: MouseEvent) => {
  if (!rowResize) return;
  const h = Math.max(2, rowResize.startH + (e.clientY - rowResize.startY));
  rowResize.tr.style.height = `${h}px`;
  rowResize.tr.querySelectorAll('td').forEach((td) => {
    (td as HTMLElement).style.height = `${h}px`;
  });
  const trRect = rowResize.tr.getBoundingClientRect();
  // 드래그 중 실제 행 높이에 맞춘 경계선 위치 표시
  showRowResizeGuide(trRect.top + h);
  e.preventDefault();
};
const onRowResizeUp = (e: MouseEvent) => {
  if (!rowResize || !containerRef || !workerRef) return;
  const h = Math.max(2, rowResize.startH + (e.clientY - rowResize.startY));
  const { tableDocIdx, rowIndex } = rowResize;
  workerRef.postMessage({ type: 'EDIT_TABLE_ROW_HEIGHT', payload: { tableDocIdx, rowIndex, height: h } });
  rowResize = null;
  hideResizeGuides();
  document.removeEventListener('mousemove', onRowResizeMove);
  document.removeEventListener('mouseup', onRowResizeUp);
  containerRef.style.cursor = '';
};

const applyColResizeWidths = (table: HTMLTableElement, widths: number[]) => {
  table.style.tableLayout = 'fixed';
  let colgroup = table.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('colgroup');
    table.insertBefore(colgroup, table.firstChild);
  }
  colgroup.innerHTML = widths.map(w => `<col style="width: ${w}px;">`).join('');
  table.querySelectorAll('tr').forEach((tr) => {
    let c = 0;
    tr.querySelectorAll('td').forEach((td) => {
      const span = Math.max(1, (td as HTMLTableCellElement).colSpan || 1);
      let tw = 0;
      for (let i = 0; i < span; i++) tw += widths[c + i] ?? 24;
      (td as HTMLElement).style.width = `${tw}px`;
      c += span;
    });
  });
  table.style.width = `${widths.reduce((a, b) => a + b, 0)}px`;
};

const calcResizedColWidths = (e: MouseEvent): { widths: number[]; leftW: number } | null => {
  if (!colResize) return null;
  const { colIndex, startX, startW, startColWidths } = colResize;
  const widths = startColWidths.slice();
  const diff = e.clientX - startX;
  const rightIdx = colIndex + 1;
  const isInternal = rightIdx < widths.length;
  if (isInternal) {
    const rightW = startColWidths[rightIdx] ?? 24;
    const pairTotal = startW + rightW;
    const leftW = Math.max(24, Math.min(pairTotal - 24, startW + diff));
    widths[colIndex] = leftW;
    widths[rightIdx] = pairTotal - leftW;
    return { widths, leftW };
  }
  const leftW = Math.max(24, startW + diff);
  if (colIndex >= 0 && colIndex < widths.length) widths[colIndex] = leftW;
  return { widths, leftW };
};

const onColResizeMove = (e: MouseEvent) => {
  if (!colResize) return;
  const result = calcResizedColWidths(e);
  if (!result) return;
  const { widths } = result;
  applyColResizeWidths(colResize.table, widths);
  colResize.table.style.outline = '1px solid rgba(74,144,217,0.8)';
  colResize.table.style.outlineOffset = '0px';

  // 드래그한 열 경계의 실제 화면 위치에 세로 가이드 라인 표시
  const leftSum = widths.slice(0, colResize.colIndex + 1).reduce((a, b) => a + b, 0);
  const tableRect = colResize.table.getBoundingClientRect();
  showColResizeGuide(tableRect.left + leftSum);
  e.preventDefault();
};

const onColResizeUp = (e: MouseEvent) => {
  if (!colResize || !containerRef || !workerRef) return;
  const result = calcResizedColWidths(e);
  if (!result) return;
  const { widths, leftW } = result;
  const { tableDocIdx, colIndex, table, originalLayout } = colResize;
  table.style.outline = '';
  table.style.outlineOffset = '';
  table.style.tableLayout = originalLayout;

  let colgroup = table.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('colgroup');
    table.insertBefore(colgroup, table.firstChild);
  }
  colgroup.innerHTML = widths.map((w) => `<col style="width: ${w}px;">`).join('');

  const scale = (table as any).__resizeDisplayScale || 1;
  let modelColWidths: number[] = widths.map((w) => Math.max(24, scale > 0 ? w / scale : w));
  const modelLeftW = modelColWidths[colIndex] ?? (scale > 0 ? Math.max(24, leftW / scale) : leftW);

  workerRef.postMessage({
    type: 'EDIT_TABLE_COL_WIDTH',
    payload: { tableDocIdx, colIndex, width: modelLeftW, colWidths: modelColWidths }
  });

  delete (table as any).__resizeDisplayScale;
  delete (table as any).__resizeModelColWidths;

  colResize = null;
  hideResizeGuides();
  document.removeEventListener('mousemove', onColResizeMove);
  document.removeEventListener('mouseup', onColResizeUp);
  containerRef.style.cursor = '';
};

export function tryHandleColResizeMouseDown(container: HTMLDivElement, worker: Worker, e: MouseEvent, cHit: { table: HTMLTableElement; tableDocIdx: number; colIndex: number; td: HTMLTableCellElement }): boolean {
  if (e.button !== 0) return false;
  containerRef = container; workerRef = worker;
  exitCellEditMode(container);
  clearCellSelection(container);

  const originalLayout = cHit.table.style.tableLayout;
  let modelColWidths: number[] | null = null;
  let startColWidths: number[] | null = null;
  let gridColCount = 0;
  let displayScale = 1;
  const pages = getCachedPages() as any[];

  outerModel: for (const page of pages) {
    const items = Array.isArray(page) ? page : page?.items;
    if (!items) continue;
    for (const item of items) {
      if (item?.type === 'table' && item._docIdx === cHit.tableDocIdx) {
        const rows: any[] = item.rows || [];
        gridColCount = Math.max(
          Array.isArray(item.colWidths) ? item.colWidths.length : 0,
          rows[0]?.cells?.length || 0,
          ...rows.map((r: any) => (r?.cells?.length || 0)),
        );
        if (Array.isArray(item.colWidths) && item.colWidths.length > 0) {
          modelColWidths = item.colWidths.map((v: any) => (typeof v === 'number' && isFinite(v) ? Math.max(0, v) : 0));
        }
        break outerModel;
      }
    }
  }

  if (!gridColCount) {
    cHit.table.querySelectorAll('td[data-c]').forEach((td) => {
      const c = parseInt((td as HTMLElement).dataset.c || '0', 10);
      const span = Math.max(1, (td as HTMLTableCellElement).colSpan || 1);
      if (!isNaN(c)) gridColCount = Math.max(gridColCount, c + span);
    });
  }

  if (modelColWidths && modelColWidths.length > 0) {
    if (gridColCount > modelColWidths.length) {
      const fb = 24;
      while (modelColWidths.length < gridColCount) modelColWidths.push(fb);
    }
    const totalModel = modelColWidths.reduce((a, b) => a + b, 0);
    const contentWidth = pageLayout.contentWidth || 624;
    displayScale = totalModel > contentWidth ? contentWidth / totalModel : 1;
    startColWidths = modelColWidths.map((w) => Math.max(24, w * displayScale));
  }

  if (!startColWidths?.length) {
    const measured: number[] = Array.from({ length: Math.max(gridColCount, 1) }, () => 0);
    const counts: number[] = Array.from({ length: Math.max(gridColCount, 1) }, () => 0);
    cHit.table.querySelectorAll('td[data-c]').forEach((td) => {
      const c = parseInt((td as HTMLElement).dataset.c || '0', 10);
      const span = Math.max(1, (td as HTMLTableCellElement).colSpan || 1);
      if (isNaN(c)) return;
      const per = (td as HTMLElement).getBoundingClientRect().width / span;
      for (let i = 0; i < span; i++) {
        const gi = c + i;
        if (gi >= measured.length) continue;
        measured[gi] += per;
        counts[gi] += 1;
      }
    });
    if (!gridColCount) gridColCount = measured.length;
    startColWidths = Array.from({ length: gridColCount }, (_, i) => {
      const avg = counts[i] > 0 ? measured[i] / counts[i] : 0;
      return avg > 0 ? avg : 24;
    });
    displayScale = 1;
  }

  if (gridColCount > startColWidths.length) {
    while (startColWidths.length < gridColCount) startColWidths.push(24);
  }
  startColWidths = startColWidths.map((w) => (w > 0 ? w : 24));

  const boundaryCol = cHit.colIndex;
  const startW = (boundaryCol >= 0 && boundaryCol < startColWidths.length)
    ? startColWidths[boundaryCol]
    : cHit.td.getBoundingClientRect().width / Math.max(1, cHit.td.colSpan || 1);

  cHit.table.style.tableLayout = 'fixed';
  const applyTableWidths = (widths: number[]) => {
    cHit.table.querySelectorAll('td[data-c]').forEach((td) => {
      const c = parseInt((td as HTMLElement).dataset.c || '0', 10);
      const span = Math.max(1, (td as HTMLTableCellElement).colSpan || 1);
      let w = 0;
      for (let i = 0; i < span; i++) w += widths[c + i] ?? 24;
      (td as HTMLElement).style.width = `${w}px`;
    });
    cHit.table.style.width = `${widths.reduce((sum, w) => sum + w, 0)}px`;
  };

  applyTableWidths(startColWidths);
  (cHit.table as any).__resizeDisplayScale = displayScale;
  (cHit.table as any).__resizeModelColWidths = modelColWidths ? modelColWidths.slice() : null;

  colResize = { table: cHit.table, tableDocIdx: cHit.tableDocIdx, colIndex: boundaryCol, startX: e.clientX, startW, startColWidths, originalLayout };
  container.style.cursor = 'col-resize';
  {
    const leftSum = startColWidths.slice(0, boundaryCol + 1).reduce((a, b) => a + b, 0);
    const tableRect = cHit.table.getBoundingClientRect();
    showColResizeGuide(tableRect.left + leftSum);
  }
  document.addEventListener('mousemove', onColResizeMove);
  document.addEventListener('mouseup', onColResizeUp);
  e.preventDefault();
  e.stopPropagation();
  return true;
}

export function tryHandleRowResizeMouseDown(container: HTMLDivElement, worker: Worker, e: MouseEvent, hit: { table: HTMLTableElement; tableDocIdx: number; rowIndex: number; tr: HTMLTableRowElement }): boolean {
  if (e.button !== 0) return false;
  containerRef = container; workerRef = worker;
  exitCellEditMode(container);
  clearCellSelection(container);
  rowResize = { ...hit, startY: e.clientY, startH: hit.tr.getBoundingClientRect().height };
  container.style.cursor = 'row-resize';
  {
    const rect = hit.tr.getBoundingClientRect();
    showRowResizeGuide(rect.bottom);
  }
  document.addEventListener('mousemove', onRowResizeMove);
  document.addEventListener('mouseup', onRowResizeUp);
  e.preventDefault();
  e.stopPropagation();
  return true;
}

export function initTableResizeHandler(container: HTMLDivElement, worker: Worker) {
  containerRef = container;
  workerRef = worker;
}
