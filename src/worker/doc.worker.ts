import type { DocumentModel, ParagraphNode } from '../types';

export type PageModel = ParagraphNode[];
export type RenderMessage = { type: 'RENDER_READY'; payload: PageModel[] };

let documentState: DocumentModel = [];
const PAGE_MAX_HEIGHT = 800; 
const ESTIMATED_LINE_HEIGHT = 24; 

self.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;

  // main.ts의 발송 타입과 정상 매칭
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
  }
});

function runLayoutEngine() {
  const pages: PageModel[] = [];
  let currentPage: PageModel = [];
  let currentHeight = 0;

  documentState.forEach((paragraph) => {
    const textLength = paragraph.children.reduce((acc, run) => acc + run.text.length, 0);
    const estimatedLines = Math.max(1, Math.ceil(textLength / 60)); 
    const paragraphHeight = estimatedLines * ESTIMATED_LINE_HEIGHT + 16; 

    if (currentHeight + paragraphHeight > PAGE_MAX_HEIGHT && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(paragraph);
    currentHeight += paragraphHeight;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  const renderMessage: RenderMessage = { type: 'RENDER_READY', payload: pages };
  self.postMessage(renderMessage);
}