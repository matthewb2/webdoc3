import type { DocumentModel, ParagraphNode, TextRun } from '../types';

export type PageModel = ParagraphNode[];

let documentState: DocumentModel = [];
const PAGE_MAX_HEIGHT = 800; // A4 용지 가상 최대 높이
const LINE_HEIGHT = 24;      // 라인당 높이
const CHARS_PER_LINE = 60;   // 한 줄에 들어가는 가상 글자 수 (폰트 너비 대용)

self.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  // ... INIT_DOC, EDIT_INSERT, EDIT_SPLIT 핸들러 구조는 기존과 동일하게 유지
  if (message.type === 'INIT_DOC' || message.type === 'LOAD_DUMMY') {
    documentState = message.payload;
    runLayoutEngine();
  } else if (message.type === 'EDIT_INSERT') {
    const { paragraphIndex, charIndex, text } = message.payload;
    const paragraph = documentState[paragraphIndex];
    if (paragraph && paragraph.children[0]) {
      const run = paragraph.children[0];
      run.text = run.text.slice(0, charIndex) + text + run.text.slice(charIndex);
    }
    runLayoutEngine();
  } else if (message.type === 'EDIT_SPLIT') {
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
  }
});

// ... 상단 타입 정의 및 변수 유지

function runLayoutEngine() {
  console.time('⏳ [Worker] 레이아웃 엔진 총 연산 시간');
  
  const pages: PageModel[] = [];
  let currentPage: PageModel = [];
  let currentHeight = 0;

  console.log(`\n━━━ 🚀 [Worker] 레이아웃 분할 시작 (총 단락 수: ${documentState.length}) ━━━`);

  documentState.forEach((paragraph, pIdx) => {
    const text = paragraph.children[0]?.text || '';
    const isBold = paragraph.children[0]?.bold || false;

    // 1. 단락의 텍스트 분할 로그
    const lines: string[] = [];
    for (let i = 0; i < text.length; i += CHARS_PER_LINE) {
      lines.push(text.slice(i, i + CHARS_PER_LINE));
    }
    if (lines.length === 0) lines.push('');

    let currentParagraphLines: string[] = [];

    lines.forEach((line, lIdx) => {
      const lineHeightWithMargin = LINE_HEIGHT;

      // 페이지 초과 검사 및 로그
      if (currentHeight + lineHeightWithMargin > PAGE_MAX_HEIGHT) {
        console.warn(`[Page Split] 🚨 현재 페이지(${pages.length + 1}) 높이 초과 (${currentHeight}px + ${lineHeightWithMargin}px > ${PAGE_MAX_HEIGHT}px)`);
        console.log(` -> ✂️ 원본 단락 [Index: ${pIdx}] 가 [Line: ${lIdx}] 지점에서 분할됩니다.`);
        console.log(` -> 잘린 이전 문장: "${currentParagraphLines.join('').slice(-15)}..."`);
        console.log(` -> 넘어간 다음 문장: "...${line.slice(0, 15)}"`);

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
        currentHeight += lineHeightWithMargin;
      } else {
        currentParagraphLines.push(line);
        currentHeight += lineHeightWithMargin;
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

  console.log(`📦 [Worker] 분할 완료 -> 생성된 총 페이지 수: ${pages.length}장`);
  console.timeEnd('⏳ [Worker] 레이아웃 엔진 총 연산 시간');

  self.postMessage({ type: 'RENDER_READY', payload: pages });
}