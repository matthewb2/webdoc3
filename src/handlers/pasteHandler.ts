import type { CursorState } from '../types';
import { isImeLocked } from './composition';
import { deleteSelectionForEdit, markEditPending, refreshParaBreaks, clearPendingSelection, snapshotSelection } from './inputCommon';

export function initPasteHandler(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  saveCursorPosition: () => void,
) {
  function syncCursorFromSelection() {
    saveCursorPosition();
  }

  container.addEventListener('paste', (e: ClipboardEvent) => {
    if (isImeLocked()) return;
    const targetEl = e.target instanceof Element ? e.target : (e.target as Node | null)?.parentElement;
    const anchorElement = (() => {
      const sel = window.getSelection();
      const n = sel?.anchorNode ?? null;
      return n ? (n.nodeType === Node.TEXT_NODE ? n.parentElement : (n as HTMLElement)) : null;
    })();
    const inTable = !!anchorElement?.closest('td, th') || !!targetEl?.closest?.('td, th');
    if (inTable) return;

    const text = e.clipboardData?.getData('text/plain') ?? e.clipboardData?.getData('text') ?? '';
    e.preventDefault();
    if (text === '') return;

    syncCursorFromSelection();
    const snap = snapshotSelection(container);
    deleteSelectionForEdit(container, worker, cursor, snap);

    const normalized = text.replace(/\r\n?/g, '\n');
    const parts = normalized.split('\n');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.length > 0) {
        refreshParaBreaks(worker, cursor.docIdx);
        worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex, text: part } });
        cursor.charIndex += part.length;
      }
      if (i < parts.length - 1) {
        refreshParaBreaks(worker, cursor.docIdx);
        worker.postMessage({ type: 'EDIT_SPLIT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
        cursor.docIdx += 1;
        cursor.charIndex = 0;
        cursor.charOffset = 0;
      }
    }
    clearPendingSelection();
    markEditPending();
  });
}
