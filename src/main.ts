import './css/main.css';
import './css/ribbon.css';
import './css/preview.css';
import type { CursorState, DocumentModel, FontMetrics, ParagraphNode, TableNode, TableRowNode } from './types';
import type { PageModel } from './layout/layout';
import { defaultFontFamily, defaultUiFontFamily, initSettings, loadSettings } from './settings';
import { setPageMargins } from './layout/layoutConstants';
import { collectProbeItems, computeBreaks } from './probe';
import { appendStreamPages, findCursorPageIndices, getCachedPages, initRenderer, renderVirtualPages, updateVisiblePages } from './render';
import { clearPendingSelection, initAlignCombo, initColorControls, initColumnCombo, initFindReplace, initFontCombos, initFileOpen, initLineSpacingCombo, initNewDocument, initPageMargins, initParagraphStyles, initRecentFiles, initRibbonTabs, initSave, initSaveAs, initSelectionListener, initShapeInsert, initStyleButtons, initTableInsert, initTableProperties, initViewOptions, initViewportScrollListener, initWorkerListener, initZoomControls, refreshZoomLayout, setAwaitingRender, setCurrentFileName, syncAlignCombo, syncColorControls, syncColumnCombo, syncFontCombos, syncLineSpacingCombo, syncStyleButtons, syncTablePropertiesRibbon, takePendingSelection } from './listener/listener';
import { initEditorListeners, isComposingActive, hasPendingInputState } from './listener/keyinput';
import { initCellSelection, paintCellSelection } from './listener/table';
import { initPreviewMode } from './preview';
import { ruler } from './ruler';
import { parseHwpToDocumentModel } from './hwp/hwpParser';
import { parseHwpxToDocumentModel } from './hwpx/hwpxParser';
import { createAppUI, showAppUI } from './ui';
import { createDocEngine } from './worker/docEngine';
import logoUrl from './assets/logo.svg';

// UI 요소를 TS에서 동적으로 생성 (프로그램 시작 시 버튼/탭바가 포함된 상태로 생성)
createAppUI();

// 타이틀바(탭) 로고
(function applyFavicon(): void {
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = logoUrl;
})();

// Single-thread document engine (replaces Web Worker to avoid async cursor/message desync)
const worker = createDocEngine() as unknown as Worker;

// 최외곽 스크롤 뷰포트 내부에서 에디터 컨테이너 참조하도록 유지
const containerEl = document.getElementById('editor-container') as HTMLDivElement;

// [추가] 초기 편집용지 완성 전까지 스피너 표시 및 컨테이너 숨김 처리
let isInitialReady = false;

function showStartupSpinner(): void {
  if (containerEl) {
    containerEl.style.display = 'none';
  }
  if (document.getElementById('startup-spinner-overlay')) return;

  const style = document.createElement('style');
  style.id = 'startup-spinner-style';
  style.textContent = `
    @keyframes doc3-spin {
      to { transform: rotate(360deg); }
    }
    #startup-spinner-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      background: rgba(243, 244, 246, 0.85);
      z-index: 9999;
      pointer-events: all;
    }
    #startup-spinner-overlay .spinner-ring {
      width: 36px;
      height: 36px;
      border: 3px solid #d1d5db;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: doc3-spin 0.75s linear infinite;
    }
    #startup-spinner-overlay .spinner-label {
      font-family: var(--ui-font, sans-serif);
      font-size: 13px;
      color: #4b5563;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'startup-spinner-overlay';
  overlay.innerHTML = `
    <div class="spinner-ring"></div>
    <div class="spinner-label">문서를 불러오는 중입니다...</div>
  `;

  const host = document.querySelector('.editor-viewport') || document.body;
  host.appendChild(overlay);
}

function hideStartupSpinner(): void {
  if (isInitialReady) return;
  isInitialReady = true;

  if (containerEl) {
    containerEl.style.display = 'inline-flex';
  }
  document.getElementById('startup-spinner-overlay')?.remove();
  document.getElementById('startup-spinner-style')?.remove();
  showAppUI();
}

// 앱 시작 즉시 스피너 호출
showStartupSpinner();

// [핵심] 브라우저 환경에서 폰트 너비를 측정하는 함수
function generateFontMetrics(fontStyle: string): FontMetrics {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return {};

  ctx.font = fontStyle;
  const metrics: FontMetrics = {};

  // 1. 기본 알파벳, 숫자, 특수문자 측정
  const ascii = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
  for (let i = 0; i < ascii.length; i++) {
    metrics[ascii[i]] = ctx.measureText(ascii[i]).width;
  }

  // 2. 자주 사용되는 한글 글자 샘플 및 기본 한글 너비 정의 (가변 너비 대응)
  // 한글 고딕/명조 계열은 대부분 글자당 너비가 동일하므로 대표 글자로 기본값 세팅
  const defaultKoreanWidth = ctx.measureText('가').width;
  metrics['default_ko'] = defaultKoreanWidth;

  return metrics;
}

// [수정] 단락과 표 내부 셀을 모두 추적할 수 있도록 확장된 커서 상태 구조
let savedCursor: CursorState = {
  docIdx: 0,
  charIndex: 0,
  charOffset: 0,
  isInsideTable: false,
  rowIndex: 0,
  cellIndex: 0,
  pageNumber: 0
};

// 1. 커서 위치 저장 보고화
function saveCursorPosition() {
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

  // 도형(비편집 블록) 등 문단/셀 밖에서 선택된 경우 인접 문단으로 보정
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

// 2. 커서 위치 복원 고도화
function restoreCursorPosition() {
  const selection = window.getSelection();
  if (!selection) return;

  // 툴바 조작으로 보관된 선택 영역이 있으면 양 끝 페이지를 먼저 마운트
  const pending = takePendingSelection();
  const mountPages = pending
    ? [...findCursorPageIndices(pending.anchor.docIdx), ...findCursorPageIndices(pending.focus.docIdx)]
    : findCursorPageIndices(savedCursor.docIdx);
  // [가상화] 커서가 있는 페이지를 먼저 마운트 (분할된 단락/표의 모든 조각)
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

  // 툴바 조작 전 선택 영역 복원 (범위 선택 유지)
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
    // 저장된 페이지의 표를 우선 탐색 (분할된 표의 조각 인덱스 일치 보장)
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
    // 분할 이동으로 조각 경계가 바뀌었을 수 있으므로 charIndex가 들어가는 조각을 범위로 탐색
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
    // 이미 같은 위치면 DOM을 건드리지 않음 (불필요한 스크롤·selectionchange 방지)
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

async function initWordProcessor() {
  await initSettings();
  const settings = loadSettings();
  setPageMargins(settings.pageMargins);
  document.documentElement.style.setProperty('--doc-font', `"${defaultFontFamily()}"`);
  document.documentElement.style.setProperty('--ui-font', `"${defaultUiFontFamily()}"`);
  worker.postMessage({ type: 'INIT_SETTINGS', payload: { charShape: settings.charShape, lineSpacing: settings.paraShape.lineSpacing, pageMargins: settings.pageMargins } });
  const fontMetrics = generateFontMetrics(`16px "${defaultFontFamily()}", Arial`);
  worker.postMessage({ type: 'INIT_METRICS', payload: fontMetrics });

  // ?new=1: 새 탭에서 빈 제목 없음.odt로 시작 (현재 탭은 유지)
  const openNew = new URLSearchParams(window.location.search).get('new') === '1';
  if (openNew) {
    const model: DocumentModel = [{ type: 'paragraph', children: [{ text: '' }] }];
    worker.postMessage({ type: 'BREAKS', payload: await computeBreaks(collectProbeItems(model)) });
    worker.postMessage({ type: 'INIT_DOC', payload: model });
    setCurrentFileName('제목 없음.odt');
    return;
  }

  // 기본 문서: 프로그램 시작 시 로드 (dev/Electron file:// 공용 상대 경로)
  const defaultDocName = '표준상가임대차계약서.hwp';
  const defaultDocUrl = encodeURI(`./${defaultDocName}`);
  fetch(defaultDocUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then(async (buffer) => {
      const bytes = new Uint8Array(buffer);
      const lower = defaultDocName.toLowerCase();
      const model = lower.endsWith('.hwpx')
        ? parseHwpxToDocumentModel(bytes)
        : lower.endsWith('.hwp')
          ? parseHwpToDocumentModel(bytes)
          : lower.endsWith('.docx')
            ? (await import('./docx/docxParser')).parseDocxToDocumentModel(bytes)
            : (await import('./odt/odtParser')).parseOdtToDocumentModel(bytes);
      worker.postMessage({ type: 'BREAKS', payload: await computeBreaks(collectProbeItems(model)) });
      worker.postMessage({ type: 'INIT_DOC', payload: model });
      setCurrentFileName(defaultDocName);
    })
    .catch(async (err: Error) => {
      console.warn(`기본 문서 로드 실패, 더미 표시: ${err.message}`);
      const mockModel = buildMockDocument();
      worker.postMessage({ type: 'BREAKS', payload: await computeBreaks(collectProbeItems(mockModel)) });
      worker.postMessage({ type: 'INIT_DOC', payload: mockModel });
    });
}

// [시나리오] 3페이지 이상의 분량을 유도하는 대형 표 데이터 (기본 문서 로드 실패 시 폴백)
// 표 분할 정밀 검증용: 짧은 행 + 장문 행(줄 단위 분할) + 거대 행(여러 페이지) + 짧은 행
function buildTableTest(): { title: ParagraphNode; table: TableNode; trailing: ParagraphNode } {
  const sent = (n: number) => `표 분할 검증 문장 ${n}번입니다. 행 높이에 따라 페이지 나눔이 달라집니다.`;
  const longCell = (count: number) => {
    const parts: string[] = [];
    for (let i = 1; i <= count; i++) parts.push(sent(i));
    return parts.join(' ');
  };
  const drow = (a: string, b: string, c: string, bold = false): TableRowNode => ({
    type: 'table-row',
    cells: [
      { type: 'table-cell', children: [{ text: a, ...(bold ? { bold: true } : {}) }] },
      { type: 'table-cell', children: [{ text: b, ...(bold ? { bold: true } : {}) }] },
      { type: 'table-cell', children: [{ text: c, ...(bold ? { bold: true } : {}) }] },
    ],
  });
  const rows: TableRowNode[] = [
    drow('분류', '상세 내용 명세', '비고', true),
  ];
  for (let i = 1; i <= 6; i++) rows.push(drow(`항목 ${i}`, `내용 ${i}번 행입니다.`, '일반'));
  rows.push(drow('항목 7(장문)', longCell(12), '중요'));
  rows.push(drow('항목 8', '내용 8번 행입니다.', '일반'));
  rows.push(drow('항목 9', '내용 9번 행입니다.', '일반'));
  rows.push(drow('항목 10(거대)', longCell(30), '중요'));
  rows.push(drow('항목 11', '내용 11번 행입니다.', '일반'));
  rows.push(drow('항목 12', '내용 12번 행입니다.', '일반'));
  return {
    title: { type: 'paragraph', align: 'center', children: [{ text: 'cell split test' }] },
    table: { type: 'table', rows },
    trailing: { type: 'paragraph', children: [{ text: 'after split paragraph' }] },
  };
}

function buildMockDocument(): DocumentModel {
  const mockDocument: DocumentModel = [
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    }, 
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    }, 
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    }, 
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    }, 
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    }, 
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    }
  ];

  const tableTest = buildTableTest();
  return [tableTest.title, tableTest.table, tableTest.trailing, ...mockDocument];
}

// 뷰포트가 준비되면 편집포트(에디터 컨테이너) 로드 직전에 눈금자를 초기화
const viewportEl = document.querySelector('.editor-viewport') as HTMLDivElement | null;
if (viewportEl) {
  ruler(worker);
} else {
  document.addEventListener('DOMContentLoaded', () => ruler(worker), { once: true });
}
initRenderer(containerEl);
initWordProcessor();
initRibbonTabs();
initPageMargins(worker);
initRecentFiles(worker, containerEl);
initViewOptions();
initFindReplace(worker, savedCursor, containerEl);
initNewDocument(containerEl, worker, savedCursor);
initFileOpen(worker, containerEl);
let pendingPages: PageModel[] | null = null;

function applyReadyPages(pages: PageModel[]) {
  hideStartupSpinner();

  // Keep scroll position stable across re-render.
  const viewport = document.querySelector('.editor-viewport') as HTMLDivElement | null;
  const prevTop = viewport ? viewport.scrollTop : 0;
  renderVirtualPages(pages, true);
  refreshZoomLayout(containerEl);
  if (viewport) viewport.scrollTop = prevTop;

  try {
    const p0 = (pages?.[0] || []).find((it: any) => it?.type === 'paragraph' && (it?._docIdx ?? 0) === 0) as any;
    const modelText = p0 ? (p0.children || []).map((r: any) => r?.text || '').join('') : null;
    const domP = containerEl.querySelector('p[data-p-idx="0"]') as HTMLElement | null;
    const domText = domP ? (domP.textContent || '').replace(/\u200B/g, '') : null;
    console.log('[ime-debug][applyReadyPages]', { modelText, domText, composing: isComposingActive(), hasPending: hasPendingInputState(), savedChar: savedCursor.charIndex });
  } catch {}

  // During optimistic buffered typing, model/DOM may lag behind local cursor state.
  // Restoring caret from model now can cause visible jumps; wait until input settles.
  if (!hasPendingInputState()) {
    restoreCursorPosition();
    syncFontCombos();
    syncColumnCombo();
    syncAlignCombo();
    syncColorControls();
    syncStyleButtons();
    syncLineSpacingCombo();
    updateCursorPage();
    paintCellSelection(containerEl);
    syncTablePropertiesRibbon(containerEl);
  } else {
    paintCellSelection(containerEl);
  }
}

// 상태바에 커서 위치 페이지 표시 (현재 / 전체)
function updateCursorPage() {
  const el = document.getElementById('cursor-page');
  if (!el) return;
  const total = getCachedPages().length;
  el.textContent = savedCursor.pageNumber > 0 ? `${savedCursor.pageNumber} / ${total}` : `- / ${total}`;
}

function flushPendingRender() {
  if (pendingPages) {
    const stashed = pendingPages;
    pendingPages = null;
    applyReadyPages(stashed);
  }
}

initWorkerListener(worker, (pages) => {
  try {
    const p0 = (pages?.[0] || []).find((it: any) => it?.type === 'paragraph' && (it?._docIdx ?? 0) === 0) as any;
    const modelText = p0 ? (p0.children || []).map((r: any) => r?.text || '').join('') : null;
    console.log('[ime-debug][RENDER_READY]', { modelText, composing: isComposingActive(), hasPending: hasPendingInputState(), pendingStash: !!pendingPages });
  } catch {}
  // Do not clear edit-await guard while optimistic/buffered typing is still in progress.
  if (!hasPendingInputState()) setAwaitingRender(false);
  if (isComposingActive()) {
    pendingPages = pages;
    return;
  }
  applyReadyPages(pages);
}, (pages) => {
  if (isComposingActive()) return;
  appendStreamPages(pages);
});
initViewportScrollListener(() => { updateVisiblePages(); paintCellSelection(containerEl); });
initSelectionListener(() => {
  clearPendingSelection();
  // During optimistic typing/buffered inserts, DOM selection may lag or be stale; do not overwrite model cursor.
  if (!hasPendingInputState()) saveCursorPosition();
  syncFontCombos();
  syncColumnCombo();
  syncAlignCombo();
  syncColorControls();
  syncStyleButtons();
  syncLineSpacingCombo();
  syncTablePropertiesRibbon(containerEl);
  updateCursorPage();
});
initEditorListeners(containerEl, worker, savedCursor, saveCursorPosition, flushPendingRender, () => { pendingPages = null; });
initFontCombos(containerEl, worker, savedCursor);
initColumnCombo(containerEl, worker, savedCursor);
initAlignCombo(containerEl, worker, savedCursor);
initLineSpacingCombo(containerEl, worker, savedCursor);
initColorControls(containerEl, worker, savedCursor);
initStyleButtons(containerEl, worker, savedCursor);
initParagraphStyles(containerEl, worker, savedCursor);
initTableInsert(containerEl, worker, savedCursor);
initShapeInsert(worker, savedCursor);
initCellSelection(containerEl, worker);
initTableProperties(containerEl, worker);
initZoomControls(containerEl);
initSave(worker);
initSaveAs(worker);
initPreviewMode();