import type { DocumentModel, DocumentItem, ParagraphNode, TableNode, TableRowNode, FontMetrics } from '../types';

// 출력용 페이지 모델은 이제 단락과 표가 혼합될 수 있습니다.
export type PageModel = DocumentItem[];

let documentState: DocumentModel = [];
let fontMetrics: FontMetrics = {};

const PAGE_MAX_HEIGHT = 780; // 26의 배수 (상하 균형 보정값)
const LINE_HEIGHT = 26;      
const EDITOR_MAX_WIDTH = 680;

// 표 계산을 위한 레이아웃 상수
const TABLE_CELL_PADDING = 16; // 셀 내부 좌우 패딩 합산 (8px * 2)
const TABLE_BORDER_HEIGHT = 1; // 셀 테두리 선 두께

self.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  if (message.type === 'INIT_METRICS') {
    fontMetrics = message.payload;
  } else if (message.type === 'INIT_DOC') {
    documentState = message.payload;
    runLayoutEngine();
  }
});

// [핵심] 단락과 표를 모두 계산하는 통합 레이아웃 엔진
function runLayoutEngine() {
  if (Object.keys(fontMetrics).length === 0) return;

  const pages: PageModel[] = [];
  let currentPage: PageModel = [];
  let currentHeight = 0;

  documentState.forEach((item) => {
    // ----------------------------------------------------
    // CASE A: 단락(Paragraph) 레이아웃 연산
    // ----------------------------------------------------
    if (item.type === 'paragraph') {
      const text = item.children[0]?.text || '';
      const isBold = item.children[0]?.bold || false;

      const lines = splitTextIntoLines(text, EDITOR_MAX_WIDTH);
      let currentParagraphLines: string[] = [];

      lines.forEach((line) => {
        if (currentHeight + LINE_HEIGHT > PAGE_MAX_HEIGHT) {
          if (currentParagraphLines.length > 0) {
            currentPage.push({ type: 'paragraph', children: [{ text: currentParagraphLines.join(''), bold: isBold }] });
          }
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
          currentParagraphLines = [line];
        } else {
          currentParagraphLines.push(line);
        }
        currentHeight += LINE_HEIGHT;
      });

      if (currentParagraphLines.length > 0) {
        currentPage.push({ type: 'paragraph', children: [{ text: currentParagraphLines.join(''), bold: isBold }] });
      }
    } 
    // ----------------------------------------------------
    // CASE B: 표(Table) 레이아웃 연산 (행 단위 분할 처리)
    // ----------------------------------------------------
    else if (item.type === 'table') {
      let currentTableInPage: TableNode = { type: 'table', rows: [] };

      item.rows.forEach((row) => {
        // 1. 행에 속한 모든 셀들의 내부 가로폭 계산 및 행 전체 높이 구하기
        // 현재는 3열 고정형 표로 가정하여 가로폭을 균등 분할 (680px / 3 ≒ 226px)
        const cellWidth = EDITOR_MAX_WIDTH / row.cells.length;
        let maxRowLines = 1;

        row.cells.forEach((cell) => {
          const cellText = cell.children[0]?.text || '';
          // 셀 내부 실질 텍스트 가용폭은 셀 너비에서 좌우 패딩을 제외한 크기
          const cellLines = splitTextIntoLines(cellText, cellWidth - TABLE_CELL_PADDING);
          if (cellLines.length > maxRowLines) {
            maxRowLines = cellLines.length;
          }
        });

        // 행의 총 세로 픽셀 높이 = (가장 긴 셀의 줄 수 * 줄 높이) + 테두리 두께
        const rowHeight = (maxRowLines * LINE_HEIGHT) + TABLE_BORDER_HEIGHT;

        // 2. 페이지 세로 한계선 검증 및 행 단위 넘김 처리
        if (currentHeight + rowHeight > PAGE_MAX_HEIGHT) {
          // 기존에 쌓이던 표가 있다면 현재 페이지에 마감 처리
          if (currentTableInPage.rows.length > 0) {
            currentPage.push(currentTableInPage);
          }
          // 새로운 페이지 생성 및 초기화
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
          
          // 새 페이지에서 표 다시 시작
          currentTableInPage = { type: 'table', rows: [row] };
          currentHeight += rowHeight;
        } else {
          currentTableInPage.rows.push(row);
          currentHeight += rowHeight;
        }
      });

      // 단락/표 순회가 끝난 후 남아있는 잔여 행들이 있다면 현재 페이지에 주입
      if (currentTableInPage.rows.length > 0) {
        currentPage.push(currentTableInPage);
      }
    }
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  self.postMessage({ type: 'RENDER_READY', payload: pages });
}

//  수정 완료 코드
function splitTextIntoLines(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLineText = '';
  let currentLineWidth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = fontMetrics[char] !== undefined ? fontMetrics[char] : fontMetrics['default_ko'];

    if (currentLineWidth + charWidth > maxWidth) {
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
  return lines;
}