import type { CursorState, DocumentModel, FontMetrics } from './types';
import type { PageModel } from './worker/doc.worker';
import { defaultFontFamily, defaultUiFontFamily, initSettings, loadSettings } from './settings';
import { collectProbeItems, computeBreaks } from './probe';
import { appendStreamPages, findCursorPageIndices, initRenderer, renderVirtualPages, updateVisiblePages } from './render';
import { clearPendingSelection, initAlignCombo, initColorControls, initColumnCombo, initEditorListeners, initFontCombos, initFileOpen, initSave, initSelectionListener, initStyleButtons, initViewportScrollListener, initWorkerListener, initZoomControls, isComposingActive, refreshZoomLayout, setAwaitingRender, syncAlignCombo, syncColorControls, syncColumnCombo, syncFontCombos, syncStyleButtons, takePendingSelection } from './listener';

const worker = new Worker(new URL('./worker/doc.worker.ts', import.meta.url), {
  type: 'module'
});


// 최외곽 스크롤 뷰포트 내부에서 에디터 컨테이너 참조하도록 유지
const containerEl = document.getElementById('editor-container') as HTMLDivElement;


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

// src/main.ts 중반부 메시지 리스너 확인


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
  if (!selection || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer;
  const startEl = startContainer.nodeType === Node.TEXT_NODE
    ? startContainer.parentElement
    : (startContainer as Element);

  const currentParagraph = startEl?.closest('p');
  const currentCell = startEl?.closest('td');

  if (currentCell) {
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
    }
  } else if (currentParagraph && currentParagraph.dataset.pIdx) {
    savedCursor.isInsideTable = false;
    savedCursor.docIdx = parseInt(currentParagraph.dataset.pIdx, 10);
    savedCursor.charOffset = parseInt(currentParagraph.dataset.pOffset || '0', 10);
    // 단락 시작부터 캐럿까지의 실제 텍스트 길이로 계산 (span 경계를 초월, ''런 ZWSP 제외)
    const pre = document.createRange();
    pre.selectNodeContents(currentParagraph);
    try {
      pre.setEnd(startContainer, range.startOffset);
    } catch {
      savedCursor.charIndex = savedCursor.charOffset;
      return;
    }
    const raw = pre.toString();
    let zwsp = 0;
    for (const ch of raw) if (ch === '\u200B') zwsp++;
    savedCursor.charIndex = (raw.length - zwsp) + savedCursor.charOffset;
  }

  const currentPage = startEl?.closest('.page') as HTMLElement | null;
  if (currentPage?.dataset.pageNumber) {
    savedCursor.pageNumber = parseInt(currentPage.dataset.pageNumber, 10);
  }
  console.log(`[save] docIdx=${savedCursor.docIdx} charIndex=${savedCursor.charIndex}`);
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

  const placeInElement = (root: Element, modelIndex: number) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let tn = walker.nextNode();
    let remaining = Math.max(0, modelIndex);
    let lastText: Node | null = null;
    let lastLen = 0;
    while (tn) {
      const t = tn.textContent || '';
      let zw = 0;
      for (const ch of t) if (ch === '\u200B') zw++;
      const modelLen = t.length - zw;
      lastText = tn;
      lastLen = t.length;
      if (remaining <= modelLen) {
        targetTextNode = tn;
        targetOffset = Math.min(remaining, t.length);
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
      const modelLen = t.length - Array.from(t).filter((ch) => ch.charCodeAt(0) === 0x200b).length;
      lastText = tn;
      lastLen = t.length;
      if (remaining <= modelLen) {
        return { node: tn, offset: Math.min(remaining, t.length) };
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
      console.warn("커서 범위 설정 보정 활성화");
    }
  }
}



async function initWordProcessor() {
  await initSettings();
  document.documentElement.style.setProperty('--doc-font', `"${defaultFontFamily()}"`);
  document.documentElement.style.setProperty('--ui-font', `"${defaultUiFontFamily()}"`);
  worker.postMessage({ type: 'INIT_SETTINGS', payload: { charShape: loadSettings().charShape } });
  const fontMetrics = generateFontMetrics(`16px "${defaultFontFamily()}", Arial`);
  worker.postMessage({ type: 'INIT_METRICS', payload: fontMetrics });

  // 기본 문서: dev 실행 시 public의 입법예고 HWP를 바로 로드 (실패 시 더미로 폴백)
  /*
  const defaultHwpUrl = encodeURI('/입법예고(울산광역시+남구+구세+조례+일부개정조례안).hwp');
  fetch(defaultHwpUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then(async (buffer) => {
      const model = parseHwpToDocumentModel(new Uint8Array(buffer));
      worker.postMessage({ type: 'BREAKS', payload: await computeBreaks(collectProbeItems(model)) });
      worker.postMessage({ type: 'INIT_DOC', payload: model });
      containerEl.style.display = 'inline-flex';
    })
    .catch((err: Error) => {
      worker.postMessage({ type: 'INIT_DOC', payload: buildMockDocument() });
      const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement | null;
      if (hwpStatus) hwpStatus.textContent = `기본 문서 로드 실패, 더미 표시: ${err.message}`;
    });
    */
      const mockModel = buildMockDocument();
      worker.postMessage({ type: 'BREAKS', payload: await computeBreaks(collectProbeItems(mockModel)) });
      worker.postMessage({ type: 'INIT_DOC', payload: mockModel });
}

// 🧪 [시나리오] 3페이지 이상의 분량을 유도하는 대형 표 데이터 (기본 문서 로드 실패 시 폴백)
function buildMockDocument(): DocumentModel {
  const mockDocument: DocumentModel = [
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    }
  ];
  /*
  // 1. 대형 사양 명세 표 생성
  const tableNode: TableNode = { type: 'table', rows: [] };

  // 헤더 행 추가
  tableNode.rows.push({
    type: 'table-row',
    cells: [
      { type: 'table-cell', children: [{ text: "분류", bold: true }] },
      { type: 'table-cell', children: [{ text: "상세 내용 명세", bold: true }] },
      { type: 'table-cell', children: [{ text: "비고", bold: true }] }
    ]
  });

  
  for (let i = 1; i <= 10; i++) {
    // 5번째 행마다 매우 긴 텍스트를 넣어 높이 변화를 줌
    const isLongRow = i % 5 === 0;
    const detailText = isLongRow 
      ? `[고높이 행 테스트] 이 행은 텍스트가 매우 길게 작성되었습니다. 웹 워커는 이 텍스트가 680px 너비 내에서 몇 줄을 차지하는지 계산하고, 그에 따른 행의 높이가 현재 페이지의 남은 높이(PAGE_MAX_HEIGHT)를 초과하는지 실시간으로 감시합니다.`
      : `일반적인 데이터를 포함하는 ${i}번째 데이터 행입니다.`;

    tableNode.rows.push({
      type: 'table-row',
      cells: [
        { type: 'table-cell', children: [{ text: `항목 ${i}` }] },
        { type: 'table-cell', children: [{ text: detailText }] },
        { type: 'table-cell', children: [{ text: isLongRow ? "중요" : "일반" }] }
      ]
    });
  }

  mockDocument.push(tableNode);
  */
  
  return mockDocument;
}

initRenderer(containerEl);
initWordProcessor();
initFileOpen(worker, containerEl);
let pendingPages: PageModel[] | null = null;

function applyReadyPages(pages: PageModel[]) {
  // 리마운트로 인한 스크롤 점프 방지: 렌더 전 위치를 복원한 뒤 커서 복원
  const viewport = document.querySelector('.editor-viewport') as HTMLDivElement | null;
  const prevTop = viewport ? viewport.scrollTop : 0;
  renderVirtualPages(pages, true);
  refreshZoomLayout(containerEl);
  if (viewport) viewport.scrollTop = prevTop;
  restoreCursorPosition();
  syncFontCombos();
  syncColumnCombo();
  syncAlignCombo();
  syncColorControls();
  syncStyleButtons();
  const pageCount = document.getElementById('page-count');
  if (pageCount) pageCount.textContent = `총 ${pages.length}페이지`;
}

function flushPendingRender() {
  if (pendingPages) {
    const stashed = pendingPages;
    pendingPages = null;
    applyReadyPages(stashed);
  }
}

initWorkerListener(worker, (pages) => {
  setAwaitingRender(false);
  // 조합 중에는 렌더를 보류 (조합 노드가 날아가 자모가 깨짐)
  if (isComposingActive()) {
    pendingPages = pages;
    return;
  }
  applyReadyPages(pages);
}, (pages) => {
  if (isComposingActive()) return;
  appendStreamPages(pages);
});
initViewportScrollListener(() => updateVisiblePages());
initSelectionListener(() => { clearPendingSelection(); saveCursorPosition(); syncFontCombos(); syncColumnCombo(); syncAlignCombo(); syncColorControls(); syncStyleButtons(); });
initEditorListeners(containerEl, worker, savedCursor, saveCursorPosition, flushPendingRender, () => { pendingPages = null; });
initFontCombos(containerEl, worker, savedCursor);
initColumnCombo(containerEl, worker, savedCursor);
initAlignCombo(containerEl, worker, savedCursor);
initColorControls(containerEl, worker, savedCursor);
initStyleButtons(containerEl, worker, savedCursor);
initZoomControls(containerEl);
initSave(worker);