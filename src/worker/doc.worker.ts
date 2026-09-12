import type { DocumentModel, DocumentItem, ParagraphNode, TableNode, FontMetrics } from '../types';

export type PageModel = DocumentItem[];

let documentState: DocumentModel = [];
let fontMetrics: FontMetrics = {};

const PAGE_MAX_HEIGHT = 780;
const LINE_HEIGHT = 26;
const EDITOR_MAX_WIDTH = 680;
const TABLE_CELL_PADDING = 16;
const TABLE_BORDER_HEIGHT = 1;

self.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  if (message.type === 'INIT_METRICS') {
    fontMetrics = message.payload;
  } else if (message.type === 'INIT_DOC') {
    documentState = message.payload;
    runLayoutEngine();
  } else if (message.type === 'EDIT_INSERT') {
    editInsert(message.payload.paragraphIndex, message.payload.charIndex, message.payload.text);
  } else if (message.type === 'EDIT_DELETE') {
    editDelete(message.payload.paragraphIndex, message.payload.charIndex);
  } else if (message.type === 'EDIT_SPLIT') {
    editSplit(message.payload.paragraphIndex, message.payload.charIndex);
  }
});

function editInsert(docIdx: number, charIndex: number, text: string) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  const fullText = item.children[0]?.text || '';
  const before = fullText.slice(0, charIndex);
  const after = fullText.slice(charIndex);
  item.children[0] = { text: before + text + after, bold: item.children[0]?.bold };
  runLayoutEngine();
}

function editDelete(docIdx: number, charIndex: number) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  const fullText = item.children[0]?.text || '';
  if (charIndex <= 0) return;
  const before = fullText.slice(0, charIndex - 1);
  const after = fullText.slice(charIndex);
  item.children[0] = { text: before + after, bold: item.children[0]?.bold };
  runLayoutEngine();
}

function editSplit(docIdx: number, charIndex: number) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  const fullText = item.children[0]?.text || '';
  const before = fullText.slice(0, charIndex);
  const after = fullText.slice(charIndex);
  documentState[docIdx] = { type: 'paragraph', children: [{ text: before, bold: item.children[0]?.bold }] };
  documentState.splice(docIdx + 1, 0, { type: 'paragraph', children: [{ text: after, bold: item.children[0]?.bold }] });
  runLayoutEngine();
}

function runLayoutEngine() {
  if (Object.keys(fontMetrics).length === 0) return;

  const pages: PageModel[] = [];
  let currentPage: PageModel = [];
  let currentHeight = 0;

  documentState.forEach((item, idx) => {
    if (item.type === 'paragraph') {
      const text = item.children[0]?.text || '';
      const isBold = item.children[0]?.bold || false;

      const lines = splitTextIntoLines(text, EDITOR_MAX_WIDTH);
      let currentParagraphLines: string[] = [];
      let charOffset = 0;

      lines.forEach((line) => {
        if (currentHeight + LINE_HEIGHT > PAGE_MAX_HEIGHT) {
          if (currentParagraphLines.length > 0) {
            const fragText = currentParagraphLines.join('');
            const fragment: ParagraphNode = { type: 'paragraph', children: [{ text: fragText, bold: isBold }], _docIdx: idx, _charOffset: charOffset };
            currentPage.push(fragment);
            charOffset += fragText.length;
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
        const fragText = currentParagraphLines.join('');
        const fragment: ParagraphNode = { type: 'paragraph', children: [{ text: fragText, bold: isBold }], _docIdx: idx, _charOffset: charOffset };
        currentPage.push(fragment);
      }
    } else if (item.type === 'table') {
      let currentTableInPage: TableNode = { type: 'table', rows: [], _docIdx: idx };

      item.rows.forEach((row) => {
        const cellWidth = EDITOR_MAX_WIDTH / row.cells.length;
        let maxRowLines = 1;

        row.cells.forEach((cell) => {
          const cellText = cell.children[0]?.text || '';
          const cellLines = splitTextIntoLines(cellText, cellWidth - TABLE_CELL_PADDING);
          if (cellLines.length > maxRowLines) {
            maxRowLines = cellLines.length;
          }
        });

        const rowHeight = (maxRowLines * LINE_HEIGHT) + TABLE_BORDER_HEIGHT;

        if (currentHeight + rowHeight > PAGE_MAX_HEIGHT) {
          if (currentTableInPage.rows.length > 0) {
            currentPage.push(currentTableInPage);
          }
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;

          currentTableInPage = { type: 'table', rows: [row], _docIdx: idx };
          currentHeight += rowHeight;
        } else {
          currentTableInPage.rows.push(row);
          currentHeight += rowHeight;
        }
      });

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
