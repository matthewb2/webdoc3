// src/handlers/tableDrag.ts - table move drag & drop
import { clearCellSelection, exitCellEditMode, paintCellSelection, _setCellSel, _setCellAnchor, _setCellEdit, _setCellDragging } from './tableSelection';

let tableDrag: { table: HTMLTableElement; tableDocIdx: number; startX: number; startY: number; moved: boolean; edge: 'left' | 'right' | 'top' | 'bottom' } | null = null;
let containerRef: HTMLDivElement | null = null;
let workerRef: Worker | null = null;

export function isTableDraggingActive() { return !!tableDrag; }

export function tableBorderHit(container: HTMLDivElement, e: MouseEvent): { table: HTMLTableElement; tableDocIdx: number; edge: 'left' | 'right' | 'top' | 'bottom' } | null {
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
  const edge = edges.includes('right') ? 'right' : edges.includes('left') ? 'left' : edges[0];
  const tableDocIdx = parseInt(table.dataset.pIdx || '', 10);
  if (isNaN(tableDocIdx)) return null;
  return { table, tableDocIdx, edge };
}

const findDropTargetDocIdx = (container: HTMLDivElement, _clientX: number, clientY: number, draggedDocIdx: number): number => {
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
  if (!tableDrag || !containerRef) return;
  const dx = e.clientX - tableDrag.startX;
  const dy = e.clientY - tableDrag.startY;
  if (!tableDrag.moved && Math.abs(dx) + Math.abs(dy) > 3) {
    tableDrag.moved = true;
    tableDrag.table.style.outline = '2px solid #4a90d9';
    tableDrag.table.style.outlineOffset = '0px';
    tableDrag.table.style.boxShadow = '0 0 0 2px rgba(74,144,217,0.35)';
  }
  if (tableDrag.moved) containerRef.style.cursor = 'move';
  e.preventDefault();
};

const onTableDragUp = (e: MouseEvent) => {
  if (!tableDrag || !containerRef || !workerRef) return;
  const { table, tableDocIdx, moved } = tableDrag;
  table.style.outline = '';
  table.style.outlineOffset = '';
  table.style.boxShadow = '';
  containerRef.style.cursor = '';
  document.removeEventListener('mousemove', onTableDragMove);
  document.removeEventListener('mouseup', onTableDragUp);
  tableDrag = null;
  if (moved) {
    const targetDocIdx = findDropTargetDocIdx(containerRef, e.clientX, e.clientY, tableDocIdx);
    if (targetDocIdx !== tableDocIdx) {
      workerRef.postMessage({ type: 'EDIT_MOVE_TABLE', payload: { tableDocIdx, targetDocIdx } });
    }
  }
};

export function tryHandleTableDragMouseDown(container: HTMLDivElement, worker: Worker, e: MouseEvent, bHit: { table: HTMLTableElement; tableDocIdx: number; edge: 'left' | 'right' | 'top' | 'bottom' }): boolean {
  if (e.button !== 0) return false;
  containerRef = container; workerRef = worker;
  exitCellEditMode(container);
  clearCellSelection(container);
  _setCellSel({ tableDocIdx: bHit.tableDocIdx, r0: 0, r1: 0, c0: 0, c1: 0 });
  _setCellAnchor(null);
  _setCellEdit(null);
  _setCellDragging(false);
  paintCellSelection(container);
  tableDrag = { table: bHit.table, tableDocIdx: bHit.tableDocIdx, startX: e.clientX, startY: e.clientY, moved: false, edge: bHit.edge };
  bHit.table.style.outline = '2px solid rgba(74,144,217,0.9)';
  bHit.table.style.outlineOffset = '0px';
  bHit.table.style.boxShadow = '0 0 0 1px rgba(74,144,217,0.25)';
  document.addEventListener('mousemove', onTableDragMove);
  document.addEventListener('mouseup', onTableDragUp);
  e.preventDefault();
  e.stopPropagation();
  return true;
}

export function initTableDragHandler(container: HTMLDivElement, worker: Worker) {
  containerRef = container;
  workerRef = worker;
}
