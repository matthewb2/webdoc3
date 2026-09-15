import type { DocumentModel, DocumentItem, ParagraphNode, TableNode, FontMetrics, TextRun } from '../types';

export type PageModel = DocumentItem[];

let documentState: DocumentModel = [];
let fontMetrics: FontMetrics = {};

const PAGE_MAX_HEIGHT = 780;
const LINE_HEIGHT = 26;
const EDITOR_MAX_WIDTH = 680;
const TABLE_CELL_PADDING = 16;
const TABLE_BORDER_HEIGHT = 1;
const BASE_FONT_PX = 16;

type Glyph = { ch: string; run: TextRun };

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

let layoutRunId = 0;
const LAYOUT_CHUNK_ITEMS = 50;
const LAYOUT_CHUNK_BUDGET_MS = 12;

function runLayoutEngine() {
  if (Object.keys(fontMetrics).length === 0) return;

  const runId = ++layoutRunId;
  const totalItems = documentState.length;
  const pages: PageModel[] = [];
  let currentPage: PageModel = [];
  let currentHeight = 0;
  let itemIndex = 0;
  let lastStreamCount = 0;
  let lastStreamTime = 0;

  function processItem(idx: number) {
    const item = documentState[idx];
    if (!item) return;
    if (item.type === 'paragraph') {
      const runs = item.children || [];
      const lines = buildRunLines(runs, EDITOR_MAX_WIDTH);
      let currentParagraphLines: Glyph[][] = [];
      let charOffset = 0;

      lines.forEach((line) => {
        const lineHeight = lineHeightOfLine(line);

        if (currentHeight + lineHeight > PAGE_MAX_HEIGHT) {
          if (currentParagraphLines.length > 0) {
            const fragment = buildParagraphFragment(currentParagraphLines, idx, charOffset, item.align);
            if (fragment && fragment.children.length > 0) {
              currentPage.push(fragment);
              charOffset += fragment.children.reduce((acc, run) => acc + run.text.length, 0);
            }
          }
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
          currentParagraphLines = [line];
        } else {
          currentParagraphLines.push(line);
        }
        currentHeight += lineHeight;
      });

      if (currentParagraphLines.length > 0) {
        const fragment = buildParagraphFragment(currentParagraphLines, idx, charOffset, item.align);
        if (fragment && fragment.children.length > 0) {
          currentPage.push(fragment);
        }
      }
    } else if (item.type === 'table') {
      let currentTableInPage: TableNode = { type: 'table', rows: [], _docIdx: idx };

      item.rows.forEach((row) => {
        const cellWidth = EDITOR_MAX_WIDTH / row.cells.length;
        let maxRowLines = 1;

        row.cells.forEach((cell) => {
          const cellLines = buildRunLines(cell.children || [], cellWidth - TABLE_CELL_PADDING);
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
  }

  function processChunk() {
    if (runId !== layoutRunId) return;
    const startTime = performance.now();
    let processed = 0;
    while (itemIndex < documentState.length && processed < LAYOUT_CHUNK_ITEMS && (performance.now() - startTime) < LAYOUT_CHUNK_BUDGET_MS) {
      processItem(itemIndex);
      itemIndex += 1;
      processed += 1;
    }

    if (itemIndex < documentState.length) {
      self.postMessage({ type: 'LAYOUT_PROGRESS', payload: { done: itemIndex, total: totalItems } });
      const now = performance.now();
      if (pages.length > lastStreamCount && now - lastStreamTime > 120) {
        lastStreamTime = now;
        const freshPages = pages.slice(lastStreamCount);
        lastStreamCount = pages.length;
        self.postMessage({ type: 'RENDER_STREAM', payload: { pages: freshPages, done: itemIndex, total: totalItems } });
      }
      setTimeout(processChunk, 0);
    } else {
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      self.postMessage({ type: 'RENDER_READY', payload: pages });
    }
  }

  processChunk();
}

function buildParagraphFragment(lines: Glyph[][], docIdx: number, charOffset: number, align?: string): ParagraphNode | null {
  const firstRun = lines[0]?.[0]?.run;
  const baseFontSize = firstRun?.fontSize ?? BASE_FONT_PX;
  const baseFontFamily = firstRun?.fontFamily;
  const baseBold = firstRun?.bold;
  const baseItalic = firstRun?.italic;
  const baseUnderline = firstRun?.underline;
  const baseStrike = firstRun?.strike;
  const baseColor = firstRun?.color;

  const processedLines = lines.map((line) => {
    if (align === 'center') {
      const lineWidth = measureLineWidth(line);
      const remainingSpace = Math.max(0, EDITOR_MAX_WIDTH - lineWidth);
      const paddingWidth = remainingSpace / 2;
      if (paddingWidth > 0) {
        const spacerRun: TextRun = { 
          text: ' '.repeat(Math.round(paddingWidth / getSpaceWidth(baseFontSize))), 
          fontSize: baseFontSize,
          fontFamily: baseFontFamily,
          bold: baseBold,
          italic: baseItalic,
          underline: baseUnderline,
          strike: baseStrike,
          color: baseColor
        };
        return [{ ch: ' ', run: spacerRun }, ...line];
      }
    } else if (align === 'right') {
      const lineWidth = measureLineWidth(line);
      const remainingSpace = Math.max(0, EDITOR_MAX_WIDTH - lineWidth);
      if (remainingSpace > 0) {
        const spacerRun: TextRun = { 
          text: ' '.repeat(Math.round(remainingSpace / getSpaceWidth(baseFontSize))), 
          fontSize: baseFontSize,
          fontFamily: baseFontFamily,
          bold: baseBold,
          italic: baseItalic,
          underline: baseUnderline,
          strike: baseStrike,
          color: baseColor
        };
        return [{ ch: ' ', run: spacerRun }, ...line];
      }
    }
    return line;
  });

  const runs = mergeRuns(processedLines.flatMap(glyphLineToRuns));
  if (runs.length === 0) return null;

  const fragment: ParagraphNode = {
    type: 'paragraph',
    children: runs,
    _docIdx: docIdx,
    _charOffset: charOffset,
  };

  if (align) {
    fragment.align = align as any;
  }

  let maxLineHeight = LINE_HEIGHT;
  lines.forEach((line) => {
    const h = lineHeightOfLine(line);
    if (h > maxLineHeight) maxLineHeight = h;
  });
  fragment.lineHeight = maxLineHeight;

  return fragment;
}

function measureLineWidth(line: Glyph[]): number {
  let width = 0;
  line.forEach((glyph) => {
    const baseWidth = fontMetrics[glyph.ch] !== undefined ? fontMetrics[glyph.ch] : fontMetrics['default_ko'];
    width += baseWidth * ((glyph.run.fontSize ?? BASE_FONT_PX) / BASE_FONT_PX);
  });
  return width;
}

function getSpaceWidth(fontSize?: number): number {
  const baseWidth = fontMetrics[' '] !== undefined ? fontMetrics[' '] : (fontMetrics['default_ko'] ?? 8);
  const scale = (fontSize ?? BASE_FONT_PX) / BASE_FONT_PX;
  return baseWidth * scale;
}

function glyphLineToRuns(line: Glyph[]): TextRun[] {
  if (line.length === 0) return [{ text: '' }];

  const runs: TextRun[] = [];
  line.forEach((glyph) => {
    const last = runs[runs.length - 1];
    if (last && isSameStyle(last, glyph.run)) {
      last.text += glyph.ch;
    } else {
      runs.push({ ...glyph.run, text: glyph.ch });
    }
  });
  return runs;
}

function isSameStyle(a: TextRun, b: TextRun): boolean {
  return a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.fontFamily === b.fontFamily &&
    a.fontSize === b.fontSize &&
    a.color === b.color;
}

function mergeRuns(runs: TextRun[]): TextRun[] {
  const merged: TextRun[] = [];
  runs.forEach((run) => {
    const last = merged[merged.length - 1];
    if (last && isSameStyle(last, run)) {
      last.text += run.text;
    } else {
      merged.push({ ...run });
    }
  });
  return merged;
}

function lineHeightOfLine(line: Glyph[]): number {
  let maxFont = 0;
  line.forEach((glyph) => {
    const size = glyph.run.fontSize ?? BASE_FONT_PX;
    if (size > maxFont) maxFont = size;
  });
  return Math.max(LINE_HEIGHT, Math.round(maxFont * 1.4));
}

function buildRunLines(runs: TextRun[], maxWidth: number): Glyph[][] {
  const glyphs: Glyph[] = [];
  runs.forEach((run) => {
    for (const ch of run.text) {
      glyphs.push({ ch, run });
    }
  });

  const lines: Glyph[][] = [];
  if (glyphs.length === 0) {
    lines.push([]);
    return lines;
  }

  let current: Glyph[] = [];
  let currentWidth = 0;

  glyphs.forEach((glyph) => {
    const baseWidth = fontMetrics[glyph.ch] !== undefined ? fontMetrics[glyph.ch] : fontMetrics['default_ko'];
    const charWidth = baseWidth * ((glyph.run.fontSize ?? BASE_FONT_PX) / BASE_FONT_PX);

    if (currentWidth + charWidth > maxWidth && current.length > 0) {
      lines.push(current);
      current = [];
      currentWidth = 0;
    }
    current.push(glyph);
    currentWidth += charWidth;
  });

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}