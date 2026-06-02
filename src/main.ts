import type { DocumentModel } from './types';
import type { PageModel } from './worker/doc.worker';

// 1. 웹 워커 초기화
const worker = new Worker(new URL('./worker/doc.worker.ts', import.meta.url), {
  type: 'module'
});

const containerEl = document.getElementById('editor-container') as HTMLDivElement;

let savedCursor = {
  paragraphIndex: 0,
  charIndex: 0
};

// 커서 위치 저장 및 복원 로직 (기존 유지)
function saveCursorPosition() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const currentParagraph = range.startContainer.parentElement?.closest('p');
  
  if (currentParagraph && currentParagraph.dataset.pIdx) {
    savedCursor.paragraphIndex = parseInt(currentParagraph.dataset.pIdx, 10);
    savedCursor.charIndex = range.startOffset;
  }
}

function restoreCursorPosition() {
  const selection = window.getSelection();
  if (!selection) return;

  const targetParagraph = containerEl.querySelector(`p[data-p-idx="${savedCursor.paragraphIndex}"]`);
  if (!targetParagraph) return;

  const textNode = targetParagraph.querySelector('span')?.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  const range = document.createRange();
  const offset = Math.min(savedCursor.charIndex, textNode.textContent?.length || 0);
  
  range.setStart(textNode, offset);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
}

// 2. 워커 결과 수신 및 렌더링
worker.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  if (message.type === 'RENDER_READY') {
    renderPages(message.payload);
    restoreCursorPosition(); // 편집 중 리렌더링 시 커서 복원
  }
});

function renderPages(pages: PageModel[]) {
  containerEl.innerHTML = ''; 
  let globalParagraphIndex = 0;

  pages.forEach((pageData, pIndex) => {
    const pageEl = document.createElement('div');
    pageEl.className = 'page';
    pageEl.dataset.pageNumber = (pIndex + 1).toString();
    pageEl.contentEditable = 'true'; // 개별 페이지 편집 가능 설정

    pageData.forEach((paragraph) => {
      const p = document.createElement('p');
      p.dataset.pIdx = globalParagraphIndex.toString();
      
      paragraph.children.forEach((run) => {
        const span = document.createElement('span');
        span.innerText = run.text || '\u200B'; 
        if (run.bold) span.style.fontWeight = 'bold';
        p.appendChild(span);
      });
      
      pageEl.appendChild(p);
      globalParagraphIndex++;
    });

    containerEl.appendChild(pageEl);
  });
}

// 3. 사용자 타이핑 인터셉트 및 워커로 전달
containerEl.addEventListener('beforeinput', (e: InputEvent) => {
  e.preventDefault(); 
  saveCursorPosition();

  if (e.data) {
    worker.postMessage({
      type: 'EDIT_INSERT',
      payload: {
        paragraphIndex: savedCursor.paragraphIndex,
        charIndex: savedCursor.charIndex,
        text: e.data
      }
    });
    savedCursor.charIndex += e.data.length;
  }
});

document.addEventListener('selectionchange', () => {
  if (document.activeElement?.closest('#editor-container')) {
    saveCursorPosition();
  }
});

// 4. [수정됨] 페이지 로드 즉시 실행되는 초기화 함수 (자동 로드)
function initWordProcessor() {
  const largeDummyData: DocumentModel = [];
  
  // 실행되자마자 150개의 대용량 단락 자동 생성
  for (let i = 1; i <= 150; i++) {
    largeDummyData.push({
      type: 'paragraph',
      children: [
        { 
          text: `[단락 ${i}] 페이지가 로드되자마자 백그라운드의 웹 워커를 통해 자동으로 연산된 텍스트입니다. 이 긴 텍스트 문서들은 UI 스레드의 중단 없이 완벽하게 분할되어 브라우저 화면에 A4 용지 서식으로 나열됩니다. 원하는 곳을 클릭하여 타이핑을 해보세요. `,
          bold: i % 5 === 0 
        }
      ]
    });
  }

  // 즉시 웹 워커로 데이터 발송
  worker.postMessage({ type: 'INIT_DOC', payload: largeDummyData });
}

// 애플리케이션 시작
initWordProcessor();
