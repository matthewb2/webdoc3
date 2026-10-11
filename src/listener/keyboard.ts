// src/listener/keyboard.ts - 키보드 입력 처리 (조합·Enter·삭제·삽입)
import type { CursorState, TextRun } from '../types';
import { breakKeyForRuns, computeBreaks } from '../probe';
import { getCachedPages, updateVisiblePages } from '../render';
import { cachedParagraphInfo, clearPendingSelection, setAwaitingRender } from './index';
import { clearCellSelection, exitCellEditMode, isCellEditMode } from './mouse';

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

// 한글 조합 중에는 렌더가 조합 노드를 날려 자모가 깨지므로, main에서 렌더를 보류한다
let composingActive = false;

export function isComposingActive() {
  return composingActive;
}

function markEditPending() {
  setAwaitingRender(true);
}

let compAnchor: { docIdx: number; charIndex: number } | null = null;

// 같은 단락 p 조각들의 DOM 텍스트를 모델 좌표로 잘라냄 (ZWSP 제외)
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
// 1. 한글 글자 조합이 시작됨을 감지 (ex: 'ㄱ'을 누르는 순간)
container.addEventListener('compositionstart', () => {
  composingActive = true;
  saveCursorPosition();
  compAnchor = { docIdx: cursor.docIdx, charIndex: cursor.charIndex };
});

// 2. 한글 글자 조합이 완료됨을 감지 (ex: '가'를 쓰고 다음 글자로 넘어가거나 스페이스를 누를 때)
container.addEventListener('compositionend', async (e: CompositionEvent) => {
  composingActive = false;

  // 글자가 완성되었으므로, 최종 완성된 글자를 워커로 전송하여 레이아웃을 다시 계산합니다.
  if (e.data) {
    saveCursorPosition();
    await refreshParaBreaks(worker, cursor.docIdx);
      clearPendingSelection();
      markEditPending();
    // 조합 중간에 들어간 임시 글자 offset을 고려하여 워커에 삽입 요청
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
    // 빈 종료(암시적 확정): 시작 앵커~현재 캐럿 사이 DOM 텍스트를 확정분으로 전송
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

container.addEventListener('keydown', (e: KeyboardEvent) => {
  // 한글 조합 중 엔터를 치는 경우 컴포지션 종료와 충돌하지 않도록 방어
  if (composingActive) return;

  // Ctrl/⌘+A: 가상화로 마운트 해제된 페이지를 포함해 문서 전체 선택
  if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
    if (!document.activeElement?.closest('#editor-container')) return;
    if (cursor.isInsideTable) return;
    e.preventDefault();
    const total = getCachedPages().length;
    if (total === 0) return;
    const all: number[] = [];
    for (let i = 0; i < total; i++) all.push(i);
    updateVisiblePages(all);
    const pages = Array.from(container.querySelectorAll('.page'));
    if (pages.length === 0) return;
    const first = pages[0];
    const last = pages[pages.length - 1];
    const range = document.createRange();
    range.setStart(first, 0);
    range.setEnd(last, last.childNodes.length);
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
    saveCursorPosition();
    return;
  }

  // Esc: 셀 텍스트 편집 모드 종료
  if (e.key === 'Escape' || e.key === 'Esc') {
    if (isCellEditMode()) {
      e.preventDefault();
      exitCellEditMode(container);
      return;
    }
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    saveCursorPosition();
    if (cursor.isInsideTable) return;
      clearPendingSelection();
      markEditPending();
    clearCellSelection(container);
    worker.postMessage({ type: 'EDIT_SPLIT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
    cursor.docIdx += 1;
    cursor.charIndex = 0;
    cursor.charOffset = 0;
  }
});

container.addEventListener('beforeinput', async (e: InputEvent) => {
  if (e.inputType === 'insertLineBreak') return e.preventDefault();

  if (composingActive) return;

  if (e.inputType === 'deleteContentBackward') {
    e.preventDefault();
    saveCursorPosition();
    if (cursor.charIndex <= 0) {
      // 문단 시작점에서 백스페이스: 이전 문단과 병합 (빈 문단 삭제 포함)
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

  if (e.inputType === 'deleteContentForward') {
    e.preventDefault();
    saveCursorPosition();
    if (cursor.isInsideTable) return;
    const cur = cachedParagraphInfo(cursor.docIdx);
    if (cur.isParagraph && cur.length === 0) {
      // 빈 문단에서 DEL: 문단 자체가 사라지므로 커서를 이전 문단 끝으로 이동
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
    // 문단 끝에서 다음 문단을 끌어올리면 인덱스가 밀리므로 선택 해제
    if (cursor.charIndex >= cur.length && cachedParagraphInfo(cursor.docIdx + 1).isParagraph) {
      clearCellSelection(container);
    }
    worker.postMessage({ type: 'EDIT_DELETE_FWD', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
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

// 캐시된 조각에서 문단 텍스트 길이·종류·존재 조회 (병합 커서 계산용)

