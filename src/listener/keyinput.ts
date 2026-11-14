// src/listener/keyinput.ts - sync model/cursor updates, async layout/render (engine rAF), Korean IME
// Implements: Composition Lock, DOM-first commit on compositionend, 1-frame post-composition grace period.
import type { CursorState, TextRun } from '../types';
import { breakKeyForRuns, computeBreaks } from '../probe';
import { getCachedPages } from '../render';
import { cachedParagraphInfo } from './listener';
import { clearPendingSelection, setAwaitingRender, snapshotSelection, selectedParagraphIndices, selectionRangeInParagraph } from './selection';
import { clearCellSelection, selectCellFromInputMode, extendCellSelection } from './table';

// Recompute paragraph breaks from cached fragments before structural/model edits that depend on break state.
function refreshParaBreaks(worker: Worker, docIdx: number) {
  const frags: Array<any> = [];
  getCachedPages().forEach((page) => page.forEach((item: any) => {
    if (item.type === 'paragraph' && item._docIdx === docIdx) frags.push(item);
  }));
  if (frags.length === 0) return;
  frags.sort((a, b) => (a._charOffset ?? 0) - (b._charOffset ?? 0));
  if (frags.some((f) => f.align)) return;
  const runs: TextRun[] = frags.flatMap((f) => f.children || []);
  if (!runs.some((r) => r.text)) return;
  // Fire-and-forget; breaks message updates engine state synchronously when processed.
  void computeBreaks([{ key: breakKeyForRuns(runs, 600), runs, width: 600 }]).then((payload) => {
    worker.postMessage({ type: 'BREAKS', payload });
  });
}

let composing = false;
let postCompositionGrace = false;
let graceRaf = 0;
let compAnchor: { docIdx: number; charIndex: number; charOffset: number; domStartInPara: number } | null = null;
let onCompositionEndCb: (() => void) | null = null;

function isImeLocked() {
  return composing || !!(globalThis as any).document?.isComposing || postCompositionGrace;
}

export function hasPendingInputState() {
  // Composition Lock: block render DOM rebuild and cursor clobbering during composition + grace period.
  return isImeLocked();
}

export function isComposingActive() {
  return isImeLocked();
}

function markEditPending() {
  setAwaitingRender(true);
}

function getParagraphByDocIdx(container: HTMLDivElement, docIdx: number): HTMLParagraphElement | null {
  const matches = Array.from(container.querySelectorAll(`p[data-p-idx="${docIdx}"]`)) as HTMLParagraphElement[];
  if (matches.length === 0) return null;
  return matches[matches.length - 1] || matches[0] || null;
}

function getDomTextOffsetInParagraph(p: HTMLParagraphElement, node: Node, offset: number): number | null {
  try {
    if (!p.contains(node) && node !== p) return null;
    const pre = document.createRange();
    pre.selectNodeContents(p);
    pre.setEnd(node, offset);
    const raw = pre.toString();
    let zw = 0;
    for (let i = 0; i < raw.length; i++) if (raw.charCodeAt(i) === 0x200b) zw++;
    return raw.length - zw;
  } catch {
    return null;
  }
}

function getSelectionDomOffsetInPara(container: HTMLDivElement, docIdx: number): number | null {
  const p = getParagraphByDocIdx(container, docIdx);
  if (!p) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  const endNode = range.endContainer;
  const endEl = endNode.nodeType === Node.TEXT_NODE ? (endNode as Text).parentElement : (endNode as Element | null);
  if (!endEl || !p.contains(endEl)) return null;
  return getDomTextOffsetInParagraph(p, range.endContainer, range.endOffset);
}

function readParaPlainText(container: HTMLDivElement, docIdx: number): string | null {
  const p = getParagraphByDocIdx(container, docIdx);
  if (!p) return null;
  return (p.textContent || '').replace(/\u200B/g, '');
}

function endGracePeriod() {
  if (graceRaf) {
    window.cancelAnimationFrame(graceRaf);
    graceRaf = 0;
  }
  if (composing || !!(globalThis as any).document?.isComposing) return;
  if (!postCompositionGrace) return;
  postCompositionGrace = false;
  onCompositionEndCb?.();
}

export function initEditorListeners(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  saveCursorPosition: () => void,
  _onCompositionEnd: () => void,
  _onCompositionEditPosted: () => void,
) {
  onCompositionEndCb = _onCompositionEnd;
  void _onCompositionEditPosted;

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

  function syncCursorFromSelection() {
    saveCursorPosition();
  }

  container.addEventListener('compositionstart', () => {
    if (container.querySelector('td:focus, th:focus')) return;
    // Composition Lock: do not let external render/rebuild interfere with browser IME DOM.
    if (graceRaf) {
      window.cancelAnimationFrame(graceRaf);
      graceRaf = 0;
    }
    postCompositionGrace = false;
    composing = true;

    // Anchor at current model cursor (start of composition in model coordinates).
    const domStartInPara = getSelectionDomOffsetInPara(container, cursor.docIdx);
    compAnchor = {
      docIdx: cursor.docIdx,
      charIndex: cursor.charIndex,
      charOffset: cursor.charOffset,
      domStartInPara: domStartInPara ?? 0,
    };
  });

  container.addEventListener('compositionend', (e: CompositionEvent) => {
    const anchor = compAnchor;
    compAnchor = null;
    composing = false;

    if (!anchor) {
      // Still honor grace period semantics if needed.
      postCompositionGrace = true;
      if (graceRaf) window.cancelAnimationFrame(graceRaf);
      graceRaf = window.requestAnimationFrame(() => { graceRaf = 0; postCompositionGrace = false; _onCompositionEnd(); });
      return;
    }

    // DOM-first commit: read actual committed text from live DOM (includes spaces inserted by browser).
    let committed = '';
    const domEndInPara = getSelectionDomOffsetInPara(container, anchor.docIdx);
    const paraText = readParaPlainText(container, anchor.docIdx);
    if (paraText != null && domEndInPara != null) {
      const from = Math.max(0, Math.min(anchor.domStartInPara, paraText.length));
      const to = Math.max(from, Math.min(domEndInPara, paraText.length));
      committed = paraText.slice(from, to);
    }
    if (!committed && e.data) committed = e.data;

    let didEdit = false;
    if (committed.length > 0) {
      // Sync model immediately with DOM-committed text.
      worker.postMessage({
        type: 'EDIT_INSERT',
        payload: { paragraphIndex: anchor.docIdx, charIndex: anchor.charIndex, text: committed },
      });
      cursor.docIdx = anchor.docIdx;
      cursor.charIndex = anchor.charIndex + committed.length;
      cursor.charOffset = anchor.charOffset;
      didEdit = true;
    } else {
      cursor.docIdx = anchor.docIdx;
      cursor.charIndex = anchor.charIndex;
      cursor.charOffset = anchor.charOffset;
    }

    if (didEdit) {
      clearPendingSelection();
      markEditPending();
    }

    // Post-composition grace period (1 frame): keep browser's committed DOM/paint, defer heavy re-render/reflow.
    postCompositionGrace = true;
    if (graceRaf) window.cancelAnimationFrame(graceRaf);
    graceRaf = window.requestAnimationFrame(() => {
      graceRaf = 0;
      if (composing || !!(globalThis as any).document?.isComposing) return; // new composition started
      postCompositionGrace = false;
      _onCompositionEnd(); // flush deferred render/layout application
    });
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (isImeLocked() && e.key !== 'F5' && e.key !== 'Tab') {
      // During IME composition/grace, do not interfere with browser/IME behavior.
      return;
    }
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

    // Composition Lock / DOM-first: let browser+IME own DOM during composition.
    if (composing || !!(globalThis as any).document?.isComposing) {
      // Do not preventDefault or mutate model during composition.
      // compositionend will perform DOM-first commit into model.
      return;
    }

    // If in post-composition grace period, end grace before handling non-IME edits.
    if (postCompositionGrace && (e.data != null && e.data !== '' || e.inputType.startsWith('delete') || e.inputType === 'insertParagraph')) {
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

      // 1) Range delete
      if (hasRangeSelection && snap) {
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

      // 3) Forward delete
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
      // Use current cursor state to avoid stale DOM reads during rapid Enter.
      clearCellSelection(container);
      clearPendingSelection();
      markEditPending();
      // Synchronous model update; layout/render scheduled asynchronously by engine (rAF).
      worker.postMessage({ type: 'EDIT_SPLIT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
      cursor.docIdx += 1;
      cursor.charIndex = 0;
      cursor.charOffset = 0;
      return;
    }

    if (e.data != null && e.data !== '') {
      e.preventDefault();
      const text = e.data;
      // Synchronous model update (engine processes message immediately) + immediate cursor advance.
      worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex, text } });
      cursor.charIndex += text.length;
      clearPendingSelection();
      markEditPending();
      return;
    }
  });
}
