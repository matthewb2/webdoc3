import type { CursorState } from './types';
import { findCursorPageIndices, updateVisiblePages } from './renderHtml';
import { takePendingSelection } from './initUI';

export function createCursorState(): CursorState {
  return {
    docIdx: 0,
    charIndex: 0,
    charOffset: 0,
    isInsideTable: false,
    rowIndex: 0,
    cellIndex: 0,
    pageNumber: 0,
  };
}

export function saveCursorPosition(containerEl: HTMLDivElement, savedCursor: CursorState) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.log('[shape-space-debug][save] no selection/range', { hasSelection: !!selection, rangeCount: selection?.rangeCount ?? 0 });
    return;
  }

  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer;
  const startEl = startContainer.nodeType === Node.TEXT_NODE
    ? startContainer.parentElement
    : (startContainer as Element);

  let currentParagraph = startEl?.closest('p') as HTMLParagraphElement | null;
  const currentCell = startEl?.closest('td') as HTMLTableCellElement | null;
  const shapeElAtStart = startEl?.closest('.doc-shape') as HTMLElement | null;

  let adjustedToParagraph: 'prev' | 'next' | null = null;
  if (!currentCell && !currentParagraph) {
    const shapeEl = shapeElAtStart;
    if (shapeEl) {
      const prev = shapeEl.previousElementSibling as HTMLElement | null;
      const next = shapeEl.nextElementSibling as HTMLElement | null;
      const prevP = (prev?.closest?.('p') || prev?.querySelector?.('p') || null) as HTMLParagraphElement | null;
      const nextP = (next?.closest?.('p') || next?.querySelector?.('p') || null) as HTMLParagraphElement | null;
      if (prevP && prevP.dataset.pIdx) { currentParagraph = prevP; adjustedToParagraph = 'prev'; }
      else if (nextP && nextP.dataset.pIdx) { currentParagraph = nextP; adjustedToParagraph = 'next'; }
    }
  }

  let resolved: 'cell' | 'paragraph' | 'none' = 'none';
  if (currentCell) {
    resolved = 'cell';
    const currentTR = currentCell.closest('tr');
    const currentTable = currentCell.closest('table');
    const currentPage = currentCell.closest('.page');

    if (currentTR && currentTable && currentPage) {
      savedCursor.isInsideTable = true;
      savedCursor.charIndex = range.startOffset;
      savedCursor.charOffset = 0;
      savedCursor.rowIndex = Array.from(currentTable.querySelectorAll('tr')).indexOf(currentTR);
      savedCursor.cellIndex = Array.from(currentTR.querySelectorAll('td')).indexOf(currentCell);
      savedCursor.docIdx = parseInt((currentTable as HTMLElement).dataset.pIdx || '0', 10);
    } else {
      console.log('[shape-space-debug][save] cell context incomplete', { hasTR: !!currentTR, hasTable: !!currentTable, hasPage: !!currentPage });
    }
  } else if (currentParagraph && currentParagraph.dataset.pIdx) {
    resolved = 'paragraph';
    savedCursor.isInsideTable = false;
    savedCursor.docIdx = parseInt(currentParagraph.dataset.pIdx, 10);
    savedCursor.charOffset = parseInt(currentParagraph.dataset.pOffset || '0', 10);
    if (adjustedToParagraph) {
      const raw = (currentParagraph.textContent || '').replace(/\u200B/g, '');
      savedCursor.charIndex = savedCursor.charOffset + (adjustedToParagraph === 'prev' ? raw.length : 0);
    } else {
      const pre = document.createRange();
      pre.selectNodeContents(currentParagraph);
      try {
        pre.setEnd(startContainer, range.startOffset);
      } catch (err) {
        savedCursor.charIndex = savedCursor.charOffset;
        console.log('[shape-space-debug][save] setEnd failed, fallback to charOffset', { err: String(err), docIdx: savedCursor.docIdx, charIndex: savedCursor.charIndex });
        return;
      }
      const raw = pre.toString();
      let zwsp = 0;
      for (const ch of raw) if (ch === '\u200B') zwsp++;
      savedCursor.charIndex = (raw.length - zwsp) + savedCursor.charOffset;
    }
  } else {
    console.log('[shape-space-debug][save] unresolved target (keeping stale cursor)', {
      stale: { ...savedCursor },
      startContainerType: startContainer.nodeType,
      startElTag: (startEl as HTMLElement | null)?.tagName,
      inShape: !!shapeElAtStart,
    });
  }

  const currentPage = startEl?.closest('.page') as HTMLElement | null;
  if (currentPage?.dataset.pageNumber) {
    savedCursor.pageNumber = parseInt(currentPage.dataset.pageNumber, 10);
  }
  void containerEl;
  console.log('[shape-space-debug][save]', {
    resolved,
    adjustedToParagraph,
    docIdx: savedCursor.docIdx,
    charIndex: savedCursor.charIndex,
    charOffset: savedCursor.charOffset,
    isInsideTable: savedCursor.isInsideTable,
    pageNumber: savedCursor.pageNumber,
    rangeStartOffset: range.startOffset,
    startInShape: !!shapeElAtStart,
    paragraphPIdx: currentParagraph?.dataset?.pIdx ?? null,
  });
}

export function restoreCursorPosition(containerEl: HTMLDivElement, savedCursor: CursorState) {
  const selection = window.getSelection();
  if (!selection) return;

  const pending = takePendingSelection();
  const mountPages = pending
    ? [...findCursorPageIndices(pending.anchor.docIdx), ...findCursorPageIndices(pending.focus.docIdx)]
    : findCursorPageIndices(savedCursor.docIdx);
  if (mountPages.length > 0) updateVisiblePages(mountPages);

  let targetTextNode: Node | null = null;
  let targetOffset = 0;

  const rawOffsetForModelIndex = (text: string, modelIndex: number): number => {
    let seen = 0;
    for (let i = 0; i < text.length; i++) {
      if (seen === modelIndex) return i;
      if (text.charCodeAt(i) !== 0x200b) seen++;
    }
    return text.length;
  };

  const placeInElement = (root: Element, modelIndex: number) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let tn = walker.nextNode();
    let remaining = Math.max(0, modelIndex);
    let lastText: Node | null = null;
    let lastLen = 0;
    while (tn) {
      const t = tn.textContent || '';
      let zw = 0;
      for (let i = 0; i < t.length; i++) if (t.charCodeAt(i) === 0x200b) zw++;
      const modelLen = t.length - zw;
      lastText = tn;
      lastLen = t.length;
      if (remaining <= modelLen) {
        targetTextNode = tn;
        targetOffset = rawOffsetForModelIndex(t, remaining);
        return;
      }
      remaining -= modelLen;
      tn = walker.nextNode();
    }
    if (lastText) {
      targetTextNode = lastText;
      targetOffset = lastLen;
    }
  };

  const locateInElement = (root: Element, modelIndex: number): { node: Node; offset: number } | null => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let tn = walker.nextNode();
    let remaining = Math.max(0, modelIndex);
    let lastText: Node | null = null;
    let lastLen = 0;
    while (tn) {
      const t = tn.textContent || '';
      let zw = 0;
      for (let i = 0; i < t.length; i++) if (t.charCodeAt(i) === 0x200b) zw++;
      const modelLen = t.length - zw;
      lastText = tn;
      lastLen = t.length;
      if (remaining <= modelLen) {
        return { node: tn, offset: rawOffsetForModelIndex(t, remaining) };
      }
      remaining -= modelLen;
      tn = walker.nextNode();
    }
    if (lastText) return { node: lastText, offset: lastLen };
    return null;
  };

  const locateModelOffset = (docIdx: number, charIndex: number): { node: Node; offset: number } | null => {
    const matches = Array.from(containerEl.querySelectorAll(`p[data-p-idx="${docIdx}"]`) as NodeListOf<HTMLParagraphElement>);
    let targetParagraph: HTMLParagraphElement | null = null;
    for (const m of matches) {
      const off = parseInt(m.dataset.pOffset || '0', 10);
      const len = m.textContent?.length || 0;
      if (charIndex >= off) targetParagraph = m;
      if (charIndex <= off + len) break;
    }
    targetParagraph = targetParagraph || matches[0] || null;
    if (!targetParagraph) return null;
    const fragOffset = parseInt(targetParagraph.dataset.pOffset || '0', 10);
    return locateInElement(targetParagraph, charIndex - fragOffset);
  };

  if (
    pending &&
    (pending.anchor.docIdx !== pending.focus.docIdx || pending.anchor.charIndex !== pending.focus.charIndex)
  ) {
    const a = locateModelOffset(pending.anchor.docIdx, pending.anchor.charIndex);
    const f = locateModelOffset(pending.focus.docIdx, pending.focus.charIndex);
    if (a && f) {
      try {
        selection.setBaseAndExtent(a.node, a.offset, f.node, f.offset);
      } catch {
        /* 복원 실패 시 기존 경로 */
      }
      if (selection.rangeCount > 0) return;
    }
  }

  if (savedCursor.isInsideTable) {
    const pageEl = savedCursor.pageNumber > 0
      ? containerEl.querySelector(`.page[data-page-number="${savedCursor.pageNumber}"]`)
      : null;
    const scope = (pageEl || containerEl) as HTMLElement;
    const targetTable = scope.querySelector(`table[data-p-idx="${savedCursor.docIdx}"]`) as HTMLTableElement | null;
    if (targetTable) {
      const rows = targetTable.querySelectorAll('tr');
      const targetRow = rows[savedCursor.rowIndex];
      if (targetRow) {
        const cells = targetRow.querySelectorAll('td');
        const targetCell = cells[savedCursor.cellIndex];
        if (targetCell) {
          const span = targetCell.querySelector('span');
          targetTextNode = span?.firstChild || null;
          targetOffset = Math.min(savedCursor.charIndex, span?.textContent?.length || 0);
        }
      }
    }
  } else {
    const matches = Array.from(containerEl.querySelectorAll(`p[data-p-idx="${savedCursor.docIdx}"]`) as NodeListOf<HTMLParagraphElement>);
    let targetParagraph: HTMLParagraphElement | null = null;
    for (const m of matches) {
      const off = parseInt(m.dataset.pOffset || '0', 10);
      const len = m.textContent?.length || 0;
      if (savedCursor.charIndex >= off) targetParagraph = m;
      if (savedCursor.charIndex <= off + len) break;
    }
    targetParagraph = targetParagraph || matches[0] || null;
    console.log(`[restore] docIdx=${savedCursor.docIdx} charIndex=${savedCursor.charIndex} matches=${matches.length} target=${targetParagraph ? (targetParagraph.dataset.pIdx + ':' + targetParagraph.dataset.pOffset) : 'null'}`);
    if (targetParagraph) {
      const fragOffset = parseInt((targetParagraph as HTMLElement).dataset.pOffset || '0', 10);
      placeInElement(targetParagraph as HTMLElement, savedCursor.charIndex - fragOffset);
    }
  }

  if (targetTextNode && targetTextNode.nodeType === Node.TEXT_NODE) {
    if (
      selection.rangeCount > 0 &&
      selection.isCollapsed &&
      selection.anchorNode === targetTextNode &&
      selection.anchorOffset === targetOffset
    ) {
      return;
    }
    const range = document.createRange();
    try {
      range.setStart(targetTextNode, targetOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      console.warn("cursor restore failed");
    }
  }
}
