// handlers/composition.ts - IME composition state and handlers
import type { CursorState } from '../types';
import { clearPendingSelection } from '../selection';
import { markEditPending } from './inputCommon';

let composing = false;
let postCompositionGrace = false;
let graceRaf = 0;
let compAnchor: { docIdx: number; charIndex: number; charOffset: number; domStartInPara: number } | null = null;
let onCompositionEndCb: (() => void) | null = null;

export function isActivelyComposing() {
  return composing || !!(globalThis as any).document?.isComposing;
}

export function isInPostCompositionGrace() {
  return postCompositionGrace && !isActivelyComposing();
}

export function isImeLocked() {
  return isActivelyComposing() || postCompositionGrace;
}

export function hasPendingInputState() {
  return isImeLocked();
}

export function isComposingActive() {
  return isImeLocked();
}

export function endGracePeriod() {
  if (graceRaf) {
    window.cancelAnimationFrame(graceRaf);
    graceRaf = 0;
  }
  if (composing || !!(globalThis as any).document?.isComposing) return;
  if (!postCompositionGrace) return;
  postCompositionGrace = false;
  onCompositionEndCb?.();
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

export function initCompositionHandler(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  onCompositionEnd: () => void,
) {
  onCompositionEndCb = onCompositionEnd;

  container.addEventListener('compositionstart', () => {
    if (container.querySelector('td:focus, th:focus')) return;
    if (graceRaf) {
      window.cancelAnimationFrame(graceRaf);
      graceRaf = 0;
    }
    postCompositionGrace = false;
    composing = true;

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
      postCompositionGrace = true;
      if (graceRaf) window.cancelAnimationFrame(graceRaf);
      graceRaf = window.requestAnimationFrame(() => { graceRaf = 0; postCompositionGrace = false; onCompositionEnd(); });
      return;
    }

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

    postCompositionGrace = true;
    if (graceRaf) window.cancelAnimationFrame(graceRaf);
    graceRaf = window.requestAnimationFrame(() => {
      graceRaf = 0;
      if (composing || !!(globalThis as any).document?.isComposing) return;
      postCompositionGrace = false;
      onCompositionEnd();
    });
  });
}
