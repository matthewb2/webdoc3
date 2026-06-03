import type { DocumentModel, FontMetrics, TableNode } from './types';
import type { PageModel } from './worker/doc.worker';

const worker = new Worker(new URL('./worker/doc.worker.ts', import.meta.url), {
  type: 'module'
});


// 최외곽 스크롤 뷰포트 내부에서 에디터 컨테이너 참조하도록 유지
const containerEl = document.getElementById('editor-container') as HTMLDivElement;

// 모바일 터치 입력 환경에서 스크롤 도중 선택 영역 추적이 끊기지 않도록 selectionchange 이벤트 보완
document.addEventListener('selectionchange', () => {
  // 현재 포커스된 엘리먼트가 에디터 컨테이너 내부에 있는지 검증
  if (document.activeElement?.closest('#editor-container')) {
    saveCursorPosition();
  }
});


// [핵심] 한글 조합 상태를 기억할 플래그 변수
let isComposing = false;

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
worker.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  if (message.type === 'RENDER_READY') {
    renderPages(message.payload); // 화면을 다시 그리고
    restoreCursorPosition();      // [필수] 고도화된 커서 위치를 복원하여 깜빡임 유지!
  }
});

function renderPages(pages: PageModel[]) {
  containerEl.innerHTML = ''; 

  // 안전장치: pages가 배열이 아니거나 비어있으면 중단
  if (!Array.isArray(pages)) return;

  pages.forEach((pageData, pIndex) => {
    // 안전장치: pageData가 배열이 아니면 패스
    if (!Array.isArray(pageData)) return;

    const pageEl = document.createElement('div');
    pageEl.className = 'page';
    pageEl.contentEditable = 'true';
    pageEl.dataset.pageNumber = (pIndex + 1).toString();

    pageData.forEach((item, itemIdx) => {
      if (!item) return; // null/undefined 방어

      // 1. 단락 렌더링
      if (item.type === 'paragraph') {
        const p = document.createElement('p');
        p.dataset.pIdx = itemIdx.toString(); // 커서 위치 저장/복원을 위한 인덱스
        // children이 없을 경우를 대비해 기본값 빈 배열 처리
        const children = item.children || [];
        children.forEach((run) => {
          const span = document.createElement('span');
          span.innerText = run.text === '' ? '\u200B' : run.text;
          if (run.bold) span.style.fontWeight = 'bold';
          p.appendChild(span);
        });
        pageEl.appendChild(p);
      } 
      // 2. 표(Table) 렌더링
      else if (item.type === 'table') {
        const table = document.createElement('table');
        // rows가 없을 경우를 대비해 기본값 빈 배열 처리
        const rows = item.rows || [];
        
        rows.forEach((row) => {
          if (!row) return; // row가 undefined일 경우 방어
          const tr = document.createElement('tr');
          
          // ⚠️ 오류 발생 지점 방어: cells가 없으면 빈 배열로 대체
          const cells = row.cells || [];
          
          cells.forEach((cell) => {
            if (!cell) return;
            const td = document.createElement('td');
            // 셀의 폭 분배 (안전하게 분모가 0이 되는 것 방지)
            const cellCount = cells.length || 1;
            td.style.width = `${680 / cellCount}px`;
            
            const cellChildren = cell.children || [];
            const span = document.createElement('span');
            span.innerText = cellChildren[0]?.text || '';
            
            td.appendChild(span);
            tr.appendChild(td);
          });
          
          table.appendChild(tr);
        });
        
        pageEl.appendChild(table);
      }
    });

    containerEl.appendChild(pageEl);
  });
}

// [수정] 단락과 표 내부 셀을 모두 추적할 수 있도록 확장된 커서 상태 구조
let savedCursor = { 
  paragraphIndex: 0, 
  charIndex: 0,
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
  
  // 현재 커서가 위치한 가장 가까운 블록 요소 찾기
  const currentParagraph = startContainer.parentElement?.closest('p');
  const currentCell = startContainer.parentElement?.closest('td');

  if (currentCell) {
    // A. 표 내부 셀(td)에 커서가 있는 경우
    const currentTR = currentCell.closest('tr');
    const currentTable = currentCell.closest('table');
    const currentPage = currentCell.closest('.page');
    
    if (currentTR && currentTable && currentPage) {
      savedCursor.isInsideTable = true;
      savedCursor.charIndex = range.startOffset;
      
      // 행(Row)과 열(Cell) 인덱스 추출
      savedCursor.rowIndex = Array.from(currentTable.querySelectorAll('tr')).indexOf(currentTR);
      savedCursor.cellIndex = Array.from(currentTR.querySelectorAll('td')).indexOf(currentCell);
      
      // 전역 아이템 인덱스 매핑을 위해 페이지 내 테이블 위치 파악
      const allItems = Array.from(currentPage.querySelectorAll('p, table'));
      savedCursor.paragraphIndex = allItems.indexOf(currentTable);
    }
  } else if (currentParagraph && currentParagraph.dataset.pIdx) {
    // B. 일반 단락(p)에 커서가 있는 경우
    savedCursor.isInsideTable = false;
    savedCursor.paragraphIndex = parseInt(currentParagraph.dataset.pIdx, 10);
    savedCursor.charIndex = range.startOffset;
  }
}

// 2. 커서 위치 복원 고도화
function restoreCursorPosition() {
  const selection = window.getSelection();
  if (!selection) return;

  let targetTextNode: Node | null = null;
  let targetLength = 0;

  if (savedCursor.isInsideTable) {
    // A. 표 내부 커서 복원 프로세스
    // 전역 매핑된 테이블을 먼저 탐색
    const allPages = Array.from(containerEl.querySelectorAll('.page'));
    let targetTable: HTMLTableElement | null = null;
    
    // 페이지 전체를 순회하며 매칭되는 가상 순서의 테이블 탐색
    for (const page of allPages) {
      const items = Array.from(page.querySelectorAll('p, table'));
      if (items[savedCursor.paragraphIndex] && items[savedCursor.paragraphIndex].nodeName === 'TABLE') {
        targetTable = items[savedCursor.paragraphIndex] as HTMLTableElement;
        break;
      }
    }

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
        }
      }
    }
  } else {
    // B. 일반 단락 커서 복원 프로세스
    let targetParagraph = containerEl.querySelector(`p[data-p-idx="${savedCursor.paragraphIndex}"]`);
    if (!targetParagraph) targetParagraph = containerEl.querySelector(`p[data-p-idx]`);
    
    if (targetParagraph) {
      const span = targetParagraph.querySelector('span');
      targetTextNode = span?.firstChild || null;
      targetLength = span?.textContent?.length || 0;
    }
  }

  // 🎯 최종 텍스트 노드에 포커스 바인딩 및 커서 노출
  if (targetTextNode && targetTextNode.nodeType === Node.TEXT_NODE) {
    const range = document.createRange();
    const offset = Math.min(savedCursor.charIndex, targetLength);
    
    try {
      range.setStart(targetTextNode, offset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      console.warn("커서 범위 설정 보정 활성화");
    }
  }
}

// 1. 한글 글자 조합이 시작됨을 감지 (ex: 'ㄱ'을 누르는 순간)
containerEl.addEventListener('compositionstart', () => {
  isComposing = true;
});

// 2. 한글 글자 조합이 완료됨을 감지 (ex: '가'를 쓰고 다음 글자로 넘어가거나 스페이스를 누를 때)
containerEl.addEventListener('compositionend', (e: CompositionEvent) => {
  isComposing = false;
  
  // 글자가 완성되었으므로, 최종 완성된 글자를 워커로 전송하여 레이아웃을 다시 계산합니다.
  if (e.data) {
    saveCursorPosition();
    // 조합 중간에 들어간 임시 글자 offset을 고려하여 워커에 삽입 요청
    worker.postMessage({ 
      type: 'EDIT_INSERT', 
      payload: { 
        paragraphIndex: savedCursor.paragraphIndex, 
        charIndex: savedCursor.charIndex - e.data.length, // 이미 DOM에 입력된 길이를 보정
        text: e.data 
      } 
    });
  }
});

containerEl.addEventListener('keydown', (e: KeyboardEvent) => {
  // 한글 조합 중 엔터를 치는 경우 컴포지션 종료와 충돌하지 않도록 방어
  if (isComposing) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    saveCursorPosition();
    worker.postMessage({ type: 'EDIT_SPLIT', payload: { paragraphIndex: savedCursor.paragraphIndex, charIndex: savedCursor.charIndex } });
    savedCursor.paragraphIndex += 1;
    savedCursor.charIndex = 0;
  }
});

containerEl.addEventListener('beforeinput', (e: InputEvent) => {
  if (e.inputType === 'insertLineBreak') return e.preventDefault();
  
  // [핵심] 한글 조합 중(isComposing === true)일 때는 브라우저의 기본 입력을 절대 막지(preventDefault) 않습니다.
  // 이렇게 해야 브라우저 고유의 한글 조합창이 유지되어 자모 분리가 일어나지 않습니다.
  if (isComposing) return;

  // 영문, 숫자, 스페이스바 등 일반 입력은 기존처럼 워커를 통해 즉시 처리합니다.
  if (e.data) {
    e.preventDefault(); 
    saveCursorPosition();
    worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: savedCursor.paragraphIndex, charIndex: savedCursor.charIndex, text: e.data } });
    savedCursor.charIndex += e.data.length;
  }
});

function initWordProcessor() {
  const fontMetrics = generateFontMetrics('16px Arial');
  worker.postMessage({ type: 'INIT_METRICS', payload: fontMetrics });

  // 🧪 [시나리오] 3페이지 이상의 분량을 유도하는 대형 표 데이터
  const mockDocument: DocumentModel = [
    {
      type: 'paragraph',
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

  // 25개의 행을 생성하여 여러 페이지에 걸치도록 함
  for (let i = 1; i <= 25; i++) {
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

  // 워커에 데이터 전송
  worker.postMessage({ type: 'INIT_DOC', payload: mockDocument });
}

initWordProcessor();