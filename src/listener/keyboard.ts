// src/listener/keyboard.ts - keyboard/input handling (English/basic input; serialized + batched inserts to keep cursor stable)
import type { CursorState, TextRun } from '../types';
import { breakKeyForRuns, computeBreaks } from '../probe';
import { getCachedPages } from '../render';
import { cachedParagraphInfo, clearPendingSelection, setAwaitingRender, snapshotSelection, selectedParagraphIndices, selectionRangeInParagraph } from './index';
import { clearCellSelection, selectCellFromInputMode, extendCellSelection } from './mouse';

// Recompute paragraph breaks from cached fragments so caret/layout stay consistent after edits.
async function refreshParaBreaks(worker: Worker, docIdx: number) {
  const frags: Array<any> = [];
  getCachedPages().forEach((page) => page.forEach((item: any) => {
    if (item.type === 'paragraph' && item._docIdx === docIdx) frags.push(item);
  }));
  if (frags.length === 0) return;
  frags.sort((a, b) => (a._charOffset ?? 0) - (b._charOffset ?? 0));
  if (frags.some((f) => f.align)) return;
  const runs: TextRun[] = frags.flatMap((f) => f.children || []);
  if (!runs.some((r) => r.text)) return;
  worker.postMessage({ type: 'BREAKS', payload: await computeBreaks([{ key: breakKeyForRuns(runs, 600), runs, width: 600 }]) });
}

// Serialize non-insert edits and insert flushes so async handlers cannot interleave and desync cursor.
let editQueue: Promise<void> = Promise.resolve();
function enqueueEdit(task: () => Promise<void>) {
  editQueue = editQueue.then(task, task);
  return editQueue;
}

// Batch consecutive text inserts to reduce worker/layout round-trips during key repeat.
let pendingInsert: { docIdx: number; charIndex: number; text: string } | null = null;
let insertFlushTimer: number | null = null;
const INSERT_BATCH_DELAY_MS = 20;

function clearInsertFlushTimer() {
  if (insertFlushTimer !== null) {
    window.clearTimeout(insertFlushTimer);
    insertFlushTimer = null;
  }
}

function scheduleInsertFlush(worker: Worker) {
  clearInsertFlushTimer();
  insertFlushTimer = window.setTimeout(() => {
    insertFlushTimer = null;
    void flushPendingInsert(worker);
  }, INSERT_BATCH_DELAY_MS);
}

async function flushPendingInsert(worker: Worker) {
  if (!pendingInsert) return;
  const batch = pendingInsert;
  pendingInsert = null;
  await enqueueEdit(async () => {
    await refreshParaBreaks(worker, batch.docIdx);
    clearPendingSelection();
    markEditPending();
    worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: batch.docIdx, charIndex: batch.charIndex, text: batch.text } });
  });
}

export function hasPendingInputState() {
  return pendingInsert !== null || insertFlushTimer !== null;
}

export function isComposingActive() {
  return false;
}

function markEditPending() {
  setAwaitingRender(true);
}

export function initEditorListeners(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  _saveCursorPosition: () => void,
  _onCompositionEnd: () => void,
  _onCompositionEditPosted: () => void,
) {
  function focusTableCell(td: HTMLTableCellElement) {
    const p = td.querySelector('p') as HTMLElement | null;
    const target = (p ?? td) as HTMLElement;
    target.focus();
    const sel = window.getSelection();
    if (!sel) return;
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const text = walker.nextNode() as Text | null;
    const range = document.createRange();
    if (text) range.setStart(text, 0);
    else range.selectNodeContents(target);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'F5') {
      const raw = window.getSelection()?.anchorNode ?? document.activeElement;
      const anchorEl = raw ? (raw.nodeType === Node.TEXT_NODE ? (raw as Text).parentElement : (raw as Element)) : null;
      if (anchorEl?.closest('td') && container.contains(anchorEl) && selectCellFromInputMode(container)) {
        e.preventDefault();
        return;
      }
    }
    if (e.key === 'Tab') {
      const raw = window.getSelection()?.anchorNode ?? document.activeElement;
      const anchorEl = raw ? (raw.nodeType === Node.TEXT_NODE ? (raw as Text).parentElement : (raw as Element)) : null;
      const td = anchorEl?.closest?.('td') as HTMLTableCellElement | null;
      if (td && container.contains(td)) {
        e.preventDefault();
        const table = td.closest('table');
        if (!table) return;
        const cells = Array.from(table.querySelectorAll('td[data-r][data-c]')) as HTMLTableCellElement[];
        const idx = cells.indexOf(td);
        if (idx < 0) return;
        const next = cells[idx + (e.shiftKey ? -1 : 1)];
        if (next) focusTableCell(next);
        return;
      }
    }
    if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const dir =
        e.key === 'ArrowLeft' ? [0, -1] :
        e.key === 'ArrowRight' ? [0, 1] :
        e.key === 'ArrowUp' ? [-1, 0] :
        e.key === 'ArrowDown' ? [1, 0] : null;
      if (dir && extendCellSelection(container, dir[0], dir[1])) {
        e.preventDefault();
        return;
      }
    }
  });

  container.addEventListener('beforeinput', (e: InputEvent) => {
    if (e.inputType === 'insertLineBreak') {
      e.preventDefault();
      return;
    }

    const sel = window.getSelection();
    const rawAnchor = sel?.anchorNode ?? null;
    const anchorElement = rawAnchor
      ? (rawAnchor.nodeType === Node.TEXT_NODE ? rawAnchor.parentElement : (rawAnchor as HTMLElement))
      : null;
    const targetEl = e.target instanceof Element ? e.target : (e.target as Node | null)?.parentElement;
    const isInsideTableElement = !!anchorElement?.closest('td, th') || !!targetEl?.closest?.('td, th');

    // Let native editing work inside table cells.
    if (isInsideTableElement) return;

    const snap = snapshotSelection(container);
    const hasRangeSelection = snap !== null && (
      snap.anchor.docIdx !== snap.focus.docIdx || snap.anchor.charIndex !== snap.focus.charIndex
    );

    const isDeleteAction = [
      'deleteContentBackward',
      'deleteContentForward',
      'deleteContent',
      'deleteByCut',
      'deleteByDrag',
    ].includes(e.inputType);

    if (isDeleteAction) {
      e.preventDefault();
      // Flush any buffered inserts before deleting so model/cursor positions are consistent.
      clearInsertFlushTimer();
      void flushPendingInsert(worker).then(() => {
        // After flushing optimistic inserts, cursor state is authoritative (DOM may not have rendered yet).
        void enqueueEdit(async () => {
          // 1) Range delete
          if (hasRangeSelection && snap) {
            const paraIndices = selectedParagraphIndices(container, cursor.docIdx, snap);
            for (const docIdx of paraIndices) {
              const r = selectionRangeInParagraph(container, docIdx, snap);
              if (r) {
                await refreshParaBreaks(worker, docIdx);
                worker.postMessage({
                  type: 'EDIT_DELETE_RANGE',
                  payload: { paragraphIndex: docIdx, fromCharIndex: r.from, endCharIndex: r.to },
                });
              }
            }
            clearPendingSelection();
            markEditPending();
            clearCellSelection(container);

            const loStart = (snap.anchor.docIdx < snap.focus.docIdx ||
              (snap.anchor.docIdx === snap.focus.docIdx && snap.anchor.charIndex <= snap.focus.charIndex))
              ? snap.anchor : snap.focus;
            cursor.docIdx = loStart.docIdx;
            cursor.charIndex = loStart.charIndex;
            cursor.charOffset = 0;
            return;
          }

          // 2) Backspace
          if (e.inputType === 'deleteContentBackward') {
            if (cursor.charIndex <= 0) {
              if (cursor.docIdx <= 0 || cursor.isInsideTable) return;
              const prev = cachedParagraphInfo(cursor.docIdx - 1);
              const cur = cachedParagraphInfo(cursor.docIdx);
              if (!prev.isParagraph && cur.length > 0) return;
              await refreshParaBreaks(worker, cursor.docIdx);
              clearPendingSelection();
              markEditPending();
              clearCellSelection(container);
              worker.postMessage({ type: 'EDIT_DELETE', payload: { paragraphIndex: cursor.docIdx, charIndex: 0 } });
              cursor.docIdx -= 1;
              cursor.charIndex = prev.isParagraph ? prev.length : 0;
              cursor.charOffset = 0;
              return;
            }
            await refreshParaBreaks(worker, cursor.docIdx);
            clearPendingSelection();
            markEditPending();
            worker.postMessage({ type: 'EDIT_DELETE', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
            cursor.charIndex = Math.max(0, cursor.charIndex - 1);
            return;
          }

          // 3) Forward delete
          if (cursor.isInsideTable) return;
          const cur = cachedParagraphInfo(cursor.docIdx);
          if (cur.isParagraph && cur.length === 0) {
            const next = cachedParagraphInfo(cursor.docIdx + 1);
            const nextIsTable = next.exists && !next.isParagraph;
            if (nextIsTable || !next.exists) {
              const prev = cachedParagraphInfo(cursor.docIdx - 1);
              await refreshParaBreaks(worker, cursor.docIdx);
              clearPendingSelection();
              markEditPending();
              clearCellSelection(container);
              worker.postMessage({ type: 'EDIT_DELETE_FWD', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
              if (prev.isParagraph) {
                cursor.docIdx -= 1;
                cursor.charIndex = prev.length;
                cursor.charOffset = 0;
              }
              return;
            }
          }
          await refreshParaBreaks(worker, cursor.docIdx);
          clearPendingSelection();
          markEditPending();
          if (cursor.charIndex >= cur.length && cachedParagraphInfo(cursor.docIdx + 1).isParagraph) {
            clearCellSelection(container);
          }
          worker.postMessage({ type: 'EDIT_DELETE_FWD', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
        });
      });
      return;
    }

    if (e.inputType === 'insertParagraph') {
      e.preventDefault();
      clearInsertFlushTimer();
      void flushPendingInsert(worker).then(() => {
        // After flushing optimistic inserts, cursor state is authoritative (DOM may not have rendered yet).
        void enqueueEdit(async () => {
          clearCellSelection(container);
          await refreshParaBreaks(worker, cursor.docIdx);
          clearPendingSelection();
          markEditPending();
          worker.postMessage({ type: 'EDIT_SPLIT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
          cursor.docIdx += 1;
          cursor.charIndex = 0;
          cursor.charOffset = 0;
        });
      });
      return;
    }

    if (e.data != null && e.data !== '') {
      e.preventDefault();
      // Prevent selectionchange/saveCursorPosition from reading stale DOM and clobbering optimistic cursor.
      markEditPending();
      const text = e.data;
      // If paragraph/context changed, flush previous batch first.
      if (pendingInsert && (pendingInsert.docIdx !== cursor.docIdx || cursor.isInsideTable)) {
        clearInsertFlushTimer();
        void flushPendingInsert(worker);
      }
      if (!pendingInsert) {
        pendingInsert = { docIdx: cursor.docIdx, charIndex: cursor.charIndex, text: '' };
      }
      // Optimistic local cursor advance for immediate caret progression; batch sent to worker.
      pendingInsert.text += text;
      cursor.charIndex += text.length;
      scheduleInsertFlush(worker);
      return;
    }
  });
}
