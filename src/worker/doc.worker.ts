import type { DocumentModel, ParagraphNode, FontMetrics } from '../types';

export type PageModel = ParagraphNode[];

let documentState: DocumentModel = [];
let fontMetrics: FontMetrics = {};

// 에디터 레이아웃 상수 정의 (픽셀 단위)
// 26의 배수인 780으로 조정 (정확히 30줄이 들어가면 패딩 경계선에 딱 맞춤)
const PAGE_MAX_HEIGHT = 780;

const LINE_HEIGHT = 26;         // 라인당 높이 (16px 폰트 + line-height 고려)
const EDITOR_MAX_WIDTH = 680;   // 페이지 패딩(60px * 2)을 제외한 가로 실사 가용 폭 (800 - 120 = 680)

self.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;

  switch (message.type) {
    case 'INIT_METRICS':
      fontMetrics = message.payload;
      break;

    case 'INIT_DOC':
      documentState = message.payload;
      runLayoutEngine();
      break;

    case 'EDIT_INSERT': {
      const { paragraphIndex, charIndex, text } = message.payload;
      const paragraph = documentState[paragraphIndex];
      if (paragraph && paragraph.children[0]) {
        const run = paragraph.children[0];
        run.text = run.text.slice(0, charIndex) + text + run.text.slice(charIndex);
      }
      runLayoutEngine();
      break;
    }

    case 'EDIT_SPLIT': {
      const { paragraphIndex, charIndex } = message.payload;
      const targetParagraph = documentState[paragraphIndex];
      if (targetParagraph && targetParagraph.children[0]) {
        const originalText = targetParagraph.children[0].text;
        targetParagraph.children[0].text = originalText.slice(0, charIndex);
        documentState.splice(paragraphIndex + 1, 0, {
          type: 'paragraph',
          children: [{ text: originalText.slice(charIndex), bold: targetParagraph.children[0].bold }]
        });
      }
      runLayoutEngine();
      break;
    }
  }
});

// ... 상단 변수 및 이벤트 리스너 구조 유지

function runLayoutEngine() {
  if (Object.keys(fontMetrics).length === 0) return;

  const pages: PageModel[] = [];
  let currentPage: PageModel = [];
  let currentHeight = 0;

  console.log(`\n%c━━━ 📐 [Worker Layout Engine] 정밀 세로 공간 분석 시작 ━━━`, "color: #1a73e8; font-weight: bold;");

  documentState.forEach((paragraph, pIdx) => {
    const text = paragraph.children[0]?.text || '';
    const isBold = paragraph.children[0]?.bold || false;

    // 1. 가로 Word-Wrap 계산
    const lines: string[] = [];
    let currentLineText = '';
    let currentLineWidth = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charWidth = fontMetrics[char] !== undefined ? fontMetrics[char] : fontMetrics['default_ko'];

      if (currentLineWidth + charWidth > EDITOR_MAX_WIDTH) {
        lines.push(currentLineText);
        currentLineText = char;
        currentLineWidth = charWidth;
      } else {
        currentLineText += char;
        currentLineWidth += charWidth;
      }
    }
    if (currentLineText.length > 0) lines.push(currentLineText);
    if (lines.length === 0) lines.push('');

    // 2. 세로 라인 배치 및 여백 디버깅
    let currentParagraphLines: string[] = [];

    lines.forEach((line, lIdx) => {
      // 페이지 초과 검사
      if (currentHeight + LINE_HEIGHT > PAGE_MAX_HEIGHT) {
        const unusedSpace = PAGE_MAX_HEIGHT - currentHeight;
        
        console.group(`%c📄 [Page ${pages.length + 1} 마감] 하단 한계 도달`, "color: #e67e22; font-weight: bold;");
        console.log(`- 현재 단락 Index: ${pIdx}, 라인 번호: ${lIdx}`);
        console.log(`- 마감 직전 누적 높이: ${currentHeight}px (최대 제한: ${PAGE_MAX_HEIGHT}px)`);
        console.log(`- %c남겨진 하단 빈 여백(오차 공간): ${unusedSpace}px`, "color: #e74c3c; font-weight: bold;");
        console.log(`- 다음 줄 내용: "${line.slice(0, 15)}..."`);
        console.groupEnd();

        if (currentParagraphLines.length > 0) {
          currentPage.push({
            type: 'paragraph',
            children: [{ text: currentParagraphLines.join(''), bold: isBold }]
          });
        }
        
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;

        currentParagraphLines = [line];
        currentHeight += LINE_HEIGHT;
      } else {
        currentParagraphLines.push(line);
        currentHeight += LINE_HEIGHT;
      }
    });

    if (currentParagraphLines.length > 0) {
      currentPage.push({
        type: 'paragraph',
        children: [{ text: currentParagraphLines.join(''), bold: isBold }]
      });
    }
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  console.log(`%c📦 [Engine Result] 총 ${pages.length}개 페이지 생성 완료.`, "color: #2ecc71; font-weight: bold;");
  self.postMessage({ type: 'RENDER_READY', payload: pages });
}
