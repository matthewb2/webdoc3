// src/table.ts - table cell mouse selection
import { getCachedPages } from './renderHtml';
import { pageLayout } from './layout/layoutConstants';
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

// 선택 영역 병합 요청 (2셀 이상일 때만, 마스터 셀에 캐럿)
export function mergeSelectedCells(container: HTMLDivElement, worker: Worker): boolean {
  if (!cellSel) return false;
  const { tableDocIdx, r0, r1, c0, c1 } = cellSel;
  if (r0 === r1 && c0 === c1) return false;
  worker.postMessage({ type: 'EDIT_TABLE_MERGE', payload: { tableDocIdx, r0, r1, c0, c1 } });
  collapseCaretToCell(container, cellSel);
  return true;
}

export function initCellSelection(container: HTMLDivElement, worker: Worker) {
  let rowResize: { table: HTMLTableElement; tableDocIdx: number; rowIndex: number; tr: HTMLTableRowElement; startY: number; startH: number } | null = null;
  
  let colResize: { table: HTMLTableElement; tableDocIdx: number; colIndex: number; startX: number; startW: number; startColWidths: number[]; originalLayout: string } | null = null;
  
  
  let tableDrag: { table: HTMLTableElement; tableDocIdx: number; startX: number; startY: number; moved: boolean; edge: 'left' | 'right' | 'top' | 'bottom' } | null = null;

  function rowResizeHit(e: MouseEvent): { table: HTMLTableElement; tableDocIdx: number; rowIndex: number; tr: HTMLTableRowElement } | null {
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

  function colResizeHit(e: MouseEvent): { table: HTMLTableElement; tableDocIdx: number; colIndex: number; td: HTMLTableCellElement } | null {
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
    // 병합 셀의 오른쪽 경계는 (시작 컬럼 + colSpan - 1) 컬럼 경계
    const colIndex = startCol + colSpan - 1;
    return { table, tableDocIdx, colIndex, td };
  }

  function tableBorderHit(e: MouseEvent): { table: HTMLTableElement; tableDocIdx: number; edge: 'left' | 'right' | 'top' | 'bottom' } | null {
    const table = (e.target as Element)?.closest?.('table') as HTMLTableElement | null;
    if (!table || !container.contains(table)) return null;
    const rect = table.getBoundingClientRect();
    const margin = 6;
    const edges: Array<'left' | 'right' | 'top' | 'bottom'> = [];
    if (e.clientX <= rect.left + margin) edges.push('left');
    if (e.clientX >= rect.right - margin) edges.push('right');
    if (e.clientY <= rect.top + margin) edges.push('top');
    if (e.clientY >= rect.bottom - margin) edges.push('bottom');
    if (edges.length === 0) return null;
    // 우선순위: 좌우(특히 오른쪽) 가장자리 드래그를 명확히 인식
    const edge = edges.includes('right') ? 'right' : edges.includes('left') ? 'left' : edges[0];
    const tableDocIdx = parseInt(table.dataset.pIdx || '', 10);
    if (isNaN(tableDocIdx)) return null;
    console.log('[table-drag] border hit', { tableDocIdx, edge, x: e.clientX, y: e.clientY, rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } });
    return { table, tableDocIdx, edge };
  }

  const onRowResizeMove = (e: MouseEvent) => {
    if (!rowResize) return;
    const h = Math.max(2, rowResize.startH + (e.clientY - rowResize.startY));
    rowResize.tr.style.height = `${h}px`;
    rowResize.tr.querySelectorAll('td').forEach((td) => {
      (td as HTMLElement).style.height = `${h}px`;
    });
    e.preventDefault();
  };
  const onRowResizeUp = (e: MouseEvent) => {
    if (!rowResize) return;
    const h = Math.max(2, rowResize.startH + (e.clientY - rowResize.startY));
    const { tableDocIdx, rowIndex } = rowResize;
    worker.postMessage({ type: 'EDIT_TABLE_ROW_HEIGHT', payload: { tableDocIdx, rowIndex, height: h } });
    rowResize = null;
    document.removeEventListener('mousemove', onRowResizeMove);
    document.removeEventListener('mouseup', onRowResizeUp);
    container.style.cursor = '';
  };
  //
  const applyColResizeWidths = (table: HTMLTableElement, widths: number[]) => {
  table.style.tableLayout = 'fixed';

  // 1. colgroup 및 col 엘리먼트를 생성하거나 찾아서 각 열의 너비를 강제 고정
  let colgroup = table.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('colgroup');
    table.insertBefore(colgroup, table.firstChild);
  }
  colgroup.innerHTML = widths.map(w => `<col style="width: ${w}px;">`).join('');

  // 2. 기존 셀 너비 설정 유지 또는 정돈
  table.querySelectorAll('tr').forEach((tr) => {
    let c = 0;
    tr.querySelectorAll('td').forEach((td) => {
      const span = Math.max(1, (td as HTMLTableCellElement).colSpan || 1);
      let tw = 0;
      for (let i = 0; i < span; i++) {
        tw += widths[c + i] ?? 24;
      }
      // colgroup이 지배하므로 td에 직접 주는 폭은 보조 역할을 하게 됩니다.
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

    console.log(`[calcResizedColWidths] 시작 -> colIndex: ${colIndex}, diff: ${diff}, 기존 widths:`, startColWidths);

    if (isInternal) {
      // Internal border: keep total table width, adjust adjacent left/right columns only.
      const rightW = startColWidths[rightIdx] ?? 24;
      const pairTotal = startW + rightW;
      const leftW = Math.max(24, Math.min(pairTotal - 24, startW + diff));
      widths[colIndex] = leftW;
      widths[rightIdx] = pairTotal - leftW;
      
      console.log(`[calcResizedColWidths] 내부 경계선 계산 결과 -> colIndex(${colIndex})=${leftW}, rightIdx(${rightIdx})=${widths[rightIdx]}, 변경된 widths:`, widths);
      return { widths, leftW };
    }

    // Outer edge: resize column and table width.
    const leftW = Math.max(24, startW + diff);
    if (colIndex >= 0 && colIndex < widths.length) widths[colIndex] = leftW;
    
    console.log(`[calcResizedColWidths] 바깥 테두리 계산 결과 -> widths:`, widths, `leftW: ${leftW}`);
    return { widths, leftW };
  };
  
  const onColResizeMove = (e: MouseEvent) => {
    if (!colResize) return;
    const result = calcResizedColWidths(e);
    if (!result) return;
    const { widths, leftW } = result;
    applyColResizeWidths(colResize.table, widths);
    colResize.table.style.outline = '1px solid rgba(74,144,217,0.8)';
    colResize.table.style.outlineOffset = '0px';
    console.log('[table-col-resize] move', { colIndex: colResize.colIndex, rightIdx: colResize.colIndex + 1, width: leftW, tableW: widths.reduce((a, b) => a + b, 0), internal: colResize.colIndex + 1 < widths.length, widths: widths.map(v => Math.round(v * 100) / 100) });
    e.preventDefault();
  };

const onColResizeUp = (e: MouseEvent) => {
    if (!colResize) return;
    const result = calcResizedColWidths(e);
    if (!result) return;
    const { widths, leftW } = result;
    const { tableDocIdx, colIndex, table, originalLayout } = colResize;
    table.style.outline = '';
    table.style.outlineOffset = '';
    table.style.tableLayout = originalLayout;

    // 💡 1. 리사이즈 완료 시점에도 <colgroup>을 통해 각 열(<col>)의 폭을 강제 고정
    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.insertBefore(colgroup, table.firstChild);
    }
    colgroup.innerHTML = widths.map((w) => `<col style="width: ${w}px;">`).join('');

    const scale = (table as any).__resizeDisplayScale || 1;

    // 💡 2. 복잡하게 꼬이던 origModel 보정 로직 대신, 
    // 사용자가 최종 드래그해서 맞춘 화면 폭(widths)을 scale로 나누어 정확한 모델 컬럼 폭으로 산출합니다.
    let modelColWidths: number[] = widths.map((w) => Math.max(24, scale > 0 ? w / scale : w));

    const modelLeftW = modelColWidths[colIndex] ?? (scale > 0 ? Math.max(24, leftW / scale) : leftW);
    
    console.log('[table-col-resize] up (fixed)', { 
      tableDocIdx, 
      colIndex, 
      width: modelLeftW, 
      colWidths: modelColWidths, 
      displayWidths: widths.map(v => Math.round(v * 100) / 100), 
      tableWidth: widths.reduce((a, b) => a + b, 0) 
    });

    // 💡 3. 수정된 정확한 modelColWidths를 워커로 전송하여 레이아웃이 이전으로 돌아가지 않도록 고정합니다.
    worker.postMessage({ 
      type: 'EDIT_TABLE_COL_WIDTH', 
      payload: { tableDocIdx, colIndex, width: modelLeftW, colWidths: modelColWidths } 
    });

    delete (table as any).__resizeDisplayScale;
    delete (table as any).__resizeModelColWidths;

    colResize = null;
    document.removeEventListener('mousemove', onColResizeMove);
    document.removeEventListener('mouseup', onColResizeUp);
    container.style.cursor = '';
  };

  const findDropTargetDocIdx = (_clientX: number, clientY: number, draggedDocIdx: number): number => {
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-p-idx]'))
      .filter((el) => el.closest('.page'))
      .filter((el) => parseInt(el.dataset.pIdx || '', 10) !== draggedDocIdx);
    if (els.length === 0) return draggedDocIdx;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const idx = parseInt(el.dataset.pIdx || '', 10);
      if (isNaN(idx)) continue;
      if (clientY < r.top) return idx;
      if (clientY <= r.bottom) {
        return clientY < r.top + r.height / 2 ? idx : idx + 1;
      }
    }
    const last = els[els.length - 1];
    const lastIdx = parseInt(last?.dataset.pIdx || '', 10);
    return isNaN(lastIdx) ? draggedDocIdx : lastIdx + 1;
  };

  const onTableDragMove = (e: MouseEvent) => {
    if (!tableDrag) return;
    const dx = e.clientX - tableDrag.startX;
    const dy = e.clientY - tableDrag.startY;
    if (!tableDrag.moved && Math.abs(dx) + Math.abs(dy) > 3) {
      tableDrag.moved = true;
      tableDrag.table.style.outline = '2px solid #4a90d9';
      tableDrag.table.style.outlineOffset = '0px';
      tableDrag.table.style.boxShadow = '0 0 0 2px rgba(74,144,217,0.35)';
      console.log('[table-drag] drag started', { tableDocIdx: tableDrag.tableDocIdx, edge: tableDrag.edge, dx, dy });
    }
    if (tableDrag.moved) container.style.cursor = 'move';
    e.preventDefault();
  };
  const onTableDragUp = (e: MouseEvent) => {
    if (!tableDrag) return;
    const { table, tableDocIdx, moved, edge } = tableDrag;
    table.style.outline = '';
    table.style.outlineOffset = '';
    table.style.boxShadow = '';
    container.style.cursor = '';
    document.removeEventListener('mousemove', onTableDragMove);
    document.removeEventListener('mouseup', onTableDragUp);
    tableDrag = null;
    if (moved) {
      const targetDocIdx = findDropTargetDocIdx(e.clientX, e.clientY, tableDocIdx);
      console.log('[table-drag] drop', { tableDocIdx, edge, targetDocIdx });
      if (targetDocIdx !== tableDocIdx) {
        worker.postMessage({ type: 'EDIT_MOVE_TABLE', payload: { tableDocIdx, targetDocIdx } });
      }
    } else {
      console.log('[table-drag] click without move', { tableDocIdx, edge });
    }
  };

container.addEventListener('mousedown', (e: MouseEvent) => {
  if (e.button !== 0) return;

  // 1. 칼럼 리사이즈 처리
  const cHit = colResizeHit(e);
  if (cHit) {
    if (cellEdit) exitCellEditMode(container);
    clearCellSelection(container);

    const originalLayout = cHit.table.style.tableLayout;

    // Extract grid column widths in DISPLAY space (matches rendered DOM), accounting for merged cells and render scaling.
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
      // DOM fallback in display pixels
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
      displayScale = 1; // fallback values already in display pixels
    }

    if (gridColCount > startColWidths.length) {
      while (startColWidths.length < gridColCount) startColWidths.push(24);
    }
    startColWidths = startColWidths.map((w) => (w > 0 ? w : 24));

    // Do not proportionally rescale all columns to match current rendered table width here.
    // That would distort untouched columns (e.g. merged cells/columns unrelated to the dragged boundary).
    // Keep model-derived display widths so only the dragged boundary pair changes.

    const boundaryCol = cHit.colIndex;
    const startW = (boundaryCol >= 0 && boundaryCol < startColWidths.length)
      ? startColWidths[boundaryCol]
      : cHit.td.getBoundingClientRect().width / Math.max(1, cHit.td.colSpan || 1);

    cHit.table.style.tableLayout = 'fixed';

    /* Apply table/cell widths from displayed grid column widths (merge cells use sum of spanned columns)
    *  
    */
    const applyTableWidths = (widths: number[]) => {
      cHit.table.querySelectorAll('td[data-c]').forEach((td) => {
        const c = parseInt((td as HTMLElement).dataset.c || '0', 10);
        //console.log("c: ",  c);
        const span = Math.max(1, (td as HTMLTableCellElement).colSpan || 1);
        let w = 0;
        for (let i = 0; i < span; i++) w += widths[c + i] ?? 24;
        (td as HTMLElement).style.width = `${w}px`;
      });
      cHit.table.style.width = `${widths.reduce((sum, w) => sum + w, 0)}px`;
    };
    

    applyTableWidths(startColWidths);

    // Store info for converting drag result back to model widths while preserving untouched columns
    (cHit.table as any).__resizeDisplayScale = displayScale;
    (cHit.table as any).__resizeModelColWidths = modelColWidths ? modelColWidths.slice() : null;

    colResize = {
      table: cHit.table,
      tableDocIdx: cHit.tableDocIdx,
      colIndex: boundaryCol,
      startX: e.clientX,
      startW,
      startColWidths,
      originalLayout,
    };

    container.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onColResizeMove);
    document.addEventListener('mouseup', onColResizeUp);
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // 2. 행 리사이즈 처리
  const hit = rowResizeHit(e);
  if (hit) {
    if (cellEdit) exitCellEditMode(container);
    clearCellSelection(container);
    rowResize = { ...hit, startY: e.clientY, startH: hit.tr.getBoundingClientRect().height };
    container.style.cursor = 'row-resize';
    document.addEventListener('mousemove', onRowResizeMove);
    document.addEventListener('mouseup', onRowResizeUp);
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // 3. 표 테두리(이동) 드래그 처리
  const bHit = tableBorderHit(e);
  if (bHit) {
    if (cellEdit) exitCellEditMode(container);
    clearCellSelection(container);
    cellSel = { tableDocIdx: bHit.tableDocIdx, r0: 0, r1: 0, c0: 0, c1: 0 };
    cellAnchor = null;
    cellEdit = null;
    cellDragging = false;
    paintCellSelection(container);
    tableDrag = { table: bHit.table, tableDocIdx: bHit.tableDocIdx, startX: e.clientX, startY: e.clientY, moved: false, edge: bHit.edge };
    
    bHit.table.style.outline = '2px solid rgba(74,144,217,0.9)';
    bHit.table.style.outlineOffset = '0px';
    bHit.table.style.boxShadow = '0 0 0 1px rgba(74,144,217,0.25)';
    
    document.addEventListener('mousemove', onTableDragMove);
    document.addEventListener('mouseup', onTableDragUp);
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // 4. 셀 선택 및 편집 모드 처리
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
    // 편집 모드 진입 (회색 선택은 해제)
    cellSel = null;
    cellAnchor = null;
    cellDragging = false;
    cellEdit = pos;
    paintCellSelection(container);
  });

  // 셀에 포커스가 들어오면(입력 모드) 배경 강조 없이 흰색으로 표시
  container.addEventListener('focusin', (e: FocusEvent) => {
    if (cellDragging) return;
    const td = (e.target as Element)?.closest?.('td') as HTMLTableCellElement | null;
    if (!td || !container.contains(td)) return;
    const pos = cellPosFromTd(td);
    if (!pos) return;
    // 여러 셀 범위 선택 중이면 유지 (범위 선택 확정 전 입력 전환 방지)
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
    if (rowResize || colResize) return;
    if (!cellDragging || e.buttons !== 1) {
      container.style.cursor = colResizeHit(e) ? 'col-resize' : rowResizeHit(e) ? 'row-resize' : '';
    }
    if (!cellDragging || !cellAnchor || e.buttons !== 1) return;
    const td = (e.target as Element)?.closest?.('td');
    if (!td || !container.contains(td)) return;
    const pos = cellPosFromTd(td as HTMLTableCellElement);
    if (!pos || pos.tableDocIdx !== cellAnchor.tableDocIdx) return;

    // 입력 모드 중 같은 표의 다른 셀로 드래그하면 셀 선택 모드로 전환
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
    // 단일 셀 범위(클릭 유지/입력 진입 대기)에서는 선택 강조를 그리지 않아 깜빡임 방지
    const isSingle = next.r0 === next.r1 && next.c0 === next.c1;
    cellSel = next;
    window.getSelection()?.removeAllRanges();
    if (!isSingle) paintCellSelection(container);
  });
  //
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
      // 단일 클릭: 입력 모드 전환 (배경 강조 없이 흰색)
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

