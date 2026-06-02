import type { DocumentModel, FontMetrics } from './types';
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

let savedCursor = { paragraphIndex: 0, charIndex: 0 };

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


worker.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  if (message.type === 'RENDER_READY') {
    console.groupCollapsed(`🎨 [Main UI] 화면 렌더링 검증`);
    renderPages(message.payload);
    
    // 렌더링된 첫 번째 페이지의 실제 DOM 높이 측정 로그
    const firstPage = containerEl.querySelector('.page') as HTMLDivElement;
    if (firstPage) {
      console.log(`- 가상 A4 고정 높이(CSS): ${firstPage.offsetHeight}px`);
      console.log(`- 실제 내부 콘텐츠 총 높이(ScrollHeight): ${firstPage.scrollHeight}px`);
    }
    
    restoreCursorPosition();
    console.groupEnd();
  }
});

// renderPages 및 기타 이벤트 리스너 코드는 기존 구조 유지


function renderPages(pages: PageModel[]) {
  containerEl.innerHTML = ''; 
  let globalParagraphIndex = 0;

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
    });

    containerEl.appendChild(pageEl);
  });
}

// 커서 관리 로직 (기존 유지)
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
  let targetParagraph = containerEl.querySelector(`p[data-p-idx="${savedCursor.paragraphIndex}"]`);
  if (!targetParagraph) targetParagraph = containerEl.querySelector(`p[data-p-idx]`);
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

// 이벤트 리스너 설정
containerEl.addEventListener('keydown', (e: KeyboardEvent) => {
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
  e.preventDefault(); 
  saveCursorPosition();
  if (e.data) {
    worker.postMessage({ type: 'EDIT_INSERT', payload: { paragraphIndex: savedCursor.paragraphIndex, charIndex: savedCursor.charIndex, text: e.data } });
    savedCursor.charIndex += e.data.length;
  }
});

document.addEventListener('selectionchange', () => {
  if (document.activeElement?.closest('#editor-container')) saveCursorPosition();
});

// 초기화 가동
function initWordProcessor() {
  // 1. 에디터 스타일과 일치하는 폰트 메트릭스 계산 (16px Arial 기준)
  const fontMetrics = generateFontMetrics('16px Arial');
  worker.postMessage({ type: 'INIT_METRICS', payload: fontMetrics });

  // 2. 대용량 초기 데이터 생성
  const largeDummyData: DocumentModel = [];
  for (let i = 1; i <= 15; i++) {
    largeDummyData.push({
      type: 'paragraph',
      children: [
        { text: `[단락 ${i}] 메인 스레드에서 Canvas API로 정밀하게 실측한 폰트 너비 맵(Font Metrics Map)을 바탕으로 웹 워커 내부에서 정확한 가로 길이 연산을 수행하고 있습니다. 이제 영문 i처럼 좁은 글자와 한글처럼 넓은 글자가 혼합되어 있어도 글자가 쪼개지거나 단어가 중간에 부러지는 현상 없이 브라우저의 렌더링 결과와 완벽하게 일치하는 라인 단위 페이지 분할이 가능합니다. 직접 텍스트를 추가하거나 엔터를 쳐보세요. ` }
      ]
    });
  }

  worker.postMessage({ type: 'INIT_DOC', payload: largeDummyData });
}

initWordProcessor();