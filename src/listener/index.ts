import type { PageModel } from '../worker/layout';
import type { CursorState, TableBorderStyle } from '../types';
import { defaultAlign, defaultFontFamily, defaultFontSize, defaultLineSpacing, loadSettings, saveSettings } from '../settings';
import { addRecentEntry, getRecentEntries, getRecentHandle, verifyReadPermission } from '../recentFileStore';
import { setPageMargins } from '../worker/layoutConstants';
import { parseHwpToDocumentModel } from '../hwp/hwpParser';
import { parseDocxToDocumentModel } from '../docx/docxParser';
import { parseOdtToDocumentModel } from '../odt/odtParser';
import { parseHwpxToDocumentModel } from '../hwpx/hwpxParser';
import { collectProbeItems, computeBreaks } from '../probe';
import { getCachedPages, setRenderZoom, updateVisiblePages } from '../render';
import { saveCurrentDocument } from '../odt/odtExport';
import { saveCurrentDocumentDocx } from '../docx/docxExport';
import { saveCurrentDocumentHwp } from '../hwp/hwpExport';
import { saveCurrentHwpxDocument } from '../hwpx/hwpxExport';
import { cellPosFromTd, clearCellSelection, getActiveTableDocIdx, getCellSelection } from './mouse';
import type { CellSel } from './mouse';

const FONT_FAMILIES = [
  'Arial', 'Verdana', 'Tahoma', 'Times New Roman', 'Georgia', 'Courier New', '맑은 고딕', '굴림', '돋움', '바탕',  '궁서', '나눔고딕', 'Noto Sans KR'
];
const FONT_SIZES_PT = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
const pxToPt = (px: number) => Math.round((px * 72 / 96) * 10) / 10;
const ptToPx = (pt: number) => Math.round((pt * 96 / 72) * 100) / 100;

let fontContainer: HTMLDivElement | null = null;
let fontWorker: Worker | null = null;
let fontCursor: CursorState | null = null;

function fillSelect(select: HTMLSelectElement, values: Array<string | number>) {
  // 정적 마크업에 이미 같은 값이 있으면 다시 채우지 않음 (로드 후 레이아웃 밀림 방지)
  const existing = Array.from(select.options).map((o) => o.value);
  const wanted = values.map((v) => String(v));
  if (existing.length === wanted.length && existing.every((v, i) => v === wanted[i])) return;
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
  fillSelect(sizeSelect, FONT_SIZES_PT.map(String));
  familySelect.disabled = false;
  sizeSelect.disabled = false;
  familySelect.value = defaultFontFamily();
  const initPt = pxToPt(defaultFontSize());
  sizeSelect.value = Math.abs(initPt - Math.round(initPt)) < 0.01 ? String(Math.round(initPt)) : String(initPt);
  familySelect.addEventListener('pointerdown', () => stashSelection(container));
  sizeSelect.addEventListener('pointerdown', () => stashSelection(container));
  familySelect.addEventListener('change', () => {
    if (fontWorker && fontCursor) {
      postFontStyle(container, fontWorker, fontCursor, { fontFamily: familySelect.value });
    }
  });
  sizeSelect.addEventListener('change', () => {
    const ptSize = parseFloat(sizeSelect.value);
    if (fontWorker && fontCursor && !isNaN(ptSize)) {
      postFontStyle(container, fontWorker, fontCursor, { fontSize: ptToPx(ptSize) });
    }
  });
  syncFontCombos();
}

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
  for (const ch of t) if (ch !== '​') n++;
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

// 렌더로 선택이 날아가기 전 선택 영역 양 끝을 모델 좌표로 보관 (표 안이면 null)
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

// 현재 선택 영역을 문단별 모델 오프셋으로 변환 (없으면 null → 문단 전체 적용)
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
    const len = cachedParagraphInfo(docIdx).length;
    const from = docIdx === start.docIdx ? start.charIndex : 0;
    const to = docIdx === end.docIdx ? end.charIndex : len;
    return to > from ? { from, to } : null;
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const paras = Array.from(container.querySelectorAll(`p[data-p-idx="${docIdx}"]`));
  if (paras.length === 0) return null;
  const modelLen = (t: string): number => {
    let n = 0;
    for (const ch of t) if (ch !== '​') n++;
    return n;
  };
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
          from = acc + modelLen(t.slice(0, startInNode));
          found = true;
        }
        to = acc + modelLen(t.slice(0, endInNode));
      }
      acc += modelLen(t);
      tn = walker.nextNode();
    }
  });
  if (!found || to <= from) return null;
  return { from, to };
}

// 글꼴 스타일을 선택 영역(범위) 단위로 전송 (범위 없으면 문단 전체)
export interface FontStyleAttrs {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

function postFontStyle(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  attrs: FontStyleAttrs,
) {
  const snap = peekPendingSelection();
  selectedParagraphIndices(container, cursor.docIdx, snap).forEach((docIdx) => {
    const r = selectionRangeInParagraph(container, docIdx, snap);
    if (r) {
      worker.postMessage({
        type: 'EDIT_FONT_RANGE',
        payload: { paragraphIndex: docIdx, fromCharIndex: r.from, endCharIndex: r.to, ...attrs },
      });
    } else {
      worker.postMessage({ type: 'EDIT_FONT', payload: { paragraphIndex: docIdx, ...attrs } });
    }
  });
}

// 색상 스타일을 선택 영역(범위) 단위로 전송 (범위 없으면 문단 전체)
function postColorStyle(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  attrs: { color?: string; backgroundColor?: string },
) {
  const snap = peekPendingSelection();
  selectedParagraphIndices(container, cursor.docIdx, snap).forEach((docIdx) => {
    const r = selectionRangeInParagraph(container, docIdx, snap);
    if (r) {
      worker.postMessage({
        type: 'EDIT_COLOR_RANGE',
        payload: { paragraphIndex: docIdx, fromCharIndex: r.from, endCharIndex: r.to, ...attrs },
      });
    } else {
      worker.postMessage({ type: 'EDIT_COLOR', payload: { paragraphIndices: [docIdx], ...attrs } });
    }
  });
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
  setSelectValue(familySelect, span.style.fontFamily || defaultFontFamily());
  const sizePx = parseFloat(span.style.fontSize);
  const pt = isNaN(sizePx) ? pxToPt(defaultFontSize()) : pxToPt(sizePx);
  // 10.5 같은 값 표시 정규화
  const ptText = Math.abs(pt - Math.round(pt)) < 0.01 ? String(Math.round(pt)) : String(pt);
  setSelectValue(sizeSelect, ptText);
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

export function initSelectionListener(onSelectionChange: () => void) {
  document.addEventListener('selectionchange', () => {
    if (awaitingRender) return;
    // 현재 포커스된 엘리먼트가 에디터 컨테이너 내부에 있는지 검증
    if (document.activeElement?.closest('#editor-container')) {
      onSelectionChange();
    }
  });
}

export function cachedParagraphInfo(docIdx: number): { isParagraph: boolean; exists: boolean; length: number } {
  let length = 0;
  let isParagraph = false;
  let exists = false;
  getCachedPages().forEach((page) => {
    page.forEach((item: any) => {
      if (item && item._docIdx === docIdx) {
        exists = true;
        if (item.type === 'paragraph') {
          isParagraph = true;
          (item.children || []).forEach((run: any) => {
            length += (run.text || '').length;
          });
        }
      }
    });
  });
  return { isParagraph, exists, length };
}

async function loadDocumentFile(
  file: File,
  handle: FileSystemFileHandle | null,
  worker: Worker,
  containerEl: HTMLDivElement,
) {
  const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement | null;
  const lower = file.name.toLowerCase();
  const kind = /\.hwpx$/i.test(lower)
    ? 'hwpx'
    : /\.hwp$/i.test(lower)
      ? 'hwp'
      : /\.docx$/i.test(lower)
        ? 'docx'
        : /\.odt$/i.test(lower)
          ? 'odt'
          : null;
  if (!kind) {
    if (hwpStatus) hwpStatus.textContent = '.hwp, .hwpx, .docx, .odt 파일을 선택해 주세요';
    return;
  }
  if (hwpStatus) hwpStatus.textContent = `파싱 중... (${file.name})`;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    console.log('[open] file=', file.name, 'kind=', kind, 'bytes=', bytes.length);
    const model =
      kind === 'hwpx'
        ? parseHwpxToDocumentModel(bytes)
        : kind === 'hwp'
          ? parseHwpToDocumentModel(bytes)
          : kind === 'docx'
            ? parseDocxToDocumentModel(bytes)
            : parseOdtToDocumentModel(bytes);
    console.log('[open] parsed model items=', model.length, model);
    worker.postMessage({ type: 'BREAKS', payload: await computeBreaks(collectProbeItems(model)) });
    worker.postMessage({ type: 'INIT_DOC', payload: model });
    containerEl.style.display = 'inline-flex';
    setCurrentFileHandle(handle);
    setCurrentFileName(file.name);
    await addRecentEntry(file.name, handle);
    refreshRecentFiles();
    clearCellSelection(containerEl);
    if (hwpStatus) hwpStatus.textContent = `파싱 완료: ${file.name} (${model.length}개 항목)`;
  } catch (err) {
    console.error('[open] parse/load failed', err);
    if ((err as any)?.name === 'AbortError') return;
    if (hwpStatus) hwpStatus.textContent = `파싱 실패: ${(err as Error).message}`;
  }
}

export function initFileOpen(worker: Worker, containerEl: HTMLDivElement) {
  const openFileButton = document.getElementById('btn-open-file') as HTMLButtonElement;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const editorViewport = document.querySelector('.editor-viewport') as HTMLDivElement;

  openFileButton.addEventListener('click', async () => {
    // FSAA 사용 시 핸들을 받아 최근 파일에서 대화상자 없이 바로 열 수 있게 한다.
    if (typeof window.showOpenFilePicker === 'function') {
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: '문서',
              accept: {
                'application/x-hwp': ['.hwp'],
                'application/hwp+zip': ['.hwpx'],
                'application/vnd.hancom.hwpx': ['.hwpx'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.oasis.opendocument.text': ['.odt'],
              },
            },
          ],
        });
        if (handle) {
          const file = await handle.getFile();
          await loadDocumentFile(file, handle, worker, containerEl);
        }
        return;
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        // 실패 시 input 폴백
      }
    }
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) void loadDocumentFile(file, null, worker, containerEl);
    fileInput.value = '';
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
    const file = files.find((f) => /\.(hwp|hwpx|docx|odt)$/i.test(f.name));
    if (file) void loadDocumentFile(file, null, worker, containerEl);
  });
}

const COLUMN_GAP = 20;

export function columnWidth(columns: number): number {
  const n = Math.max(1, columns);
  return (600 - COLUMN_GAP * (n - 1)) / n;
}

// 선택 영역에 걸친 단락들의 문서 인덱스 수집 (없으면 커서 단락)
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

export function initColumnCombo(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const select = document.getElementById('column-count-select') as HTMLSelectElement | null;
  if (!select) return;
  select.addEventListener('pointerdown', () => stashSelection(container));
  select.addEventListener('change', () => {
    const n = parseInt(select.value, 10) || 1;
    const snap = peekPendingSelection();
    worker.postMessage({ type: 'EDIT_COLUMNS', payload: { paragraphIndices: selectedParagraphIndices(container, cursor.docIdx, snap), columns: n } });
  });
  syncColumnCombo();
}

// 커서 위치 단락의 다단 설정을 콤보박스에 반영
export function syncColumnCombo() {
  const select = document.getElementById('column-count-select') as HTMLSelectElement | null;
  if (!select) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node) return;
  const container = document.getElementById('editor-container');
  if (!container || !container.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const p = el?.closest?.('p');
  if (!p || !container.contains(p)) return;
  const wrap = p.closest('div[data-cols]');
  select.value = (wrap && wrap.getAttribute('data-cols')) || '1';
  if (!['1', '2', '3'].includes(select.value)) select.value = '1';
}

export function initAlignCombo(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const select = document.getElementById('align-select') as HTMLSelectElement | null;
  if (!select) return;
  select.addEventListener('pointerdown', () => stashSelection(container));
  select.addEventListener('change', () => {
    const raw = select.value;
    const align = ['left', 'center', 'right', 'justify'].includes(raw) ? raw : 'left';
    const tableTarget = currentTableTarget(container);
    if (tableTarget) {
      const rows: number[] = [];
      for (let r = tableTarget.r0; r <= tableTarget.r1; r++) rows.push(r);
      const cols: number[] = [];
      for (let c = tableTarget.c0; c <= tableTarget.c1; c++) cols.push(c);
      worker.postMessage({ type: 'EDIT_TABLE_ALIGN', payload: { tableDocIdx: tableTarget.tableDocIdx, rows, cols, align } });
      return;
    }
    const snap = peekPendingSelection();
    worker.postMessage({ type: 'EDIT_ALIGN', payload: { paragraphIndices: selectedParagraphIndices(container, cursor.docIdx, snap), align } });
  });
  syncAlignCombo();
}

// 표 셀 선택 영역 (있으면 정렬 대상), 없으면 커서 위치 단일 셀
function currentTableTarget(container: HTMLDivElement): CellSel | null {
  const selection = window.getSelection();
  const node = selection && selection.rangeCount > 0 ? selection.anchorNode : null;
  const el = node ? (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null)) : null;
  const td = el?.closest?.('td') as HTMLTableCellElement | null;
  if (!td || !container.contains(td)) return null;
  const sel = getCellSelection();
  const pos = cellPosFromTd(td);
  if (!pos) return null;
  if (sel && sel.tableDocIdx === pos.tableDocIdx) return sel;
  return { tableDocIdx: pos.tableDocIdx, r0: pos.r, r1: pos.r, c0: pos.c, c1: pos.c };
}

// 커서 위치 단락의 정렬 설정을 콤보박스에 반영
export function syncAlignCombo() {
  const select = document.getElementById('align-select') as HTMLSelectElement | null;
  if (!select) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node) return;
  const container = document.getElementById('editor-container');
  if (!container || !container.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const p = el?.closest?.('p');
  if (p && container.contains(p)) {
    select.value = (p as HTMLElement).dataset.align || defaultAlign();
  } else {
    // 표 셀 안: 셀 정렬 반영
    const td = el?.closest?.('td') as HTMLElement | null;
    if (!td || !container.contains(td)) return;
    const align = td.style.textAlign || defaultAlign();
    select.value = ['left', 'center', 'right', 'justify'].includes(align) ? align : defaultAlign();
    return;
  }
  if (!['left', 'center', 'right', 'justify'].includes(select.value)) select.value = defaultAlign();
}

function cssColorToHex(color: string): string | null {
  const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (m) {
    const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `#${h(+m[1])}${h(+m[2])}${h(+m[3])}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color.toLowerCase();
  return null;
}

export function initColorControls(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const textInput = document.getElementById('text-color-input') as HTMLInputElement | null;
  const bgInput = document.getElementById('bg-color-input') as HTMLInputElement | null;
  if (!textInput || !bgInput) return;
  textInput.addEventListener('pointerdown', () => stashSelection(container));
  bgInput.addEventListener('pointerdown', () => stashSelection(container));
  textInput.addEventListener('input', () => {
    postColorStyle(container, worker, cursor, { color: textInput.value });
  });
  bgInput.addEventListener('input', () => {
    postColorStyle(container, worker, cursor, { backgroundColor: bgInput.value });
  });
  textInput.addEventListener('dblclick', () => {
    postColorStyle(container, worker, cursor, { color: '' });
  });
  bgInput.addEventListener('dblclick', () => {
    postColorStyle(container, worker, cursor, { backgroundColor: '' });
  });
  syncColorControls();
}

// 커서 위치 run의 색상 설정을 컬러 인풋에 반영
export function syncColorControls() {
  const textInput = document.getElementById('text-color-input') as HTMLInputElement | null;
  const bgInput = document.getElementById('bg-color-input') as HTMLInputElement | null;
  if (!textInput || !bgInput) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node) return;
  const container = document.getElementById('editor-container');
  if (!container || !container.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const span = el?.closest?.('span') as HTMLSpanElement | null;
  if (!span || !container.contains(span)) return;
  textInput.value = cssColorToHex(span.style.color || '') || '#000000';
  bgInput.value = cssColorToHex(span.style.backgroundColor || '') || '#ffffff';
}

let zoomLevel = 1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

export function getZoomLevel(): number {
  return zoomLevel;
}

// 스케일은 레이아웃 크기를 바꾸지 않으므로 스크롤 영역을 시각 크기에 맞춤.
// 렌더 후에도 호출해야 함 (초기 빈 컨테이너 기준으로 고정되면 페이지가 찌그러짐)
export function refreshZoomLayout(container: HTMLDivElement): void {
  container.style.height = '';
  // flex-shrink로 자식이 찌그러지지 않게 강제 후 측정
  const h = container.scrollHeight;
  container.style.height = `${Math.ceil(h * zoomLevel)}px`;
}

export function initZoomControls(container: HTMLDivElement) {
  const outBtn = document.getElementById('btn-zoom-out') as HTMLButtonElement | null;
  const inBtn = document.getElementById('btn-zoom-in') as HTMLButtonElement | null;
  const label = document.getElementById('zoom-label') as HTMLButtonElement | null;
  if (!outBtn || !inBtn || !label) return;
  const apply = (z: number) => {
    zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
    label.textContent = `${Math.round(zoomLevel * 100)}%`;
    container.style.transform = `scale(${zoomLevel})`;
    container.style.transformOrigin = 'top center';
    refreshZoomLayout(container);
    setRenderZoom(zoomLevel);
    updateVisiblePages();
    window.dispatchEvent(new CustomEvent('editor-zoom', { detail: { zoom: zoomLevel } }));
  };
  outBtn.addEventListener('click', () => apply(zoomLevel - ZOOM_STEP));
  inBtn.addEventListener('click', () => apply(zoomLevel + ZOOM_STEP));
  label.addEventListener('click', () => apply(1));
  label.title = '클릭하면 100%';
  apply(1);
}

// 현재 문서 파일명 (열린 파일 기준, 없으면 제목 없음.odt)
let currentFileName: string | null = null;
let currentFileHandle: FileSystemFileHandle | null = null;

let recentWorker: Worker | null = null;
let recentContainer: HTMLDivElement | null = null;

function updateDocumentTitle() {
  document.title = `Doc3 - ${getCurrentFileName()}`;
}

export function setCurrentFileName(name: string | null) {
  currentFileName = name;
  updateDocumentTitle();
}

export function getCurrentFileName(): string {
  return currentFileName ?? '제목 없음.odt';
}

export function setCurrentFileHandle(handle: FileSystemFileHandle | null) {
  currentFileHandle = handle;
}

export function getCurrentFileHandle(): FileSystemFileHandle | null {
  return currentFileHandle;
}

function anchorSpan(): HTMLSpanElement | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const node = selection.anchorNode;
  if (!node || !fontContainer || !fontContainer.contains(node)) return null;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const span = el?.closest?.('span') as HTMLSpanElement | null;
  if (!span || !fontContainer.contains(span)) return null;
  return span;
}

function spanStyleState(span: HTMLSpanElement): { bold: boolean; italic: boolean; underline: boolean } {
  const weight = span.style.fontWeight;
  return {
    bold: weight === 'bold' || (weight !== '' && !isNaN(Number(weight)) && Number(weight) >= 700),
    italic: span.style.fontStyle === 'italic',
    underline: (span.style.textDecoration || '').includes('underline'),
  };
}

export function initParagraphStyles(_container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const bodyBtn = document.getElementById('btn-style-body') as HTMLButtonElement | null;
  const titleBtn = document.getElementById('btn-style-title') as HTMLButtonElement | null;
  if (!bodyBtn || !titleBtn) return;
  [bodyBtn, titleBtn].forEach((btn) => btn.addEventListener('mousedown', (e) => e.preventDefault()));
  const targetParagraphIndices = (): number[] => {
    if (cursor.isInsideTable) return [];
    return [cursor.docIdx];
  };
  bodyBtn.addEventListener('click', () => {
    const indices = targetParagraphIndices();
    if (indices.length === 0) return;
    worker.postMessage({
      type: 'EDIT_APPLY_STYLE',
      payload: {
        paragraphIndices: indices,
        align: defaultAlign(),
        lineSpacing: defaultLineSpacing(),
        fontFamily: defaultFontFamily(),
        fontSize: defaultFontSize(),
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        color: '',
      },
    });
  });
  titleBtn.addEventListener('click', () => {
    const indices = targetParagraphIndices();
    if (indices.length === 0) return;
    worker.postMessage({
      type: 'EDIT_APPLY_STYLE',
      payload: {
        paragraphIndices: indices,
        align: 'center',
        lineSpacing: 160,
        fontFamily: defaultFontFamily(),
        fontSize: 28,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        color: '',
      },
    });
  });
}

export function initStyleButtons(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const normalBtn = document.getElementById('btn-style-normal') as HTMLButtonElement | null;
  const boldBtn = document.getElementById('btn-style-bold') as HTMLButtonElement | null;
  const italicBtn = document.getElementById('btn-style-italic') as HTMLButtonElement | null;
  const underlineBtn = document.getElementById('btn-style-underline') as HTMLButtonElement | null;
  if (!normalBtn || !boldBtn || !italicBtn || !underlineBtn) return;
  [normalBtn, boldBtn, italicBtn, underlineBtn].forEach((btn) => {
    // 포커스를 빼앗지 않아 선택 영역을 유지
    btn.addEventListener('mousedown', (e) => e.preventDefault());
  });
  normalBtn.addEventListener('click', () => {
    stashSelection(container);
    postFontStyle(container, worker, cursor, { bold: false, italic: false, underline: false, strike: false });
  });
  boldBtn.addEventListener('click', () => {
    stashSelection(container);
    const span = anchorSpan();
    postFontStyle(container, worker, cursor, { bold: !(span && spanStyleState(span).bold) });
  });
  italicBtn.addEventListener('click', () => {
    stashSelection(container);
    const span = anchorSpan();
    postFontStyle(container, worker, cursor, { italic: !(span && spanStyleState(span).italic) });
  });
  underlineBtn.addEventListener('click', () => {
    stashSelection(container);
    const span = anchorSpan();
    postFontStyle(container, worker, cursor, { underline: !(span && spanStyleState(span).underline) });
  });
  syncStyleButtons();
}

// 커서 위치 run의 스타일을 버튼 활성 상태에 반영
export function syncStyleButtons() {
  const boldBtn = document.getElementById('btn-style-bold');
  const italicBtn = document.getElementById('btn-style-italic');
  const underlineBtn = document.getElementById('btn-style-underline');
  if (!boldBtn || !italicBtn || !underlineBtn) return;
  const span = anchorSpan();
  const state = span ? spanStyleState(span) : { bold: false, italic: false, underline: false };
  boldBtn.classList.toggle('active', state.bold);
  italicBtn.classList.toggle('active', state.italic);
  underlineBtn.classList.toggle('active', state.underline);
}

export function initLineSpacingCombo(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const select = document.getElementById('line-spacing-select') as HTMLSelectElement | null;
  if (!select) return;
  select.addEventListener('pointerdown', () => stashSelection(container));
  select.addEventListener('change', () => {
    const value = parseFloat(select.value);
    const spacing = !isNaN(value) ? value : defaultLineSpacing();
    const snap = peekPendingSelection();
    worker.postMessage({ type: 'EDIT_LINE_SPACING', payload: { paragraphIndices: selectedParagraphIndices(container, cursor.docIdx, snap), lineSpacing: spacing } });
  });
  syncLineSpacingCombo();
}

// 커서 위치 단락의 줄간격을 콤보박스에 반영
export function syncLineSpacingCombo() {
  const select = document.getElementById('line-spacing-select') as HTMLSelectElement | null;
  if (!select) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node) return;
  const container = document.getElementById('editor-container');
  if (!container || !container.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const p = el?.closest?.('p');
  if (!p || !container.contains(p)) return;
  const value = (p as HTMLElement).dataset.lineSpacing || String(defaultLineSpacing());
  setSelectValue(select, value);
}

export function initTableInsert(_container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const btn = document.getElementById('btn-insert-table') as HTMLButtonElement | null;
  const rowsInput = document.getElementById('table-rows-input') as HTMLSelectElement | null;
  const colsInput = document.getElementById('table-cols-input') as HTMLSelectElement | null;
  if (!btn || !rowsInput || !colsInput) return;
  btn.addEventListener('mousedown', (e) => e.preventDefault());
  btn.addEventListener('click', () => {
    const rows = parseInt(rowsInput.value, 10) || 2;
    const cols = parseInt(colsInput.value, 10) || 3;
    worker.postMessage({
      type: 'EDIT_INSERT_TABLE',
      payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex, rows, cols },
    });
  });
}

let selectedShapeDocIdx: number | null = null;

export function getSelectedShapeDocIdx(): number | null {
  return selectedShapeDocIdx;
}
export function setSelectedShapeDocIdx(idx: number | null) {
  selectedShapeDocIdx = idx;
  const container = document.getElementById('editor-container') as HTMLElement | null;
  if (container) {
    if (idx == null) delete (container as any).dataset.selectedShapeDocIdx;
    else (container as any).dataset.selectedShapeDocIdx = String(idx);
  }
  document.querySelectorAll('.doc-shape.shape-selected').forEach((el) => el.classList.remove('shape-selected'));
  if (idx != null) {
    document.querySelectorAll(`.doc-shape[data-p-idx="${idx}"]`).forEach((el) => el.classList.add('shape-selected'));
  }
}

export function initShapeInsert(worker: Worker, cursor: CursorState) {
  const map: Array<[string, 'rect' | 'ellipse' | 'line' | 'arrow']> = [
    ['btn-insert-shape-rect', 'rect'],
    ['btn-insert-shape-ellipse', 'ellipse'],
    ['btn-insert-shape-line', 'line'],
    ['btn-insert-shape-arrow', 'arrow'],
  ];
  for (const [id, shape] of map) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (!btn) continue;
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', () => {
      worker.postMessage({
        type: 'EDIT_INSERT_SHAPE',
        payload: { paragraphIndex: cursor.docIdx, charIndex: cursor.charIndex, shape },
      });
    });
  }

  const container = document.getElementById('editor-container');
  if (container) {
    container.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement | null;
      const shapeEl = target?.closest?.('.doc-shape') as HTMLElement | null;
      if (shapeEl) {
        const idx = parseInt(shapeEl.dataset.pIdx || '', 10);
        console.log('[shape-space-debug][shape-mousedown]', { idx, pIdxAttr: shapeEl.dataset.pIdx, placement: shapeEl.dataset.placement });
        if (Number.isFinite(idx)) {
          setSelectedShapeDocIdx(idx);
          const sel = document.getElementById('shape-placement-select') as HTMLSelectElement | null;
          if (sel) sel.value = shapeEl.dataset.placement || 'default';
        }
        // 도형 선택 시 브라우저의 비정상 caret 이동/선택을 막되 에디터 포커스는 유지
        e.preventDefault();
        e.stopPropagation();
        container.focus();
      } else {
        if (selectedShapeDocIdx != null) console.log('[shape-space-debug][shape-mousedown] clear selection (non-shape click)');
        setSelectedShapeDocIdx(null);
      }
    });
  }

  const placementSelect = document.getElementById('shape-placement-select') as HTMLSelectElement | null;
  if (placementSelect) {
    placementSelect.addEventListener('mousedown', (e) => e.stopPropagation());
    placementSelect.addEventListener('change', () => {
      const idx = getSelectedShapeDocIdx();
      if (idx == null) return;
      const placement = (placementSelect.value as 'default' | 'front' | 'back') || 'default';
      worker.postMessage({ type: 'EDIT_SHAPE_PLACEMENT', payload: { docIdx: idx, placement } });
    });
  }
}

export function initNewDocument(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  void container;
  void worker;
  void cursor;
  const btn = document.getElementById('btn-new-file') as HTMLButtonElement | null;
  if (!btn) return;
  btn.addEventListener('click', () => {
    // 현재 탭은 유지하고, 새 탭에서 빈 문서를 연다.
    const url = new URL(window.location.href);
    url.search = '?new=1';
    url.hash = '';
    window.open(url.toString(), '_blank');
  });
}

function activateRibbonTab(tab: string) {
  document.querySelectorAll<HTMLElement>('.ribbon-tab[data-tab-target]').forEach((el) => {
    el.classList.toggle('active', el.dataset.tabTarget === tab);
  });
  document.querySelectorAll<HTMLElement>('.ribbon-panel[data-tab]').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
}

export function initRibbonTabs() {
  document.querySelectorAll<HTMLElement>('.ribbon-tab[data-tab-target]').forEach((el) => {
    el.addEventListener('click', () => {
      const tab = el.dataset.tabTarget;
      if (tab) activateRibbonTab(tab);
    });
  });
}

export function initTableProperties(container: HTMLDivElement, worker: Worker) {
  const group = document.getElementById('ribbon-group-table-props') as HTMLDivElement | null;
  const btnDefault = document.getElementById('btn-table-border-default') as HTMLButtonElement | null;
  const btnNone = document.getElementById('btn-table-border-none') as HTMLButtonElement | null;
  const btnNoV = document.getElementById('btn-table-border-no-v') as HTMLButtonElement | null;
  if (!group || !btnDefault || !btnNone || !btnNoV) return;

  const apply = (borderStyle: TableBorderStyle) => {
    const tableDocIdx = getActiveTableDocIdx(container);
    if (tableDocIdx == null) return;
    worker.postMessage({ type: 'EDIT_TABLE_BORDER', payload: { tableDocIdx, borderStyle } });
  };

  const bind = (btn: HTMLButtonElement, style: TableBorderStyle) => {
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', () => apply(style));
  };
  bind(btnDefault, 'default');
  bind(btnNone, 'none');
  bind(btnNoV, 'no-vertical');

  window.addEventListener('table-context-change', () => syncTablePropertiesRibbon(container));
}

export function syncTablePropertiesRibbon(container?: HTMLDivElement) {
  const group = document.getElementById('ribbon-group-table-props') as HTMLDivElement | null;
  if (!group) return;
  const tableDocIdx = getActiveTableDocIdx(container);
  group.style.display = tableDocIdx != null ? '' : 'none';

  const btnDefault = document.getElementById('btn-table-border-default') as HTMLButtonElement | null;
  const btnNone = document.getElementById('btn-table-border-none') as HTMLButtonElement | null;
  const btnNoV = document.getElementById('btn-table-border-no-v') as HTMLButtonElement | null;
  [btnDefault, btnNone, btnNoV].forEach((b) => b?.classList.remove('active'));
  if (tableDocIdx == null) return;

  let borderStyle: TableBorderStyle = 'default';
  outer: for (const page of getCachedPages() as any[]) {
    const items = Array.isArray(page) ? page : (page as any).items;
    if (!items) continue;
    for (const item of items) {
      if (item && item.type === 'table' && (item as any)._docIdx === tableDocIdx) {
        borderStyle = ((item as any).borderStyle as TableBorderStyle) || 'default';
        break outer;
      }
    }
  }
  const activeBtn = borderStyle === 'none' ? btnNone : borderStyle === 'no-vertical' ? btnNoV : btnDefault;
  activeBtn?.classList.add('active');
}

async function openRecentFileByName(name: string) {
  const worker = recentWorker;
  const containerEl = recentContainer;
  if (!worker || !containerEl) return;
  const status = document.getElementById('hwp-status') as HTMLSpanElement | null;
  try {
    const handle = await getRecentHandle(name);
    if (handle) {
      const ok = await verifyReadPermission(handle);
      if (ok) {
        const file = await handle.getFile();
        await loadDocumentFile(file, handle, worker, containerEl);
        return;
      }
    }
  } catch {
    /* 권한/핸들 실패 시 폴백 */
  }
  // 핸들이 없거나 권한이 없으면 파일 대화상자 폴백
  if (status) status.textContent = `저장된 접근 권한이 없어 파일을 선택해 주세요: ${name}`;
  (document.getElementById('file-input') as HTMLInputElement | null)?.click();
}

function ensureRecentFilesNav(select: HTMLSelectElement) {
  if (select.dataset.navInit === '1') return;
  select.dataset.navInit = '1';
  select.addEventListener('change', () => {
    const name = select.value;
    if (!name) return;
    void openRecentFileByName(name).finally(() => {
      select.value = '';
    });
  });
}

export function refreshRecentFiles() {
  const select = document.getElementById('recent-files-select') as HTMLSelectElement | null;
  if (!select) return;
  ensureRecentFilesNav(select);
  const files = getRecentEntries();
  select.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = files.length === 0 ? '최근 사용한 파일 없음' : '최근 사용한 파일';
  select.appendChild(placeholder);
  files.forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    opt.title = name;
    select.appendChild(opt);
  });
  select.disabled = files.length === 0;
}

export function initRecentFiles(worker?: Worker, containerEl?: HTMLDivElement) {
  if (worker) recentWorker = worker;
  if (containerEl) recentContainer = containerEl;
  refreshRecentFiles();
}

export function initPageMargins(worker: Worker) {
  const ids = {
    top: 'margin-top-input',
    bottom: 'margin-bottom-input',
    left: 'margin-left-input',
    right: 'margin-right-input',
  } as const;
  const pxToMm = (px: number) => Math.round((px * 25.4 / 96) * 10) / 10;
  const mmToPx = (mm: number) => (mm * 96) / 25.4;
  const get = (k: keyof typeof ids) => document.getElementById(ids[k]) as HTMLInputElement | null;

  const sync = () => {
    const m = loadSettings().pageMargins;
    (['top', 'bottom', 'left', 'right'] as const).forEach((k) => {
      const el = get(k);
      if (el) el.value = String(pxToMm(m[k]));
    });
  };
  sync();

  const apply = () => {
    const cur = loadSettings().pageMargins;
    const read = (k: keyof typeof ids, fb: number) => {
      const v = parseFloat(get(k)?.value ?? '');
      if (!Number.isFinite(v)) return fb;
      return Math.max(0, Math.min(300, mmToPx(v)));
    };
    const next = {
      top: read('top', cur.top),
      bottom: read('bottom', cur.bottom),
      left: read('left', cur.left),
      right: read('right', cur.right),
    };
    // 본문 영역이 최소 크기를 유지하도록 보정
    if (next.left + next.right > 700) { next.left = cur.left; next.right = cur.right; }
    if (next.top + next.bottom > 1000) { next.top = cur.top; next.bottom = cur.bottom; }
    saveSettings({ pageMargins: next });
    setPageMargins(next);
    worker.postMessage({ type: 'SET_PAGE_MARGINS', payload: next });
    sync();
    window.dispatchEvent(new CustomEvent('page-margins-change'));
  };

  document.getElementById('btn-apply-margins')?.addEventListener('click', apply);
  (['top', 'bottom', 'left', 'right'] as const).forEach((k) => {
    get(k)?.addEventListener('keydown', (e) => { if (e.key === 'Enter') apply(); });
  });
}

type FindPosMsg = { docIdx: number; charIndex: number; isInsideTable: boolean; rowIndex: number; cellIndex: number };
type MatchMsg = FindPosMsg & { length: number };

let lastFindFrom: FindPosMsg | null = null;
let lastFindQuery = '';

function locateInElement(root: Element, modelIndex: number): { node: Node; offset: number } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let tn = walker.nextNode();
  let remaining = Math.max(0, modelIndex);
  let lastText: Node | null = null;
  let lastLen = 0;
  while (tn) {
    const t = tn.textContent || '';
    const modelLen = t.length - Array.from(t).filter((ch) => ch.charCodeAt(0) === 0x200b).length;
    lastText = tn;
    lastLen = t.length;
    if (remaining <= modelLen) return { node: tn, offset: Math.min(remaining, t.length) };
    remaining -= modelLen;
    tn = walker.nextNode();
  }
  if (lastText) return { node: lastText, offset: lastLen };
  return null;
}

function locateParagraphOffset(container: HTMLElement, docIdx: number, charIndex: number): { node: Node; offset: number } | null {
  const matches = Array.from(container.querySelectorAll(`p[data-p-idx="${docIdx}"]`)) as HTMLParagraphElement[];
  let target: HTMLParagraphElement | null = null;
  for (const m of matches) {
    const off = parseInt(m.dataset.pOffset || '0', 10);
    const len = m.textContent?.length || 0;
    if (charIndex >= off) target = m;
    if (charIndex <= off + len) break;
  }
  target = target || matches[0] || null;
  if (!target) return null;
  const fragOffset = parseInt(target.dataset.pOffset || '0', 10);
  return locateInElement(target, charIndex - fragOffset);
}

function selectModelMatch(container: HTMLElement, cursor: CursorState, match: MatchMsg) {
  cursor.docIdx = match.docIdx;
  cursor.charIndex = match.charIndex;
  cursor.charOffset = 0;
  cursor.isInsideTable = !!match.isInsideTable;
  cursor.rowIndex = match.rowIndex || 0;
  cursor.cellIndex = match.cellIndex || 0;

  const sel = window.getSelection();
  if (!sel) return;
  let start: { node: Node; offset: number } | null = null;
  let end: { node: Node; offset: number } | null = null;

  if (match.isInsideTable) {
    const table = container.querySelector(`table[data-p-idx="${match.docIdx}"]`) as HTMLTableElement | null;
    const cell = table?.querySelectorAll('tr')[match.rowIndex]?.querySelectorAll('td')[match.cellIndex] as HTMLElement | undefined;
    if (cell) {
      start = locateInElement(cell, match.charIndex);
      end = locateInElement(cell, match.charIndex + (match.length || 0));
      const page = cell.closest('.page') as HTMLElement | null;
      if (page?.dataset.pageNumber) cursor.pageNumber = parseInt(page.dataset.pageNumber, 10) || 0;
    }
  } else {
    start = locateParagraphOffset(container, match.docIdx, match.charIndex);
    end = locateParagraphOffset(container, match.docIdx, match.charIndex + (match.length || 0));
    const p = (start?.node as any)?.parentElement?.closest?.('p') as HTMLElement | null;
    const page = p?.closest('.page') as HTMLElement | null;
    if (page?.dataset.pageNumber) cursor.pageNumber = parseInt(page.dataset.pageNumber, 10) || 0;
  }

  if (start && end) {
    try {
      sel.setBaseAndExtent(start.node, start.offset, end.node, end.offset);
      (start.node.parentElement as HTMLElement | null)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } catch {
      /* ignore */
    }
  } else if (start) {
    const r = document.createRange();
    r.setStart(start.node, start.offset);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
  }
}

export function initViewOptions() {
  const checkbox = document.getElementById('show-para-marks-checkbox') as HTMLInputElement | null;
  if (!checkbox) return;
  const apply = (on: boolean) => {
    document.getElementById('editor-container')?.classList.toggle('show-para-marks', on);
    // 미리보기에서는 문단부호를 표시하지 않음
    document.getElementById('preview-container')?.classList.remove('show-para-marks');
  };
  const initial = !!loadSettings().showParaMarks;
  checkbox.checked = initial;
  apply(initial);
  checkbox.addEventListener('change', () => {
    const on = checkbox.checked;
    saveSettings({ showParaMarks: on });
    apply(on);
  });
}

export function initFindReplace(worker: Worker, cursor?: CursorState, container?: HTMLDivElement) {
  const root = container || (document.getElementById('editor-container') as HTMLDivElement | null);
  if (!root) return;
  const status = () => document.getElementById('hwp-status') as HTMLSpanElement | null;
  const findInput = () => document.getElementById('find-text-input') as HTMLInputElement | null;
  const replaceInput = () => document.getElementById('replace-text-input') as HTMLInputElement | null;
  const curCursor = cursor || ({ docIdx: 0, charIndex: 0, charOffset: 0, isInsideTable: false, rowIndex: 0, cellIndex: 0, pageNumber: 0 } as CursorState);

  const fromPos = (): FindPosMsg => lastFindFrom || {
    docIdx: curCursor.docIdx,
    charIndex: curCursor.charIndex,
    isInsideTable: !!curCursor.isInsideTable,
    rowIndex: curCursor.rowIndex || 0,
    cellIndex: curCursor.cellIndex || 0,
  };

  worker.addEventListener('message', (event: MessageEvent<any>) => {
    const msg = event.data;
    if (msg?.type === 'FIND_RESULT') {
      const { found, match } = msg.payload || {};
      if (found && match) {
        selectModelMatch(root, curCursor, match as MatchMsg);
        lastFindFrom = { docIdx: match.docIdx, charIndex: match.charIndex, isInsideTable: !!match.isInsideTable, rowIndex: match.rowIndex || 0, cellIndex: match.cellIndex || 0 };
        if (status()) status()!.textContent = '찾음';
      } else {
        lastFindFrom = null;
        if (status()) status()!.textContent = '찾는 내용이 없습니다';
      }
    } else if (msg?.type === 'REPLACE_RESULT') {
      const { replaced, next } = msg.payload || {};
      if (replaced && next) {
        selectModelMatch(root, curCursor, next as MatchMsg);
        lastFindFrom = { docIdx: next.docIdx, charIndex: next.charIndex, isInsideTable: !!next.isInsideTable, rowIndex: next.rowIndex || 0, cellIndex: next.cellIndex || 0 };
        if (status()) status()!.textContent = '바꾸기 완료';
      } else if (replaced) {
        lastFindFrom = null;
        if (status()) status()!.textContent = '바꾸기 완료';
      } else {
        if (status()) status()!.textContent = '찾는 내용이 없습니다';
      }
    } else if (msg?.type === 'REPLACE_ALL_RESULT') {
      const count = msg.payload?.count ?? 0;
      lastFindFrom = null;
      if (status()) status()!.textContent = count > 0 ? `모두 바꾸기: ${count}건` : '찾는 내용이 없습니다';
    }
  });

  const runFind = () => {
    const q = findInput()?.value ?? '';
    if (!q) { if (status()) status()!.textContent = '찾을 내용을 입력하세요'; return; }
    if (q !== lastFindQuery) { lastFindQuery = q; lastFindFrom = null; }
    worker.postMessage({ type: 'EDIT_FIND', payload: { query: q, from: fromPos(), direction: 'forward' } });
  };
  const runReplace = () => {
    const q = findInput()?.value ?? '';
    if (!q) return;
    if (q !== lastFindQuery) { lastFindQuery = q; lastFindFrom = null; }
    worker.postMessage({ type: 'EDIT_REPLACE', payload: { query: q, replacement: replaceInput()?.value ?? '', from: fromPos() } });
  };
  const runReplaceAll = () => {
    const q = findInput()?.value ?? '';
    if (!q) return;
    worker.postMessage({ type: 'EDIT_REPLACE_ALL', payload: { query: q, replacement: replaceInput()?.value ?? '' } });
  };

  document.getElementById('btn-find-next')?.addEventListener('click', runFind);
  document.getElementById('btn-replace')?.addEventListener('click', runReplace);
  document.getElementById('btn-replace-all')?.addEventListener('click', runReplaceAll);
  findInput()?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); runFind(); } });
  replaceInput()?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); runReplace(); } });
  findInput()?.addEventListener('input', () => { lastFindFrom = null; lastFindQuery = ''; });
}

function getSaveFn(lower: string) {
  if (/\.hwpx$/i.test(lower)) return saveCurrentHwpxDocument;
  if (/\.docx$/i.test(lower)) return saveCurrentDocumentDocx;
  if (/\.odt$/i.test(lower)) return saveCurrentDocument;
  return saveCurrentDocumentHwp;
}

async function runSave(worker: Worker, saveAs: boolean) {
  const filename = getCurrentFileName();
  const lower = filename.toLowerCase();
  const saveFn = getSaveFn(lower);
  const result = await saveFn(worker, filename, { saveAs, handle: currentFileHandle });
  currentFileHandle = result.handle ?? null;
  if (result.filename) setCurrentFileName(result.filename);
  if (result.filename) await addRecentEntry(result.filename, currentFileHandle);
  refreshRecentFiles();
}

export function initSave(worker: Worker) {
  document.getElementById('btn-save')?.addEventListener('click', () => {
    runSave(worker, false).catch(() => {});
  });
}

export function initSaveAs(worker: Worker) {
  document.getElementById('btn-save-as')?.addEventListener('click', () => {
    runSave(worker, true).catch(() => {});
  });
}
