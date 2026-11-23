import { isImeLocked } from './composition';
import { extendCellSelection, selectCellFromInputMode } from './tableSelection';

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

export function initKeyHandler(container: HTMLDivElement) {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (isImeLocked() && e.key !== 'F5' && e.key !== 'Tab') {
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

    // 페이지 경계 넘김: contenteditable 페이지가 분리되어 있어 브라우저 기본 동작으로는 넘어가지 않음
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        return;
      }
      const range = sel.getRangeAt(0);
      const anchorEl = range.startContainer.nodeType === Node.TEXT_NODE
        ? (range.startContainer as Text).parentElement
        : (range.startContainer as Element);
      const page = anchorEl?.closest?.('.page') as HTMLElement | null;
      if (!page || !container.contains(page)) {
        return;
      }

      const dir = e.key === 'ArrowDown' ? 'forward' : 'backward';
      const beforeRect = range.getBoundingClientRect();
      const beforeY = beforeRect.top;
      const beforeX = beforeRect.left || beforeRect.right || 0;

      if (typeof (sel as any).modify !== 'function') {
        return;
      }
      (sel as any).modify('move', dir, 'line');

      const afterRange = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      const afterEl = afterRange
        ? (afterRange.startContainer.nodeType === Node.TEXT_NODE
          ? (afterRange.startContainer as Text).parentElement
          : (afterRange.startContainer as Element))
        : null;
      const afterPage = afterEl?.closest?.('.page') as HTMLElement | null;
      const afterRect = afterRange?.getBoundingClientRect();
      const movedVertically = !!(afterRect && Math.abs(afterRect.top - beforeY) > 1);
      const afterPara = afterEl?.closest?.('[data-p-idx]') as HTMLElement | null;
      const inPageContent = !!afterPara;

      // 같은 페이지 내에서 정상 이동된 경우: 기본 동작이 아닌 modify()로 이미 처리됨
      if (afterPage === page) {
        if (movedVertically && inPageContent) {
          e.preventDefault();
          return;
        }
        // 수직 이동이 없거나, 페이지 내부 콘텐츠 밖(페이지 루트 등)으로 이동한 경우 경계 점프로 처리
      } else if (afterPage && container.contains(afterPage)) {
        if (inPageContent) {
          e.preventDefault();
          return;
        }
      } else {
      }

      // 인접 페이지로 이동
      const pages = Array.from(container.querySelectorAll('.page')) as HTMLElement[];
      const pageIdx = pages.indexOf(page);
      const targetPage = e.key === 'ArrowDown' ? pages[pageIdx + 1] : pages[pageIdx - 1];
      if (!targetPage) {
        e.preventDefault();
        return;
      }

      const targetY = e.key === 'ArrowDown'
        ? targetPage.getBoundingClientRect().top + 2
        : targetPage.getBoundingClientRect().bottom - 2;
      const x = Number.isFinite(beforeX) && beforeX > 0 ? beforeX : targetPage.getBoundingClientRect().left + 10;

      let caretRange: Range | null = null;
      const docAny = document as any;
      if (typeof docAny.caretPositionFromPoint === 'function') {
        const pos = docAny.caretPositionFromPoint(x, targetY);
        if (pos) {
          caretRange = document.createRange();
          caretRange.setStart(pos.offsetNode, pos.offset);
          caretRange.collapse(true);
        }
      } else if (typeof document.caretRangeFromPoint === 'function') {
        caretRange = document.caretRangeFromPoint(x, targetY);
      }

      if (caretRange) {
        const caretEl = caretRange.startContainer.nodeType === Node.TEXT_NODE
          ? (caretRange.startContainer as Text).parentElement
          : (caretRange.startContainer as Element);
        if (caretEl?.closest('.page') === targetPage) {
          const editable = (caretEl?.closest('[contenteditable="true"]') as HTMLElement | null) || targetPage;
          editable.focus({ preventScroll: true });
          sel.removeAllRanges();
          sel.addRange(caretRange);
          e.preventDefault();
          return;
        }
      }

      // caretRangeFromPoint가 실패하면 첫/마지막 텍스트 위치로 폴백
      const walker = document.createTreeWalker(targetPage, NodeFilter.SHOW_TEXT);
      let node: Text | null = null;
      if (e.key === 'ArrowDown') {
        node = walker.nextNode() as Text | null;
      } else {
        let last: Text | null = null;
        while (walker.nextNode()) last = walker.currentNode as Text;
        node = last;
      }
      if (node) {
        const r = document.createRange();
        r.setStart(node, e.key === 'ArrowDown' ? 0 : node.length);
        r.collapse(true);
        const editable = (node.parentElement?.closest('[contenteditable="true"]') as HTMLElement | null) || targetPage;
        editable.focus({ preventScroll: true });
        sel.removeAllRanges();
        sel.addRange(r);
      }
      e.preventDefault();
      return;
    }
  });
}
