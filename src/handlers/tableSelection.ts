// src/handlers/tableSelection.ts - table cell selection, painting, context menu, and event coordination
import { initTableResizeHandler, rowResizeHit, colResizeHit, isResizingActive, tryHandleColResizeMouseDown, tryHandleRowResizeMouseDown } from './tableResize';
import { initTableDragHandler, tableBorderHit, tryHandleTableDragMouseDown } from './tableDrag';

export interface CellSel {
  tableDocIdx: number;
  r0: number;
  r1: number;
  c0: number;
  c1: number;
}

const CELL_SEL_BG = '#ACCEF780';

let cellSel: CellSel | null = null;
let cellAnchor: { tableDocIdx: number; r: number; c: number } | null = null;
let cellDragging = false;
let cellEdit: { tableDocIdx: number; r: number; c: number } | null = null;

export function isCellEditMode(): boolean {
  return cellEdit !== null;
}

export function exitCellEditMode(container?: HTMLDivElement): void {
  if (!cellEdit) return;
  cellEdit = null;
  paintCellSelection(container);
}

export function getCellSelection(): CellSel | null {
  return cellSel;
}

export function cellPosFromTd(td: HTMLTableCellElement): { tableDocIdx: number; r: number; c: number } | null {
  const table = td.closest('table');
  if (!table) return null;
  const docIdx = parseInt((table as HTMLElement).dataset.pIdx || '', 10);
  const r = parseInt(td.dataset.r || '', 10);
  const c = parseInt(td.dataset.c || '', 10);
  if ([docIdx, r, c].some((v) => isNaN(v))) return null;
  return { tableDocIdx: docIdx, r, c };
}

export function paintCellSelection(container?: HTMLDivElement): void {
  const root =
    container || (document.getElementById('editor-container') as HTMLDivElement | null);
  if (!root) return;
  root.querySelectorAll('td[data-celledit]').forEach((td) => {
    const el = td as HTMLElement;
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.backgroundColor = '';
    delete el.dataset.celledit;
  });
  root.querySelectorAll('td[data-cellsel]').forEach((td) => {
    (td as HTMLElement).style.backgroundColor = '';
    delete (td as HTMLElement).dataset.cellsel;
  });
  if (cellSel) {
    root.querySelectorAll(`table[data-p-idx="${cellSel.tableDocIdx}"]`).forEach((table) => {
      table.querySelectorAll('td[data-r]').forEach((td) => {
        const el = td as HTMLElement;
        const r = parseInt(el.dataset.r || '', 10);
        const c = parseInt(el.dataset.c || '', 10);
        if (!cellSel) return;
        if (r >= cellSel.r0 && r <= cellSel.r1 && c >= cellSel.c0 && c <= cellSel.c1) {
          if (cellEdit && sameCell(cellEdit, el as HTMLTableCellElement)) return;
          el.style.backgroundColor = CELL_SEL_BG;
          el.dataset.cellsel = '1';
        }
      });
    });
  }
  if (cellEdit) {
    const table = root.querySelector(`table[data-p-idx="${cellEdit.tableDocIdx}"]`);
    const td = table?.querySelector(
      `td[data-r="${cellEdit.r}"][data-c="${cellEdit.c}"]`,
    ) as HTMLElement | null;
    if (td) {
      td.style.backgroundColor = '#ffffff';
      td.dataset.celledit = '1';
    }
  }
  window.dispatchEvent(new CustomEvent('table-context-change'));
}

export function getActiveTableDocIdx(container?: HTMLDivElement): number | null {
  if (cellSel) return cellSel.tableDocIdx;
  if (cellEdit) return cellEdit.tableDocIdx;
  const root =
    container || (document.getElementById('editor-container') as HTMLDivElement | null);
  if (!root) return null;
  const active = document.activeElement as Element | null;
  let td = active?.closest?.('td') as HTMLTableCellElement | null;
  if (!td || !root.contains(td)) {
    const sel = window.getSelection();
    const anchor = sel?.anchorNode ?? null;
    const anchorEl = anchor?.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as Element | null);
    td = (anchorEl?.closest?.('td') as HTMLTableCellElement | null) ?? null;
  }
  if (!td || !root.contains(td)) return null;
  const pos = cellPosFromTd(td);
  return pos ? pos.tableDocIdx : null;
}

export function clearCellSelection(container?: HTMLDivElement): void {
  if (!cellSel && !cellAnchor && !cellEdit) return;
  cellSel = null;
  cellAnchor = null;
  cellDragging = false;
  cellEdit = null;
  paintCellSelection(container);
}

export function selectCellFromInputMode(container?: HTMLDivElement): boolean {
  const root =
    container || (document.getElementById('editor-container') as HTMLDivElement | null);
  if (!root) return false;

  let pos = cellEdit;
  if (!pos) {
    const active = document.activeElement as Element | null;
    let td = active?.closest?.('td') as HTMLTableCellElement | null;
    if (!td || !root.contains(td)) {
      const sel = window.getSelection();
      const anchor = sel?.anchorNode ?? null;
      const anchorEl = anchor?.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as Element | null);
      td = (anchorEl?.closest?.('td') as HTMLTableCellElement | null) ?? null;
    }
    if (td && root.contains(td)) pos = cellPosFromTd(td);
  }
  if (!pos) return false;

  cellEdit = null;
  cellAnchor = null;
  cellDragging = false;
  cellSel = { tableDocIdx: pos.tableDocIdx, r0: pos.r, r1: pos.r, c0: pos.c, c1: pos.c };
  paintCellSelection(root);
  collapseCaretToCell(root, cellSel);
  return true;
}

export function extendCellSelection(container: HTMLDivElement, dr: number, dc: number): boolean {
  if (cellEdit || !cellSel) return false;
  const table = container.querySelector(`table[data-p-idx="${cellSel.tableDocIdx}"]`) as HTMLTableElement | null;
  if (!table) return false;

  let maxR = 0;
  let maxC = 0;
  table.querySelectorAll('td[data-r][data-c]').forEach((td) => {
    const r = parseInt((td as HTMLElement).dataset.r || '', 10);
    const c = parseInt((td as HTMLElement).dataset.c || '', 10);
    if (!isNaN(r) && r > maxR) maxR = r;
    if (!isNaN(c) && c > maxC) maxC = c;
  });

  if (!cellAnchor || cellAnchor.tableDocIdx !== cellSel.tableDocIdx) {
    cellAnchor = { tableDocIdx: cellSel.tableDocIdx, r: cellSel.r0, c: cellSel.c0 };
  }
  const ar = cellAnchor.r;
  const ac = cellAnchor.c;
  let fr = ar === cellSel.r0 ? cellSel.r1 : cellSel.r0;
  let fc = ac === cellSel.c0 ? cellSel.c1 : cellSel.c0;
  fr = Math.max(0, Math.min(maxR, fr + dr));
  fc = Math.max(0, Math.min(maxC, fc + dc));

  cellSel = {
    tableDocIdx: cellSel.tableDocIdx,
    r0: Math.min(ar, fr),
    r1: Math.max(ar, fr),
    c0: Math.min(ac, fc),
    c1: Math.max(ac, fc),
  };
  window.getSelection()?.removeAllRanges();
  paintCellSelection(container);
  return true;
}

function collapseCaretToCell(container: HTMLDivElement, sel: CellSel): void {
  const table = container.querySelector(`table[data-p-idx="${sel.tableDocIdx}"]`);
  const td = table?.querySelector(`td[data-r="${sel.r0}"][data-c="${sel.c0}"]`);
  const t = td?.querySelector('span')?.firstChild;
  const selection = window.getSelection();
  if (!t || !selection) return;
  const range = document.createRange();
  range.setStart(t, 0);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function sameCell(
  a: { tableDocIdx: number; r: number; c: number } | null,
  td: HTMLTableCellElement,
): boolean {
  if (!a) return false;
  const pos = cellPosFromTd(td);
  return !!pos && pos.tableDocIdx === a.tableDocIdx && pos.r === a.r && pos.c === a.c;
}

export function hideCellMenu(): void {
  const menu = document.getElementById('cell-menu') as HTMLDivElement | null;
  if (menu) menu.style.display = 'none';
}

export function mergeSelectedCells(container: HTMLDivElement, worker: Worker): boolean {
  if (!cellSel) return false;
  const { tableDocIdx, r0, r1, c0, c1 } = cellSel;
  if (r0 === r1 && c0 === c1) return false;
  worker.postMessage({ type: 'EDIT_TABLE_MERGE', payload: { tableDocIdx, r0, r1, c0, c1 } });
  collapseCaretToCell(container, cellSel);
  return true;
}

// internal hooks for resize/drag coordination
export function _setCellSel(v: CellSel | null) { cellSel = v; }
export function _setCellAnchor(v: { tableDocIdx: number; r: number; c: number } | null) { cellAnchor = v; }
export function _setCellDragging(v: boolean) { cellDragging = v; }
export function _setCellEdit(v: { tableDocIdx: number; r: number; c: number } | null) { cellEdit = v; }
export function _getCellSel() { return cellSel; }
export function _getCellAnchor() { return cellAnchor; }
export function _getCellDragging() { return cellDragging; }
export function _getCellEdit() { return cellEdit; }

export function initTableSelectionHandler(container: HTMLDivElement, worker: Worker) {
  // init resize/drag handlers (register their document-level listeners and provide hit-test helpers)
  initTableResizeHandler(container, worker);
  initTableDragHandler(container, worker);

  container.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button !== 0) return;

    // 1) column resize
    const cHit = colResizeHit(container, e);
    if (cHit && tryHandleColResizeMouseDown(container, worker, e, cHit)) {
      return;
    }

    // 2) row resize
    const hit = rowResizeHit(container, e);
    if (hit && tryHandleRowResizeMouseDown(container, worker, e, hit)) {
      return;
    }

    // 3) table border drag
    const bHit = tableBorderHit(container, e);
    if (bHit && tryHandleTableDragMouseDown(container, worker, e, bHit)) {
      return;
    }

    // 4) cell selection/edit
    const td = (e.target as Element)?.closest?.('td');
    if (cellEdit) {
      if (td && container.contains(td) && sameCell(cellEdit, td as HTMLTableCellElement)) {
        cellAnchor = cellEdit;
        cellDragging = true;
        return;
      }
      exitCellEditMode(container);
    }
    if (!td || !container.contains(td)) {
      clearCellSelection(container);
      return;
    }
    const pos = cellPosFromTd(td as HTMLTableCellElement);
    if (!pos) return;
    cellAnchor = pos;
    cellDragging = true;
    cellSel = { tableDocIdx: pos.tableDocIdx, r0: pos.r, r1: pos.r, c0: pos.c, c1: pos.c };
  });

  container.addEventListener('dblclick', (e: MouseEvent) => {
    const td = (e.target as Element)?.closest?.('td');
    if (!td || !container.contains(td)) return;
    const pos = cellPosFromTd(td as HTMLTableCellElement);
    if (!pos) return;
    cellSel = null;
    cellAnchor = null;
    cellDragging = false;
    cellEdit = pos;
    paintCellSelection(container);
  });

  container.addEventListener('focusin', (e: FocusEvent) => {
    if (cellDragging) return;
    const td = (e.target as Element)?.closest?.('td') as HTMLTableCellElement | null;
    if (!td || !container.contains(td)) return;
    const pos = cellPosFromTd(td);
    if (!pos) return;
    if (
      cellSel &&
      (cellSel.r0 !== cellSel.r1 || cellSel.c0 !== cellSel.c1) &&
      cellSel.tableDocIdx === pos.tableDocIdx &&
      pos.r >= cellSel.r0 && pos.r <= cellSel.r1 &&
      pos.c >= cellSel.c0 && pos.c <= cellSel.c1
    ) {
      return;
    }
    cellSel = null;
    cellAnchor = null;
    cellEdit = pos;
    paintCellSelection(container);
  });

  container.addEventListener('mousemove', (e: MouseEvent) => {
    if (isResizingActive()) return;
    if (!cellDragging || e.buttons !== 1) {
      container.style.cursor = colResizeHit(container, e) ? 'col-resize' : rowResizeHit(container, e) ? 'row-resize' : '';
    }
    if (!cellDragging || !cellAnchor || e.buttons !== 1) return;
    const td = (e.target as Element)?.closest?.('td');
    if (!td || !container.contains(td)) return;
    const pos = cellPosFromTd(td as HTMLTableCellElement);
    if (!pos || pos.tableDocIdx !== cellAnchor.tableDocIdx) return;

    if (cellEdit) {
      if (sameCell(cellEdit, td as HTMLTableCellElement)) return;
      cellEdit = null;
      window.getSelection()?.removeAllRanges();
    }

    const next: CellSel = {
      tableDocIdx: pos.tableDocIdx,
      r0: Math.min(cellAnchor.r, pos.r),
      r1: Math.max(cellAnchor.r, pos.r),
      c0: Math.min(cellAnchor.c, pos.c),
      c1: Math.max(cellAnchor.c, pos.c),
    };
    const isSingle = next.r0 === next.r1 && next.c0 === next.c1;
    cellSel = next;
    window.getSelection()?.removeAllRanges();
    if (!isSingle) paintCellSelection(container);
  });

  document.addEventListener('mouseup', () => {
    if (!cellDragging) return;
    cellDragging = false;
    if (!cellSel) return;
    if (
      cellAnchor &&
      cellSel.r0 === cellSel.r1 &&
      cellSel.c0 === cellSel.c1 &&
      cellSel.r0 === cellAnchor.r &&
      cellSel.c0 === cellAnchor.c
    ) {
      cellEdit = { tableDocIdx: cellSel.tableDocIdx, r: cellSel.r0, c: cellSel.c0 };
      cellSel = null;
      cellAnchor = null;
      paintCellSelection(container);
      return;
    }
    collapseCaretToCell(container, cellSel);
  });

  const menu = document.getElementById('cell-menu') as HTMLDivElement | null;
  const mergeBtn = document.getElementById('cell-menu-merge') as HTMLButtonElement | null;
  container.addEventListener('contextmenu', (e: MouseEvent) => {
    const td = (e.target as Element)?.closest?.('td');
    if (!td || !container.contains(td)) {
      hideCellMenu();
      return;
    }
    e.preventDefault();
    const pos = cellPosFromTd(td as HTMLTableCellElement);
    if (pos) {
      const inMulti =
        cellSel &&
        cellSel.tableDocIdx === pos.tableDocIdx &&
        pos.r >= cellSel.r0 &&
        pos.r <= cellSel.r1 &&
        pos.c >= cellSel.c0 &&
        pos.c <= cellSel.c1 &&
        (cellSel.r0 !== cellSel.r1 || cellSel.c0 !== cellSel.c1);
      if (!inMulti) {
        cellAnchor = pos;
        cellSel = { tableDocIdx: pos.tableDocIdx, r0: pos.r, r1: pos.r, c0: pos.c, c1: pos.c };
        paintCellSelection(container);
      }
    }
    if (mergeBtn) {
      const multi = !!cellSel && (cellSel.r0 !== cellSel.r1 || cellSel.c0 !== cellSel.c1);
      (mergeBtn as HTMLButtonElement).disabled = !multi;
    }
    if (menu) {
      menu.style.display = 'block';
      menu.style.left = `${Math.min(e.clientX, window.innerWidth - 180)}px`;
      menu.style.top = `${Math.min(e.clientY, window.innerHeight - 60)}px`;
    }
  });
  mergeBtn?.addEventListener('click', () => {
    hideCellMenu();
    mergeSelectedCells(container, worker);
  });
  document.addEventListener('click', (e: MouseEvent) => {
    if (!(e.target as Element)?.closest?.('#cell-menu')) hideCellMenu();
  });
  document.addEventListener('scroll', () => hideCellMenu(), true);
}
