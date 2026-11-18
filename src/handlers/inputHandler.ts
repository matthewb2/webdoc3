import type { CursorState } from '../types';
import { isImeLocked, endGracePeriod } from './composition';
import {
  cachedParagraphInfo,
  clearCellSelection,
  clearPendingSelection,
  deleteSelectionForEdit,
  markEditPending,
  refreshParaBreaks,
  snapshotSelection,
} from './inputCommon';

export function initInputHandler(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  saveCursorPosition: () => void,
) {
  function syncCursorFromSelection() {
    saveCursorPosition();
  }

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

    if (isInsideTableElement) return;

    if (isImeLocked() || !!(globalThis as any).document?.isComposing) {
      return;
    }

    if ((e.data != null && e.data !== '' || e.inputType.startsWith('delete') || e.inputType === 'insertParagraph')) {
      endGracePeriod();
    }

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
      syncCursorFromSelection();

      if (hasRangeSelection && snap) {
        deleteSelectionForEdit(container, worker, cursor, snap);
        return;
      }

      if (e.inputType === 'deleteContentBackward') {
        if (cursor.charIndex <= 0) {
          if (cursor.docIdx <= 0 || cursor.isInsideTable) return;
          const prev = cachedParagraphInfo(cursor.docIdx - 1);
          const cur = cachedParagraphInfo(cursor.docIdx);
          if (!prev.isParagraph && cur.length > 0) return;
          refreshParaBreaks(worker, cursor.docIdx);
          clearPendingSelection();
          markEditPending();
          clearCellSelection(container);
          worker.postMessage({ type: 'EDIT_DELETE', payload: { paragraphIndex: cursor.docIdx, charIndex: 0 } });
          cursor.docIdx -= 1;
          cursor.charIndex = prev.isParagraph ? prev.length : 0;
          cursor.charOffset = 0;
          return;
        }
        refreshParaBreaks(worker, cursor.docIdx);
        clearPendingSelection();
        markEditPending();
        worker.postMessage({ type: 'EDIT_DELETE', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
        cursor.charIndex = Math.max(0, cursor.charIndex - 1);
        return;
      }

      if (cursor.isInsideTable) return;
      const cur = cachedParagraphInfo(cursor.docIdx);
      if (cur.isParagraph && cur.length === 0) {
        const next = cachedParagraphInfo(cursor.docIdx + 1);
        const nextIsTable = next.exists && !next.isParagraph;
        if (nextIsTable || !next.exists) {
          const prev = cachedParagraphInfo(cursor.docIdx - 1);
          refreshParaBreaks(worker, cursor.docIdx);
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
      refreshParaBreaks(worker, cursor.docIdx);
      clearPendingSelection();
      markEditPending();
      if (cursor.charIndex >= cur.length && cachedParagraphInfo(cursor.docIdx + 1).isParagraph) {
        clearCellSelection(container);
      }
      worker.postMessage({ type: 'EDIT_DELETE_FWD', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
      return;
    }

    if (e.inputType === 'insertParagraph') {
      e.preventDefault();
      clearCellSelection(container);
      clearPendingSelection();
      markEditPending();
      worker.postMessage({ type: 'EDIT_SPLIT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
      cursor.docIdx += 1;
      cursor.charIndex = 0;
      cursor.charOffset = 0;
      return;
    }

    if (e.data != null && e.data !== '') {
      e.preventDefault();
      const text = e.data;
      worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex, text } });
      cursor.charIndex += text.length;
      clearPendingSelection();
      markEditPending();
      return;
    }
  });
}
