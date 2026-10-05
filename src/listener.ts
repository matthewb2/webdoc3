// src/listener.ts - 이벤트 리스너 (워커 메시지·스크롤·선택·입력·HWP 열기)
import type { PageModel } from './worker/doc.worker';
import type { CursorState, TextRun } from './types';
import { parseHwpToDocumentModel } from './hwp/hwpParser';
import { breakKeyForRuns, collectProbeItems, computeBreaks } from './probe';
import { getCachedPages } from './render';
import { saveCurrentDocument } from './odt/odtExport';
import { saveCurrentDocumentDocx } from './docx/docxExport';

const FONT_FAMILIES = [
  'Arial', 'Verdana', 'Tahoma', 'Times New Roman', 'Georgia', 'Courier New',
  '맑은 고딕', 'Malgun Gothic', '굴림', 'Gulim', '돋움', 'Dotum',
  '바탕', 'Batang', '궁서', 'Gungsuh', '나눔고딕', 'NanumGothic', 'Noto Sans KR',
];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 72];

let fontContainer: HTMLDivElement | null = null;
let fontWorker: Worker | null = null;
let fontCursor: CursorState | null = null;

function fillSelect(select: HTMLSelectElement, values: Array<string | number>) {
  select.innerHTML = '';
  values.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = String(v);
    opt.textContent = String(v);
    select.appendChild(opt);
  });
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const norm = (s: string) => s.replace(/['"]/g, '').trim().toLowerCase();
  const found = Array.from(select.options).find((o) => norm(o.value) === norm(value));
  if (found) {
    select.value = found.value;
  } else if (value) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
    select.value = value;
  }
}

export function initFontCombos(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  fontContainer = container;
  fontWorker = worker;
  fontCursor = cursor;
  const familySelect = document.getElementById('font-family-select') as HTMLSelectElement | null;
  const sizeSelect = document.getElementById('font-size-select') as HTMLSelectElement | null;
  if (!familySelect || !sizeSelect) return;
  fillSelect(familySelect, FONT_FAMILIES);
  fillSelect(sizeSelect, FONT_SIZES);
  familySelect.disabled = false;
  sizeSelect.disabled = false;
  familySelect.addEventListener('change', () => {
    if (fontWorker && fontCursor) {
      fontWorker.postMessage({ type: 'EDIT_FONT', payload: { paragraphIndex: fontCursor.docIdx, fontFamily: familySelect.value } });
    }
  });
  sizeSelect.addEventListener('change', () => {
    const size = parseFloat(sizeSelect.value);
    if (fontWorker && fontCursor && !isNaN(size)) {
      fontWorker.postMessage({ type: 'EDIT_FONT', payload: { paragraphIndex: fontCursor.docIdx, fontSize: size } });
    }
  });
  syncFontCombos();
}

// 선택 영역(커서) run의 스타일을 콤보박스에 반영
export function syncFontCombos() {
  if (!fontContainer) return;
  const familySelect = document.getElementById('font-family-select') as HTMLSelectElement | null;
  const sizeSelect = document.getElementById('font-size-select') as HTMLSelectElement | null;
  if (!familySelect || !sizeSelect || familySelect.options.length === 0) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node || !fontContainer.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const span = el?.closest?.('span') as HTMLSpanElement | null;
  if (!span || !fontContainer.contains(span)) return;
  setSelectValue(familySelect, span.style.fontFamily || 'Arial');
  const size = parseFloat(span.style.fontSize);
  setSelectValue(sizeSelect, isNaN(size) ? '16' : String(Math.round(size * 100) / 100));
}

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

export function initWorkerListener(
  worker: Worker,
  onReady: (pages: PageModel[]) => void,
  onStream: (pages: PageModel[]) => void,
) {
let layoutProgressShown = false;

worker.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  if (message.type === 'RENDER_READY') {
    onReady(message.payload);
    if (layoutProgressShown) {
      layoutProgressShown = false;
      const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement | null;
      if (hwpStatus) hwpStatus.textContent = `레이아웃 완료: ${message.payload.length}페이지`;
    }
  } else if (message.type === 'RENDER_STREAM') {
    onStream(message.payload.pages);
  } else if (message.type === 'LAYOUT_PROGRESS') {
    const { done, total } = message.payload;
    if (total >= 50) {
      layoutProgressShown = true;
      const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement | null;
      if (hwpStatus) hwpStatus.textContent = `레이아웃 계산 중... ${done}/${total}`;
    }
  }
});

}

export function initViewportScrollListener(onScroll: () => void) {
  let scrollRaf = 0;
  const viewportEl = document.querySelector('.editor-viewport') as HTMLDivElement | null;
  viewportEl?.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = window.requestAnimationFrame(() => {
      scrollRaf = 0;
      onScroll();
    });
  }, { passive: true });
}

// 레이아웃 비행 중(in-flight) selectionchange는 DOM 재구성 부산물이므로 무시.
// (가상화 리마운트/스트리밍이 캐럿을 날리면, 낡은 위치로 저장해 커서를 점프시킨다)
let awaitingRender = false;

export function setAwaitingRender(v: boolean) {
  awaitingRender = v;
}

// 한글 조합 중에는 렌더가 조합 노드를 날려 자모가 깨지므로, main에서 렌더를 보류한다
let composingActive = false;

export function isComposingActive() {
  return composingActive;
}

function markEditPending() {
  setAwaitingRender(true);
}

export function initSelectionListener(onSelectionChange: () => void) {
  document.addEventListener('selectionchange', () => {
    if (awaitingRender) return;
    // 현재 포커스된 엘리먼트가 에디터 컨테이너 내부에 있는지 검증
    if (document.activeElement?.closest('#editor-container')) {
      onSelectionChange();
    }
  });
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

  if (e.key === 'Enter') {
    e.preventDefault();
    saveCursorPosition();
    if (cursor.isInsideTable) return;
    markEditPending();
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
    if (cursor.charIndex <= 0) return;
    await refreshParaBreaks(worker, cursor.docIdx);
    markEditPending();
    worker.postMessage({ type: 'EDIT_DELETE', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex } });
    cursor.charIndex -= 1;
    return;
  }

  if (e.data) {
    e.preventDefault();
    saveCursorPosition();
    await refreshParaBreaks(worker, cursor.docIdx);
    markEditPending();
    worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex, text: e.data } });
    cursor.charIndex += e.data.length;
  }
});

}

export function initHwpFileOpen(worker: Worker, containerEl: HTMLDivElement) {

  const openHwpButton = document.getElementById('btn-open-hwp') as HTMLButtonElement;
  const hwpFileInput = document.getElementById('hwp-file') as HTMLInputElement;
  const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement;
  const editorViewport = document.querySelector('.editor-viewport') as HTMLDivElement;

  function renderHwpFile(file: File) {
    if (!/\.hwp$/i.test(file.name)) {
      hwpStatus.textContent = '.hwp 확장자 파일을 선택해 주세요';
      return;
    }
    hwpStatus.textContent = `파싱 중... (${file.name})`;
    file.arrayBuffer()
      .then(async (buffer) => {
        const model = parseHwpToDocumentModel(new Uint8Array(buffer));
        worker.postMessage({ type: 'BREAKS', payload: await computeBreaks(collectProbeItems(model)) });
        worker.postMessage({ type: 'INIT_DOC', payload: model });
        containerEl.style.display = 'inline-flex';
        hwpStatus.textContent = `파싱 완료: ${file.name} (${model.length}개 항목)`;
      })
      .catch((err: Error) => {
        hwpStatus.textContent = `파싱 실패: ${err.message}`;
      });
  }

  openHwpButton.addEventListener('click', () => hwpFileInput.click());
  hwpFileInput.addEventListener('change', () => {
    const file = hwpFileInput.files?.[0];
    if (file) renderHwpFile(file);
    hwpFileInput.value = '';
  });

  let dragDepth = 0;
  editorViewport.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragDepth += 1;
    editorViewport.classList.add('is-dragging');
  });
  editorViewport.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  });
  editorViewport.addEventListener('dragleave', () => {
    dragDepth -= 1;
    if (dragDepth <= 0) {
      dragDepth = 0;
      editorViewport.classList.remove('is-dragging');
    }
  });
  editorViewport.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDepth = 0;
    editorViewport.classList.remove('is-dragging');
    const files = Array.from(e.dataTransfer?.files ?? []);
    const file = files.find((f) => /\.hwp$/i.test(f.name) || f.type === 'application/x-hwp');
    if (file) renderHwpFile(file);
  });
}

export function initOdtExport(worker: Worker) {
  document.getElementById('btn-save-odt')?.addEventListener('click', () => {
    saveCurrentDocument(worker).catch(() => {});
  });
  document.getElementById('btn-save-docx')?.addEventListener('click', () => {
    saveCurrentDocumentDocx(worker).catch(() => {});
  });
}
