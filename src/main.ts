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

  // 워커가 라인을 쪼개면서 pIdx가 미세하게 밀릴 수 있으므로 가장 근접한 엘리먼트 매칭
  let targetParagraph = containerEl.querySelector(`p[data-p-idx="${savedCursor.paragraphIndex}"]`);
  
  // 만약 정확한 단락을 못 찾으면 이전 단락이나 첫 단락으로 포커스 안전장치
  if (!targetParagraph) {
    targetParagraph = containerEl.querySelector(`p[data-p-idx]`);
  }
  if (!targetParagraph) return;

  const textNode = targetParagraph.querySelector('span')?.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  const range = document.createRange();
  // 잘려나간 라인의 길이에 맞춰 안전한 오프셋 제한
  const maxLen = textNode.textContent?.length || 0;
  const offset = Math.min(savedCursor.charIndex, maxLen);
  
  range.setStart(textNode, offset);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
}

// ... 상단 커서 변수 및 포지션 함수 유지

worker.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  if (message.type === 'RENDER_READY') {
    console.groupCollapsed('🎨 [Main UI] 워커 데이터 수신 및 렌더링 시작');
    console.log(`수신된 총 페이지 데이터 구조:`, message.payload);
    
    renderPages(message.payload);
    
    console.log(`현재 커서 임시 기억 장치 위치: 단락 Index [${savedCursor.paragraphIndex}], 글자 Offset [${savedCursor.charIndex}]`);
    restoreCursorPosition();
    console.groupEnd();
  }
});

function renderPages(pages: PageModel[]) {
  containerEl.innerHTML = ''; 
  let globalParagraphIndex = 0;
  let totalRenderedParagraphs = 0;

  pages.forEach((pageData, pIndex) => {
    const pageEl = document.createElement('div');
    pageEl.className = 'page';
    pageEl.dataset.pageNumber = (pIndex + 1).toString();
    pageEl.contentEditable = 'true';

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
      totalRenderedParagraphs++;
    });

    containerEl.appendChild(pageEl);
  });

  console.log(`[DOM Render 완료] 화면에 그려진 총 <p> 태그 수: ${totalRenderedParagraphs}개`);
}

// 1. 키보드 이벤트 리스너 추가 (엔터 키 감지)
containerEl.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // 브라우저 고유의 줄바꿈 기능 차단

    saveCursorPosition(); // 현재 커서 위치(단락 인덱스, 글자 인덱스) 확보

    // 워커에게 단락 분할 요청 전송
    worker.postMessage({
      type: 'EDIT_SPLIT',
      payload: {
        paragraphIndex: savedCursor.paragraphIndex,
        charIndex: savedCursor.charIndex
      }
    });

    // 엔터를 치면 커서는 다음 단락의 0번째 글자 위치로 이동해야 함
    savedCursor.paragraphIndex += 1;
    savedCursor.charIndex = 0;
  }
});

// beforeinput 이벤트는 기존 글자 입력용으로 유지
containerEl.addEventListener('beforeinput', (e: InputEvent) => {
  // 엔터 이벤트는 keydown에서 처리하므로, 여기서는 글자 입력(insertText) 등만 처리
  if (e.inputType === 'insertLineBreak') {
    e.preventDefault();
    return;
  }

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

// ... 하단 initWordProcessor 등 기존 코드 유지
// 4. [수정됨] 페이지 로드 즉시 실행되는 초기화 함수 (자동 로드)
function initWordProcessor() {
  const largeDummyData: DocumentModel = [];
  
  // 실행되자마자 150개의 대용량 단락 자동 생성
  for (let i = 1; i <= 15; i++) {
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
