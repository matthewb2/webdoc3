// src/listener/mouse.ts - 표 셀 마우스 선택
export interface CellSel {
  tableDocIdx: number;
  r0: number;
  r1: number;
  c0: number;
  c1: number;
}

// 브라우저 텍스트 선택과 같은 푸른 계열 (Chrome 기본 선택색)
const CELL_SEL_BG = '#ACCEF780';

let cellSel: CellSel | null = null;
let cellAnchor: { tableDocIdx: number; r: number; c: number } | null = null;
let cellDragging = false;

// 텍스트 편집 모드 중인 셀 (더블클릭 진입, 드래그는 텍스트 선택)
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
          el.style.backgroundColor = CELL_SEL_BG;
          el.dataset.cellsel = '1';
        }
      });
    });
  }
  root.querySelectorAll('td[data-celledit]').forEach((td) => {
    const el = td as HTMLElement;
    el.style.outline = '';
    el.style.outlineOffset = '';
    delete el.dataset.celledit;
  });
  if (cellEdit) {
    const table = root.querySelector(`table[data-p-idx="${cellEdit.tableDocIdx}"]`);
    const td = table?.querySelector(
      `td[data-r="${cellEdit.r}"][data-c="${cellEdit.c}"]`,
    ) as HTMLElement | null;
    if (td) {
      td.style.outline = '2px solid #4a90d9';
      td.style.outlineOffset = '-2px';
      td.dataset.celledit = '1';
    }
  }
}

export function clearCellSelection(container?: HTMLDivElement): void {
  if (!cellSel && !cellAnchor && !cellEdit) return;
  cellSel = null;
  cellAnchor = null;
  cellDragging = false;
  cellEdit = null;
  paintCellSelection(container);
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

export function initCellSelection(container: HTMLDivElement) {
  container.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button !== 0) return;
    const td = (e.target as Element)?.closest?.('td');
    if (cellEdit) {
      // 편집 모드: 편집 셀 안이면 텍스트 선택에 맡김, 밖이면 모드 종료 후 일반 처리
      if (td && container.contains(td) && sameCell(cellEdit, td as HTMLTableCellElement)) return;
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
    paintCellSelection(container);
  });
  container.addEventListener('dblclick', (e: MouseEvent) => {
    const td = (e.target as Element)?.closest?.('td');
    if (!td || !container.contains(td)) return;
    const pos = cellPosFromTd(td as HTMLTableCellElement);
    if (!pos) return;
    // 편집 모드 진입 (회색 선택은 해제)
    cellSel = null;
    cellAnchor = null;
    cellDragging = false;
    cellEdit = pos;
    paintCellSelection(container);
  });
  container.addEventListener('mousemove', (e: MouseEvent) => {
    if (cellEdit) return;
    if (!cellDragging || !cellAnchor || e.buttons !== 1) return;
    const td = (e.target as Element)?.closest?.('td');
    if (!td || !container.contains(td)) return;
    const pos = cellPosFromTd(td as HTMLTableCellElement);
    if (!pos || pos.tableDocIdx !== cellAnchor.tableDocIdx) return;
    cellSel = {
      tableDocIdx: pos.tableDocIdx,
      r0: Math.min(cellAnchor.r, pos.r),
      r1: Math.max(cellAnchor.r, pos.r),
      c0: Math.min(cellAnchor.c, pos.c),
      c1: Math.max(cellAnchor.c, pos.c),
    };
    window.getSelection()?.removeAllRanges();
    paintCellSelection(container);
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
      // 단일 클릭: 해당 셀 선택 유지 (캐럿은 브라우저 기본 배치)
      paintCellSelection(container);
      return;
    }
    collapseCaretToCell(container, cellSel);
  });
}

