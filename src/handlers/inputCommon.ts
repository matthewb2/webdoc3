import type { CursorState, TextRun } from '../types';
import { breakKeyForRuns, computeBreaks } from '../probe';
import { getCachedPages } from '../renderHtml';
import { cachedParagraphInfo } from '../initUI';
import { clearPendingSelection, setAwaitingRender, snapshotSelection, selectedParagraphIndices, selectionRangeInParagraph } from '../selection';
import { clearCellSelection } from './tableSelection';

export function markEditPending() {
  setAwaitingRender(true);
}

export function refreshParaBreaks(worker: Worker, docIdx: number) {
  const frags: Array<any> = [];
  getCachedPages().forEach((page) => page.forEach((item: any) => {
    if (item.type === 'paragraph' && item._docIdx === docIdx) frags.push(item);
  }));
  if (frags.length === 0) return;
  frags.sort((a, b) => (a._charOffset ?? 0) - (b._charOffset ?? 0));
  if (frags.some((f) => f.align)) return;
  const runs: TextRun[] = frags.flatMap((f) => f.children || []);
  if (!runs.some((r) => r.text)) return;
  void computeBreaks([{ key: breakKeyForRuns(runs, 600), runs, width: 600 }]).then((payload) => {
    worker.postMessage({ type: 'BREAKS', payload });
  });
}

export function deleteSelectionForEdit(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  snap: ReturnType<typeof snapshotSelection>,
): boolean {
  if (!snap) return false;
  const hasRange = snap.anchor.docIdx !== snap.focus.docIdx || snap.anchor.charIndex !== snap.focus.charIndex;
  if (!hasRange) return false;
  const paraIndices = selectedParagraphIndices(container, cursor.docIdx, snap);
  for (const docIdx of paraIndices) {
    const r = selectionRangeInParagraph(container, docIdx, snap);
    if (r) {
      refreshParaBreaks(worker, docIdx);
      worker.postMessage({
        type: 'EDIT_DELETE_RANGE',
        payload: { paragraphIndex: docIdx, fromCharIndex: r.from, endCharIndex: r.to },
      });
    }
  }
  const loStart = (snap.anchor.docIdx < snap.focus.docIdx ||
    (snap.anchor.docIdx === snap.focus.docIdx && snap.anchor.charIndex <= snap.focus.charIndex))
    ? snap.anchor : snap.focus;
  cursor.docIdx = loStart.docIdx;
  cursor.charIndex = loStart.charIndex;
  cursor.charOffset = 0;
  clearPendingSelection();
  markEditPending();
  clearCellSelection(container);
  return true;
}

export { cachedParagraphInfo, snapshotSelection, selectedParagraphIndices, selectionRangeInParagraph, clearPendingSelection, clearCellSelection };
