import type { CursorState, DocumentModel, FontMetrics, TableNode } from './types';
import { appendStreamPages, findCursorPageIndex, initRenderer, renderVirtualPages, updateVisiblePages } from './render';
import { initEditorListeners, initHwpFileOpen, initSelectionListener, initViewportScrollListener, initWorkerListener } from './listener';

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
  cellIndex: 0
};

// 1. 커서 위치 저장 보고화
function saveCursorPosition() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer;
  
  const currentParagraph = startContainer.parentElement?.closest('p');
  const currentCell = startContainer.parentElement?.closest('td');

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
    savedCursor.charIndex = range.startOffset + savedCursor.charOffset;
  }
}

// 2. 커서 위치 복원 고도화
function restoreCursorPosition() {
  const selection = window.getSelection();
  if (!selection) return;

  // [가상화] 커서가 있는 페이지를 먼저 마운트
  const cursorPage = findCursorPageIndex(savedCursor.docIdx);
  if (cursorPage >= 0) updateVisiblePages(cursorPage);

  let targetTextNode: Node | null = null;
  let targetLength = 0;
  let targetOffset = 0;

  if (savedCursor.isInsideTable) {
    const targetTable = containerEl.querySelector(`table[data-p-idx="${savedCursor.docIdx}"]`) as HTMLTableElement | null;
    if (targetTable) {
      const rows = targetTable.querySelectorAll('tr');
      const targetRow = rows[savedCursor.rowIndex];
      if (targetRow) {
        const cells = targetRow.querySelectorAll('td');
        const targetCell = cells[savedCursor.cellIndex];
        if (targetCell) {
          const span = targetCell.querySelector('span');
          targetTextNode = span?.firstChild || null;
          targetLength = span?.textContent?.length || 0;
          targetOffset = Math.min(savedCursor.charIndex, targetLength);
        }
      }
    }
  } else {
    const matches = Array.from(containerEl.querySelectorAll(`p[data-p-idx="${savedCursor.docIdx}"]`) as NodeListOf<HTMLParagraphElement>);
    let targetParagraph: HTMLParagraphElement | null = null;
    if (matches.length <= 1) {
      targetParagraph = matches[0] || containerEl.querySelector('p[data-p-idx]') as HTMLParagraphElement;
    } else {
      targetParagraph = matches.find(p => parseInt(p.dataset.pOffset || '0', 10) === savedCursor.charOffset) || matches[0];
    }

    if (targetParagraph) {
      const span = targetParagraph.querySelector('span');
      targetTextNode = span?.firstChild || null;
      const fragOffset = parseInt(targetParagraph.dataset.pOffset || '0', 10);
      targetOffset = Math.min(savedCursor.charIndex - fragOffset, (span?.textContent?.length || 0));
      targetOffset = Math.max(0, targetOffset);
    }
  }

  if (targetTextNode && targetTextNode.nodeType === Node.TEXT_NODE) {
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



function initWordProcessor() {
  const fontMetrics = generateFontMetrics('16px Arial');
  worker.postMessage({ type: 'INIT_METRICS', payload: fontMetrics });

  // 기본 문서: dev 실행 시 public의 입법예고 HWP를 바로 로드 (실패 시 더미로 폴백)
  /*
  const defaultHwpUrl = encodeURI('/입법예고(울산광역시+남구+구세+조례+일부개정조례안).hwp');
  fetch(defaultHwpUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((buffer) => {
      const model = parseHwpToDocumentModel(new Uint8Array(buffer));
      worker.postMessage({ type: 'INIT_DOC', payload: model });
      containerEl.style.display = 'inline-flex';
    })
    .catch((err: Error) => {
      worker.postMessage({ type: 'INIT_DOC', payload: buildMockDocument() });
      const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement | null;
      if (hwpStatus) hwpStatus.textContent = `기본 문서 로드 실패, 더미 표시: ${err.message}`;
    });
    */
      worker.postMessage({ type: 'INIT_DOC', payload: buildMockDocument() });
    
}

// 🧪 [시나리오] 3페이지 이상의 분량을 유도하는 대형 표 데이터 (기본 문서 로드 실패 시 폴백)
function buildMockDocument(): DocumentModel {
  const mockDocument: DocumentModel = [
    {
      type: 'paragraph',
      align: 'center',
      children: [{ text: "표 레이아웃 엔진 테스트: 아래 표는 행 단위로 페이지를 분할합니다. 특정 행의 높이가 페이지의 남은 여백보다 크면, 해당 행은 통째로 다음 페이지로 넘어갑니다.", bold: true }]
    }
  ];

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

  
  for (let i = 1; i <= 100; i++) {
    // 5번째 행마다 매우 긴 텍스트를 넣어 높이 변화를 줌
    const isLongRow = i % 5 === 0;
    const detailText = isLongRow 
      ? `[고높이 행 테스트] 이 행은 텍스트가 매우 길게 작성되었습니다. 웹 워커는 이 텍스트가 680px 너비 내에서 몇 줄을 차지하는지 계산하고, 그에 따른 행의 높이가 현재 페이지의 남은 높이(PAGE_MAX_HEIGHT)를 초과하는지 실시간으로 감시합니다. 만약 초과한다면 이 행은 다음 페이지 최상단으로 이동해야 합니다.`
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

  // 표 이후에 오는 단락 테스트
  mockDocument.push({
    type: 'paragraph',
    children: [{ text: "표가 끝난 뒤에도 레이아웃 엔진은 멈추지 않고 남은 공간에 단락을 배치합니다. 만약 표가 페이지 끝에서 딱 맞게 끝났다면 이 문장은 다음 페이지 처음에 나타납니다." }]
  });

  return mockDocument;
}

initRenderer(containerEl);
initWordProcessor();
initHwpFileOpen(worker, containerEl);
initWorkerListener(worker, (pages) => {
  renderVirtualPages(pages, true);
  restoreCursorPosition();
}, (pages) => {
  appendStreamPages(pages);
});
initViewportScrollListener(() => updateVisiblePages());
initSelectionListener(() => saveCursorPosition());
initEditorListeners(containerEl, worker, savedCursor, saveCursorPosition);