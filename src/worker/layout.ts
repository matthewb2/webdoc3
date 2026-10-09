// src/worker/layout.ts - 레이아웃 엔진 (줄 나눔·페이지 분할·청크 스케줄링)
import type { DocumentModel, DocumentItem, ParagraphNode, TableNode, TableRowNode, FontMetrics, TextRun } from '../types';

export type PageModel = DocumentItem[];

// 워커는 HMR 대상이 아니라 전체 새로고침해야 교체됨 — 실행 중인 엔진 식별용
console.log('[worker] boot, engine bytes:', runLayoutEngineAsync.toString().length);

const PAGE_MAX_HEIGHT = 700;
const LINE_HEIGHT = 26;
const EDITOR_MAX_WIDTH = 600;
const TABLE_CELL_PADDING = 16;
const TABLE_CELL_BORDER = 1;
const TABLE_GRID_WIDTH = EDITOR_MAX_WIDTH - 1;

// 셀 내용 너비: collapse 병합 테두리 반영 실측치와 일치
// (표 599px 중 셀 패딩 16px/셀 + 공유 내부선 1px씩 제외, 외곽선은 표 바깥)
function tableCellContentWidth(cellCount: number): number {
  const n = Math.max(1, cellCount);
  return (TABLE_GRID_WIDTH - TABLE_CELL_PADDING * n - (n - 1) * TABLE_CELL_BORDER) / n;
}
const TABLE_CELL_VERTICAL_PADDING = 14;
const TABLE_MARGIN_EDGE = 15;
const TABLE_BORDER_HEIGHT = 1;
const BASE_FONT_PX = 16;
const COLUMN_GAP = 20;

function columnWidth(columns: number): number {
  const n = Math.max(1, columns);
  return (EDITOR_MAX_WIDTH - COLUMN_GAP * (n - 1)) / n;
}

type Glyph = { ch: string; run: TextRun; w?: number };

let fontMetrics: FontMetrics = {};

export function setFontMetrics(metrics: FontMetrics) {
  fontMetrics = metrics;
}

const LAYOUT_CHUNK_ITEMS = 50;
const LAYOUT_CHUNK_BUDGET_MS = 12;


export function runLayoutEngineAsync(documentState: DocumentModel, post: (message: any) => void, token: { cancelled: boolean }) {
  if (Object.keys(fontMetrics).length === 0) return;

  const totalItems = documentState.length;
  const pages: PageModel[] = [];
  let currentPage: PageModel = [];
  let currentHeight = 0;
  let pendingCols: { columns: number; total: number } | null = null;
  let itemIndex = 0;
  let lastStreamCount = 0;
  let lastStreamTime = 0;

  function processItem(idx: number) {
    const item = documentState[idx];
    if (!item) return;
    if (item.type === 'paragraph') {
      const columns = item.columns && item.columns > 1 ? item.columns : 1;
      if (columns > 1) {
        const runs = item.children || [];
        const lines = buildRunLines(runs, columnWidth(columns));
        let paraTotal = 0;
        lines.forEach((line) => {
          paraTotal += lineHeightOfLine(line);
        });
        let charge: number;
        if (!pendingCols || pendingCols.columns !== columns) {
          charge = Math.ceil(paraTotal / columns) + LINE_HEIGHT;
          pendingCols = { columns, total: paraTotal };
        } else {
          const prevBalanced = Math.ceil(pendingCols.total / columns);
          pendingCols.total += paraTotal;
          charge = Math.ceil(pendingCols.total / columns) - prevBalanced;
        }
        if (currentHeight + charge > PAGE_MAX_HEIGHT) {
          if (currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [];
            currentHeight = 0;
          }
          charge = Math.ceil(paraTotal / columns) + LINE_HEIGHT;
          pendingCols = { columns, total: paraTotal };
        }
        const colFragment = buildParagraphFragment(lines, idx, 0, item.align, columns, item.indent);
        if (colFragment && colFragment.children.length > 0) {
          currentPage.push(colFragment);
        }
        currentHeight += charge;
      } else {
      pendingCols = null;
      const runs = item.children || [];
      const lines = buildRunLines(runs, EDITOR_MAX_WIDTH);
      let currentParagraphLines: Glyph[][] = [];
      let charOffset = 0;

      lines.forEach((line) => {
        const lineHeight = lineHeightOfLine(line);

        if (currentHeight + lineHeight > PAGE_MAX_HEIGHT) {
          if (currentParagraphLines.length === 0 && currentPage.length > 0) {
            console.log(`[para-break] docIdx=${idx} cur=${currentHeight} lh=${lineHeight} text=${JSON.stringify(runs.map((r) => r.text).join('').slice(0, 30))}`);
          }
          if (currentParagraphLines.length > 0) {
            const fragment = buildParagraphFragment(currentParagraphLines, idx, charOffset, item.align, undefined, item.indent);
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
        const fragment = buildParagraphFragment(currentParagraphLines, idx, charOffset, item.align, undefined, item.indent);
        if (fragment && fragment.children.length > 0) {
          currentPage.push(fragment);
        }
      }
      }
    } else if (item.type === 'table') {
      pendingCols = null;
      let currentTableInPage: TableNode = { type: 'table', rows: [], _docIdx: idx };

      item.rows.forEach((row) => {
        const cellWidth = tableCellContentWidth(row.cells.length);
        const cellLineList = row.cells.map((cell) => buildRunLines(cell.children || [], cellWidth));
        let maxRowLines = 1;
        cellLineList.forEach((cellLines) => {
          if (cellLines.length > maxRowLines) {
            maxRowLines = cellLines.length;
          }
        });

        // 실제 렌더 높이와 일치: 줄별 최대 높이 합 + 셀 수직 패딩 + 경계선
        const lineHeights: number[] = [];
        for (let li = 0; li < maxRowLines; li++) {
          let lineH = LINE_HEIGHT;
          cellLineList.forEach((cellLines) => {
            const line = cellLines[li];
            if (line) {
              const h = lineHeightOfLine(line);
              if (h > lineH) lineH = h;
            }
          });
          lineHeights.push(lineH);
        }
        const contentHeight = lineHeights.reduce((acc, h) => acc + h, 0);
        const rowHeight = contentHeight + TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;

        // 새 조각의 첫 행이면 상단 마진도 함께 검사 (이어진 조각은 상단 마진 없음)
        const overhead = currentTableInPage.rows.length === 0 ? (currentTableInPage._continued ? 0 : TABLE_MARGIN_EDGE) : 0;
        if (currentHeight + overhead + rowHeight > PAGE_MAX_HEIGHT) {
          // 글자(줄) 높이 기준 분할: 남은 공간에 들어가는 줄 수 (뒷부분에 최소 1줄 남김)
          const remaining = PAGE_MAX_HEIGHT - currentHeight - overhead;
          let splitLines = 0;
          let headAcc = TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
          while (splitLines < maxRowLines - 1 && headAcc + lineHeights[splitLines] <= remaining) {
            headAcc += lineHeights[splitLines];
            splitLines += 1;
          }

          const headPx = headAcc;
          const tailPx = contentHeight - (headAcc - TABLE_CELL_VERTICAL_PADDING - TABLE_BORDER_HEIGHT) + TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
          console.log(`[layout] docIdx=${idx} row=${row.cells[0]?.children[0]?.text} cur=${currentHeight} oh=${overhead} rh=${rowHeight} maxLines=${maxRowLines} K=${splitLines} firstH=${lineHeights[0]} cellW=${tableCellContentWidth(row.cells.length).toFixed(2)} headPx=${headPx} tailPx=${tailPx} pageAfter=${currentHeight + headPx}`);
          // 새로 시작된 조각의 단일 행 (페이지 초과 시 추가 분할 대상)
          let pieceRow: TableRowNode | null = null;
          let pieceCellLines: Glyph[][][] = [];
          let pieceLineHeights: number[] = [];
          if (splitLines >= 1) {
            // 앞부분은 현재 페이지에, 나머지는 다음 페이지에 (여백 없이 채움)
            const headCells = row.cells.map((cell, ci) => ({
              ...cell,
              children: runsFromLines(cellLineList[ci].slice(0, splitLines)),
            }));
            const tailCells = row.cells.map((cell, ci) => ({
              ...cell,
              children: runsFromLines(cellLineList[ci].slice(splitLines)),
            }));
            currentTableInPage.rows.push({ ...row, cells: headCells });
            currentTableInPage._continues = true;
            currentPage.push(currentTableInPage);
            pages.push(currentPage);
            currentPage = [];
            currentHeight = 0;
            currentTableInPage = { type: 'table', rows: [{ ...row, cells: tailCells }], _docIdx: idx, _continued: true };
            const tailContent = contentHeight - (headAcc - TABLE_CELL_VERTICAL_PADDING - TABLE_BORDER_HEIGHT);
            currentHeight += tailContent + TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
            pieceRow = { ...row, cells: tailCells };
            pieceCellLines = cellLineList.map((lines) => lines.slice(splitLines));
            pieceLineHeights = lineHeights.slice(splitLines);
          } else {
            const broke = currentTableInPage.rows.length > 0 || currentPage.length > 0;
            if (currentTableInPage.rows.length > 0) {
              currentTableInPage._continues = true;
              currentPage.push(currentTableInPage);
            }
            if (broke) {
              pages.push(currentPage);
              currentPage = [];
              currentHeight = 0;
              currentTableInPage = { type: 'table', rows: [row], _docIdx: idx, _continued: true };
              currentHeight += rowHeight;
              pieceRow = row;
              pieceCellLines = cellLineList;
              pieceLineHeights = lineHeights;
            } else {
              // 빈 페이지에 거대 행 하나: 빈 페이지 푸시 없이 그대로 배치
              currentTableInPage = { type: 'table', rows: [row], _docIdx: idx };
              currentHeight += TABLE_MARGIN_EDGE + rowHeight;
              pieceRow = row;
              pieceCellLines = cellLineList;
              pieceLineHeights = lineHeights;
            }
          }
          // 거대 행 꼬리가 한 페이지를 초과하면 줄 단위로 추가 분할
          while (
            pieceRow !== null &&
            currentTableInPage.rows.length === 1 &&
            currentHeight > PAGE_MAX_HEIGHT
          ) {
            const firstOverhead = currentTableInPage._continued ? 0 : TABLE_MARGIN_EDGE;
            const rem = PAGE_MAX_HEIGHT - firstOverhead;
            let k = 0;
            let acc = TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
            while (k < pieceLineHeights.length - 1 && acc + pieceLineHeights[k] <= rem) {
              acc += pieceLineHeights[k];
              k += 1;
            }
            if (k < 1) break;
            const prow: TableRowNode = pieceRow;
            const head2Cells = prow.cells.map((cell, ci) => ({
              ...cell,
              children: runsFromLines(pieceCellLines[ci].slice(0, k)),
            }));
            const tail2Cells = prow.cells.map((cell, ci) => ({
              ...cell,
              children: runsFromLines(pieceCellLines[ci].slice(k)),
            }));
            console.log(`[layout-split] docIdx=${idx} row=${prow.cells[0]?.children[0]?.text} K2=${k} headPx=${acc} tailLeft=${pieceLineHeights.length - k}`);
            currentTableInPage.rows = [{ ...prow, cells: head2Cells }];
            currentTableInPage._continues = true;
            currentPage.push(currentTableInPage);
            pages.push(currentPage);
            currentPage = [];
            pieceRow = { ...prow, cells: tail2Cells };
            pieceCellLines = pieceCellLines.map((lines) => lines.slice(k));
            pieceLineHeights = pieceLineHeights.slice(k);
            currentTableInPage = { type: 'table', rows: [pieceRow], _docIdx: idx, _continued: true };
            currentHeight = pieceLineHeights.reduce((a, h) => a + h, 0) + TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
          }
        } else {
          if (currentTableInPage.rows.length === 0) currentHeight += currentTableInPage._continued ? 0 : TABLE_MARGIN_EDGE;
          currentTableInPage.rows.push(row);
          currentHeight += rowHeight;
        }
      });

      if (currentTableInPage.rows.length > 0) {
        // 표가 끝나면 하단 마진 (뒤에 내용이 올 것을 대비, 이어지는 조각은 마진 없음)
        if (!currentTableInPage._continues) currentHeight += TABLE_MARGIN_EDGE;
        currentPage.push(currentTableInPage);
      }
    }
  }

  function processChunk() {
    if (token.cancelled) return;
    const startTime = performance.now();
    let processed = 0;
    while (itemIndex < documentState.length && processed < LAYOUT_CHUNK_ITEMS && (performance.now() - startTime) < LAYOUT_CHUNK_BUDGET_MS) {
      processItem(itemIndex);
      itemIndex += 1;
      processed += 1;
    }

    if (itemIndex < documentState.length) {
      post({ type: 'LAYOUT_PROGRESS', payload: { done: itemIndex, total: totalItems } });
      const now = performance.now();
      if (pages.length > lastStreamCount && now - lastStreamTime > 120) {
        lastStreamTime = now;
        const freshPages = pages.slice(lastStreamCount);
        lastStreamCount = pages.length;
        post({ type: 'RENDER_STREAM', payload: { pages: freshPages, done: itemIndex, total: totalItems } });
      }
      setTimeout(processChunk, 0);
    } else {
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      post({ type: 'RENDER_READY', payload: pages });
    }
  }

  processChunk();
}
function buildParagraphFragment(
  lines: Glyph[][],
  docIdx: number,
  charOffset: number,
  align?: string,
  columns?: number,
  indent?: number,
): ParagraphNode | null {
  // 정렬은 CSS text-align으로 처리한다. 스페이서 런을 넣으면 fragment 텍스트가
  // 원문과 달라져 커서 오프셋과 편집 인덱스가 어긋나므로 절대 추가하지 않는다.
  const runs = mergeRuns(lines.flatMap(glyphLineToRuns));
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
  if (columns && columns > 1) {
    fragment.columns = columns;
  }
  if (indent) {
    fragment.indent = indent;
  }

  let maxLineHeight = LINE_HEIGHT;
  lines.forEach((line) => {
    const h = lineHeightOfLine(line);
    if (h > maxLineHeight) maxLineHeight = h;
  });
  fragment.lineHeight = maxLineHeight;

  return fragment;
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
    a.color === b.color &&
    a.backgroundColor === b.backgroundColor;
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

function runsFromLines(lines: Glyph[][]): TextRun[] {
  if (lines.length === 0) return [{ text: '' }];
  return mergeRuns(lines.flatMap(glyphLineToRuns));
}

function lineHeightOfLine(line: Glyph[]): number {
  let maxFont = 0;
  line.forEach((glyph) => {
    const size = glyph.run.fontSize ?? BASE_FONT_PX;
    if (size > maxFont) maxFont = size;
  });
  return Math.max(LINE_HEIGHT, Math.round(maxFont * 1.4));
}

const breakCache = new Map<string, number[]>();

export function setBreaks(incoming: Record<string, number[]>) {
  Object.keys(incoming).forEach((k) => breakCache.set(k, incoming[k]));
  if (breakCache.size > 8000) breakCache.clear();
}

function breakKeyForRuns(runs: TextRun[], width: number): string {
  // probe.ts의 breakKeyForRuns와 동일해야 함 (구분자·연산 포함)
  return `${width}\u0001${runs.map((r) => `${r.text}\u0001${r.fontSize ?? 16}\u0001${r.bold ? 1 : 0}\u0001${r.fontFamily ?? ''}`).join('\u0002')}`;
}

function buildRunLines(runs: TextRun[], maxWidth: number): Glyph[][] {
  const glyphs: Glyph[] = [];
  runs.forEach((run) => {
    for (const ch of run.text) {
      glyphs.push({ ch, run });
    }
  });
  if (glyphs.length === 0) return [[]];

  const probed = breakCache.get(breakKeyForRuns(runs, maxWidth));
  if (runs.length > 0 && runs[0].text.includes('11번째')) {
    console.log(`[breakdbg] cacheSize=${breakCache.size} probed=${JSON.stringify(probed)} greedy=${JSON.stringify(wrapGlyphs(glyphs, maxWidth).map((l) => l.length))}`);
  }
  if (probed) return sliceGlyphs(glyphs, probed, maxWidth);
  return wrapGlyphs(glyphs, maxWidth);
}

function sliceGlyphs(glyphs: Glyph[], breaks: number[], maxWidth: number): Glyph[][] {
  const lines: Glyph[][] = [];
  let pos = 0;
  breaks.forEach((count) => {
    if (count <= 0) return;
    lines.push(glyphs.slice(pos, pos + count));
    pos += count;
  });
  if (pos < glyphs.length) {
    wrapGlyphs(glyphs.slice(pos), maxWidth).forEach((line) => lines.push(line));
  }
  if (lines.length === 0) lines.push([]);
  return lines;
}

function wrapGlyphs(glyphs: Glyph[], maxWidth: number): Glyph[][] {
  const lines: Glyph[][] = [];

  let current: Glyph[] = [];
  let currentWidth = 0;

  glyphs.forEach((glyph) => {
    const baseWidth = fontMetrics[glyph.ch] !== undefined ? fontMetrics[glyph.ch] : fontMetrics['default_ko'];
    const charWidth = baseWidth * ((glyph.run.fontSize ?? BASE_FONT_PX) / BASE_FONT_PX);

    if (currentWidth + charWidth > maxWidth && current.length > 0) {
      // 영문 단어 단위 줄바꿈: 줄 안 마지막 공백/하이픈 뒤에서 나눔 (앞에 실제 글자가 있을 때만)
      let breakAt = -1;
      for (let i = current.length - 1; i >= 0; i--) {
        const ch = current[i].ch;
        if (ch === ' ' || ch === '-') {
          let hasContent = false;
          for (let k = 0; k < i; k++) {
            if (current[k].ch !== ' ') {
              hasContent = true;
              break;
            }
          }
          if (hasContent) {
            breakAt = i;
            break;
          }
        }
      }
      if (breakAt >= 0) {
        lines.push(current.slice(0, breakAt + 1));
        current = current.slice(breakAt + 1);
        currentWidth = 0;
        current.forEach((g) => {
          if (g.ch === ' ' && currentWidth === 0) {
            g.w = 0;
            return;
          }
          const bw = fontMetrics[g.ch] !== undefined ? fontMetrics[g.ch] : fontMetrics['default_ko'];
          currentWidth += bw * ((g.run.fontSize ?? BASE_FONT_PX) / BASE_FONT_PX);
        });
      } else {
        lines.push(current);
        current = [];
        currentWidth = 0;
      }
    }
    // 브라우저(white-space normal)와 동일하게 줄 맨 앞 공백은 너비 0으로 처리 (텍스트는 보존)
    if (glyph.ch === ' ' && currentWidth === 0) {
      glyph.w = 0;
      current.push(glyph);
      return;
    }
    current.push(glyph);
    currentWidth += charWidth;
  });

  if (current.length > 0) {
    lines.push(current);
  }

  // 브라우저와 동일하게 줄 끝 공백 너비 제거 (텍스트는 보존)
  lines.forEach((line) => {
    for (let i = line.length - 1; i >= 0; i--) {
      if (line[i].ch === ' ') line[i].w = 0;
      else break;
    }
  });

  return lines;
}