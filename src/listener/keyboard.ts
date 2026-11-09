// src/listener/keyboard.ts - 키보드 입력 처리 (조합·Enter·삭제·삽입)
import type { CursorState, TextRun } from '../types';
import { breakKeyForRuns, computeBreaks } from '../probe';
import { getCachedPages} from '../render';
import { cachedParagraphInfo, clearPendingSelection, setAwaitingRender, snapshotSelection, selectedParagraphIndices, selectionRangeInParagraph } from './index';
import { clearCellSelection, selectCellFromInputMode, extendCellSelection } from './mouse';

// 편집된 단락 전체 런을 캐시된 조각에서 복원해 분절점을 다시 재고 워커에 전달
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

let composingActive = false;

export function isComposingActive() {
  return composingActive;
}

function markEditPending() {
  setAwaitingRender(true);
}

let compAnchor: { docIdx: number; charIndex: number } | null = null;

function sliceDomParaText(container: HTMLDivElement, docIdx: number, fromChar: number, toChar: number): string {
  const full = Array.from(container.querySelectorAll(`p[data-p-idx="${docIdx}"]`))
    .map((p) => (p.textContent || '').replace(/\u200B/g, ''))
    .join('');
  return full.slice(Math.max(0, fromChar), Math.max(0, toChar));
}

export function initEditorListeners(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  saveCursorPosition: () => void,
  onCompositionEnd: () => void,
  onCompositionEditPosted: () => void,
) {
  container.addEventListener('compositionstart', () => {
    composingActive = true;
    saveCursorPosition();
    compAnchor = { docIdx: cursor.docIdx, charIndex: cursor.charIndex };
  });

  container.addEventListener('compositionend', async (e: CompositionEvent) => {
    composingActive = false;
    if (e.data) {
      saveCursorPosition();
      await refreshParaBreaks(worker, cursor.docIdx);
      clearPendingSelection();
      markEditPending();
      worker.postMessage({
        type: 'EDIT_INSERT',
        payload: {
          paragraphIndex: cursor.docIdx,
          charIndex: cursor.charIndex - e.data.length,
          text: e.data
        }
      });
      onCompositionEditPosted();
    } else {
      saveCursorPosition();
      let text = '';
      let at = cursor.charIndex;
      if (compAnchor && compAnchor.docIdx === cursor.docIdx && cursor.charIndex > compAnchor.charIndex) {
        text = sliceDomParaText(container, cursor.docIdx, compAnchor.charIndex, cursor.charIndex);
        at = compAnchor.charIndex;
      }
      if (text.length > 0) {
        await refreshParaBreaks(worker, cursor.docIdx);
        clearPendingSelection();
        markEditPending();
        worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: cursor.docIdx, charIndex: at, text } });
        cursor.charIndex = at + text.length;
        onCompositionEditPosted();
      } else {
        onCompositionEnd();
      }
    }
    compAnchor = null;
  });

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
    if (composingActive) return;
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
    if ((e.key === 'Delete' || e.key === 'Backspace') && container.contains(e.target as Node)) {
      console.log('[DEBUG KEYDOWN] Key pressed:', e.key, 'Selection collapsed:', window.getSelection()?.isCollapsed);
    }
  });

  container.addEventListener('beforeinput', async (e: InputEvent) => {
    console.log('[DEBUG BEFOREINPUT] inputType:', e.inputType, 'data:', e.data);

    if (e.inputType === 'insertLineBreak') return e.preventDefault();
    if (composingActive) return;

    // 디버깅용 Selection 상태 출력
    const sel = window.getSelection();
    console.log('[DEBUG SELECTION]', {
      rangeCount: sel?.rangeCount,
      isCollapsed: sel?.isCollapsed,
      anchorNode: sel?.anchorNode,
      focusNode: sel?.focusNode
    });
    const rawAnchor = sel?.anchorNode ?? null;
    let anchorElement: HTMLElement | null = null;
    
    if (rawAnchor) {
      anchorElement = rawAnchor.nodeType === Node.TEXT_NODE 
        ? rawAnchor.parentElement 
        : (rawAnchor as HTMLElement);
    }
    
    const targetEl = e.target instanceof Element ? e.target : (e.target as Node | null)?.parentElement;
    const isInsideTableElement =
      !!anchorElement?.closest('td, th') || !!targetEl?.closest?.('td, th');

    if (isInsideTableElement) {
      console.log('[DEBUG TABLE INPUT] Inside table cell, bypassing custom beforeinput intercept.');
      return; // 브라우저 기본 텍스트 입력 동작 허용
    }

    const snap = snapshotSelection(container);
    console.log('[DEBUG SNAPSHOT]', snap);

    const hasRangeSelection = snap !== null && (
      snap.anchor.docIdx !== snap.focus.docIdx || snap.anchor.charIndex !== snap.focus.charIndex
    );
    console.log('[DEBUG hasRangeSelection]', hasRangeSelection);

    const isDeleteAction = [
      'deleteContentBackward',
      'deleteContentForward',
      'deleteContent',
      'deleteByCut',
      'deleteByDrag'
    ].includes(e.inputType);

    if (isDeleteAction) {
      e.preventDefault();
      saveCursorPosition();

      // 1. 범위 선택 삭제
      if (hasRangeSelection && snap) {
        console.log('[DEBUG ACTION] Executing Range Delete');
        const paraIndices = selectedParagraphIndices(container, cursor.docIdx, snap);
        for (const docIdx of paraIndices) {
          const r = selectionRangeInParagraph(container, docIdx, snap);
          console.log(`[DEBUG RANGE] Para ${docIdx} range:`, r);
          if (r) {
            await refreshParaBreaks(worker, docIdx);
            worker.postMessage({
              type: 'EDIT_DELETE_RANGE',
              payload: { paragraphIndex: docIdx, fromCharIndex: r.from, endCharIndex: r.to }
            });
          }
        }
        clearPendingSelection();
        markEditPending();
        clearCellSelection(container);

        const loStart = snap.anchor.docIdx < snap.focus.docIdx || 
          (snap.anchor.docIdx === snap.focus.docIdx && snap.anchor.charIndex <= snap.focus.charIndex) 
          ? snap.anchor : snap.focus;
        cursor.docIdx = loStart.docIdx;
        cursor.charIndex = loStart.charIndex;
        cursor.charOffset = 0;
        return;
      }

      console.log('[DEBUG ACTION] Fallback to single character delete (No valid range selection detected)');

      // 2. 단일 백스페이스
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
        cursor.charIndex -= 1;
        return;
      }

      // 3. 단일 딜리트
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
      return;
    }

    if (e.inputType === 'insertParagraph') {
      e.preventDefault();
      saveCursorPosition();
      clearCellSelection(container);
      await refreshParaBreaks(worker, cursor.docIdx);
      clearPendingSelection();
      markEditPending();
      worker.postMessage({ type: 'EDIT_SPLIT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
      cursor.docIdx += 1;
      cursor.charIndex = 0;
      cursor.charOffset = 0;
      return;
    }

    if (e.data) {
      e.preventDefault();
      saveCursorPosition();
      await refreshParaBreaks(worker, cursor.docIdx);
      clearPendingSelection();
      markEditPending();
      worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex, text: e.data } });
      cursor.charIndex += e.data.length;
    }
  });
}