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
  });
}
