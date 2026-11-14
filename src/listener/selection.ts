// src/listener/selection.ts - text selection snapshots, pending selection, and selection listeners
import { getCachedPages } from '../render';

export interface SelEnd {
  docIdx: number;
  charIndex: number;
}

export interface SelSnapshot {
  anchor: SelEnd;
  focus: SelEnd;
}

function modelTextLen(t: string): number {
  let n = 0;
  for (const ch of t) if (ch !== '\u200B') n++;
  return n;
}

function paraIndexOfNode(container: HTMLDivElement, node: Node): number | null {
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const p = el?.closest?.('p');
  if (!p || !container.contains(p)) return null;
  const idx = parseInt((p as HTMLElement).dataset.pIdx || '', 10);
  return isNaN(idx) ? null : idx;
}

function modelOffsetInPara(container: HTMLDivElement, docIdx: number, node: Node, offset: number): number | null {
  const paras = Array.from(container.querySelectorAll(`p[data-p-idx="${docIdx}"]`));
  let acc = 0;
  for (const p of paras) {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    let tn = walker.nextNode();
    while (tn) {
      const t = tn.textContent || '';
      if (tn === node) {
        return acc + modelTextLen(t.slice(0, Math.min(offset, t.length)));
      }
      acc += modelTextLen(t);
      tn = walker.nextNode();
    }
  }
  return null;
}

function paragraphLength(docIdx: number): number {
  let length = 0;
  getCachedPages().forEach((page) => {
    page.forEach((item: any) => {
      if (item && item._docIdx === docIdx && item.type === 'paragraph') {
        (item.children || []).forEach((run: any) => {
          length += (run.text || '').length;
        });
      }
    });
  });
  return length;
}

export function snapshotSelection(container: HTMLDivElement): SelSnapshot | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const aIdx = paraIndexOfNode(container, range.startContainer);
  const fIdx = paraIndexOfNode(container, range.endContainer);
  if (aIdx === null || fIdx === null) return null;
  const a = modelOffsetInPara(container, aIdx, range.startContainer, range.startOffset);
  const f = modelOffsetInPara(container, fIdx, range.endContainer, range.endOffset);
  if (a === null || f === null) return null;
  return { anchor: { docIdx: aIdx, charIndex: a }, focus: { docIdx: fIdx, charIndex: f } };
}

let pendingSel: SelSnapshot | null = null;

export function stashSelection(container: HTMLDivElement): void {
  pendingSel = snapshotSelection(container);
}

export function peekPendingSelection(): SelSnapshot | null {
  return pendingSel;
}

export function takePendingSelection(): SelSnapshot | null {
  const s = pendingSel;
  pendingSel = null;
  return s;
}

export function clearPendingSelection(): void {
  pendingSel = null;
}

export function selectionRangeInParagraph(
  container: HTMLDivElement,
  docIdx: number,
  snapshot: SelSnapshot | null = null,
): { from: number; to: number } | null {
  if (snapshot) {
    const aFirst =
      snapshot.anchor.docIdx < snapshot.focus.docIdx ||
      (snapshot.anchor.docIdx === snapshot.focus.docIdx &&
        snapshot.anchor.charIndex <= snapshot.focus.charIndex);
    const start = aFirst ? snapshot.anchor : snapshot.focus;
    const end = aFirst ? snapshot.focus : snapshot.anchor;
    if (docIdx < start.docIdx || docIdx > end.docIdx) return null;
    const len = paragraphLength(docIdx);
    const from = docIdx === start.docIdx ? start.charIndex : 0;
    const to = docIdx === end.docIdx ? end.charIndex : len;
    return to > from ? { from, to } : null;
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const paras = Array.from(container.querySelectorAll(`p[data-p-idx="${docIdx}"]`));
  if (paras.length === 0) return null;
  let from = -1;
  let to = -1;
  let acc = 0;
  let found = false;
  paras.forEach((p) => {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    let tn = walker.nextNode();
    while (tn) {
      const t = tn.textContent || '';
      if (range.intersectsNode(tn)) {
        let startInNode = 0;
        let endInNode = t.length;
        if (tn === range.startContainer) startInNode = Math.min(range.startOffset, t.length);
        if (tn === range.endContainer) endInNode = Math.min(range.endOffset, t.length);
        if (!found) {
          from = acc + modelTextLen(t.slice(0, startInNode));
          found = true;
        }
        to = acc + modelTextLen(t.slice(0, endInNode));
      }
      acc += modelTextLen(t);
      tn = walker.nextNode();
    }
  });
  if (!found || to <= from) return null;
  return { from, to };
}

export function selectedParagraphIndices(
  container: HTMLDivElement,
  cursorDocIdx: number,
  snapshot: SelSnapshot | null = null,
): number[] {
  if (snapshot) {
    const lo = Math.min(snapshot.anchor.docIdx, snapshot.focus.docIdx);
    const hi = Math.max(snapshot.anchor.docIdx, snapshot.focus.docIdx);
    const out: number[] = [];
    for (let i = lo; i <= hi; i++) out.push(i);
    return out;
  }
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const found: number[] = [];
    container.querySelectorAll('p[data-p-idx]').forEach((p) => {
      try {
        if (range.intersectsNode(p)) {
          const idx = parseInt((p as HTMLElement).dataset.pIdx || '', 10);
          if (!isNaN(idx) && !found.includes(idx)) found.push(idx);
        }
      } catch { /* ignore */ }
    });
    if (found.length > 0) return found;
  }
  return [cursorDocIdx];
}

// In-flight layout/render guard for selectionchange: ignore DOM noise during async render.
let awaitingRender = false;

export function setAwaitingRender(v: boolean) {
  awaitingRender = v;
}

export function initSelectionListener(onSelectionChange: () => void) {
  document.addEventListener('selectionchange', () => {
    if (awaitingRender) return;
    if (document.activeElement?.closest('#editor-container')) {
      onSelectionChange();
    }
  });
}
