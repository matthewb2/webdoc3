// src/layout/pagePaginator.ts
import type { DocumentItem, ParagraphNode, TableNode, TableRowNode, TextRun } from '../types';
import { pageLayout } from './layoutConstants';
import {
  type Glyph,
  buildRunLines,
  columnWidth,
  lineHeightOfLine,
  mergeRuns,
  glyphLineToRuns,
  runsFromLines,
} from './lineBreaker';

export type PageModel = DocumentItem[];

export interface LayoutCursorState {
  pages: PageModel[];
  currentPage: PageModel;
  currentHeight: number;
  trailingSpace: number;
  pendingCols: { columns: number; total: number } | null;
}

const LINE_HEIGHT = 26;
const TABLE_CELL_PADDING = 16;
const TABLE_CELL_BORDER = 1;
const TABLE_CELL_VERTICAL_PADDING = 14;
const TABLE_MARGIN_EDGE = 15;
const TABLE_BORDER_HEIGHT = 1;

// 기본 줄간격(%), 설정 파일 값으로 INIT_SETTINGS를 통해 갱신
let defaultLineSpacing = 160;

export function setDefaultLineSpacing(pct: number): void {
  if (pct > 0 && isFinite(pct)) defaultLineSpacing = pct;
}

function getPageMaxHeight(): number {
  return pageLayout.contentHeight;
}

// 셀 내용 너비: collapse 병합 테두리 반영 실측치와 일치
function tableCellContentWidth(cellCount: number): number {
  const n = Math.max(1, cellCount);
  return (pageLayout.tableGridWidth - TABLE_CELL_PADDING * n - (n - 1) * TABLE_CELL_BORDER) / n;
}

export function createLayoutState(): LayoutCursorState {
  return {
    pages: [],
    currentPage: [],
    currentHeight: 0,
    trailingSpace: 0,
    pendingCols: null,
  };
}

export function finalizePages(state: LayoutCursorState): PageModel[] {
  if (state.currentPage.length > 0) {
    state.pages.push(state.currentPage);
    state.currentPage = [];
  }
  return state.pages;
}

function pushNewPage(state: LayoutCursorState): void {
  if (state.currentPage.length > 0) {
    state.pages.push(state.currentPage);
  }
  state.currentPage = [];
  state.currentHeight = 0;
  state.trailingSpace = 0;
}

export function layoutDocumentItem(state: LayoutCursorState, item: DocumentItem, idx: number): void {
  if (!item) return;

  if (item.type === 'paragraph') {
    layoutParagraphItem(state, item, idx);
  } else if (item.type === 'shape') {
    layoutShapeItem(state, item, idx);
  } else if (item.type === 'table') {
    layoutTableItem(state, item, idx);
  }
}

function layoutParagraphItem(
  state: LayoutCursorState,
  item: Extract<DocumentItem, { type: 'paragraph' }>,
  idx: number,
): void {
  const columns = item.columns && item.columns > 1 ? item.columns : 1;
  const spaceBefore = Math.max(0, item.spaceBefore ?? 0);
  const spaceAfter = Math.max(0, item.spaceAfter ?? 0);

  if (columns > 1) {
    const runs = item.children || [];
    const lines = buildRunLines(runs, columnWidth(columns));
    const spacing = item.lineSpacing ?? defaultLineSpacing;
    let paraTotal = 0;
    lines.forEach((line) => {
      paraTotal += lineHeightOfLine(line, spacing);
    });

    let charge: number;
    if (!state.pendingCols || state.pendingCols.columns !== columns) {
      charge = Math.ceil(paraTotal / columns) + LINE_HEIGHT;
      state.pendingCols = { columns, total: paraTotal };
    } else {
      const prevBalanced = Math.ceil(state.pendingCols.total / columns);
      state.pendingCols.total += paraTotal;
      charge = Math.ceil(state.pendingCols.total / columns) - prevBalanced;
    }

    if (state.currentHeight + spaceBefore + charge > getPageMaxHeight() + 1) {
      if (state.currentPage.length > 0) {
        pushNewPage(state);
      }
      charge = Math.ceil(paraTotal / columns) + LINE_HEIGHT;
      state.pendingCols = { columns, total: paraTotal };
    }

    state.currentHeight += spaceBefore;
    const colFragment = buildParagraphFragment(
      lines,
      idx,
      0,
      item.align,
      columns,
      item.indent,
      item.lineSpacing,
      spaceBefore,
      spaceAfter,
      item.leftIndent,
      item.textIndent,
      item.rightIndent,
      item.children?.[0],
    );
    if (colFragment && colFragment.children.length > 0) {
      state.currentPage.push(colFragment);
    }
    state.currentHeight += charge + spaceAfter;
    state.trailingSpace = spaceAfter;
    return;
  }

  state.pendingCols = null;
  const runs = item.children || [];
  const lines = buildRunLines(runs, pageLayout.contentWidth);
  let currentParagraphLines: Glyph[][] = [];
  let charOffset = 0;
  let fragmentCount = 0;

  const spacing = item.lineSpacing ?? defaultLineSpacing;
  lines.forEach((line, lineIndex) => {
    const lineHeight = lineHeightOfLine(line, spacing);
    const before = lineIndex === 0 ? spaceBefore : 0;
    const maxH = getPageMaxHeight();

    // 1px epsilon: 분수 line-height/부동소수점 누적 오차로 인한 조기 분할 방지
    if (state.currentHeight + before + lineHeight > maxH + 1) {
      if (
        currentParagraphLines.length === 0 &&
        state.currentPage.length > 0 &&
        state.trailingSpace > 0 &&
        state.currentHeight - state.trailingSpace + before + lineHeight <= maxH + 1
      ) {
        state.currentHeight -= state.trailingSpace;
        state.trailingSpace = 0;
      } else {
        if (currentParagraphLines.length === 0 && state.currentPage.length > 0) {
          console.log(
            `[para-break] docIdx=${idx} cur=${state.currentHeight} lh=${lineHeight} text=${JSON.stringify(
              runs.map((r) => r.text).join('').slice(0, 30),
            )}`,
          );
        }
        if (currentParagraphLines.length > 0) {
          const fragment = buildParagraphFragment(
            currentParagraphLines,
            idx,
            charOffset,
            item.align,
            undefined,
            item.indent,
            item.lineSpacing,
            fragmentCount === 0 ? spaceBefore : undefined,
            undefined,
            item.leftIndent,
            item.textIndent,
            item.rightIndent,
            item.children?.[0],
          );
          if (fragment && fragment.children.length > 0) {
            state.currentPage.push(fragment);
            charOffset += fragment.children.reduce((acc, run) => acc + run.text.length, 0);
            fragmentCount += 1;
          }
        }
        pushNewPage(state);
        state.currentHeight += before;
        currentParagraphLines = [line];
        state.currentHeight += lineHeight;
        return;
      }
    }

    state.currentHeight += before;
    currentParagraphLines.push(line);
    state.trailingSpace = 0;
    state.currentHeight += lineHeight;
  });

  if (currentParagraphLines.length > 0) {
    const fragment = buildParagraphFragment(
      currentParagraphLines,
      idx,
      charOffset,
      item.align,
      undefined,
      item.indent,
      item.lineSpacing,
      fragmentCount === 0 ? spaceBefore : undefined,
      spaceAfter,
      item.leftIndent,
      item.textIndent,
      item.rightIndent,
      item.children?.[0],
    );
    if (fragment && fragment.children.length > 0) {
      state.currentPage.push(fragment);
    }
  }
  state.currentHeight += spaceAfter;
  state.trailingSpace = spaceAfter;
}

function layoutShapeItem(
  state: LayoutCursorState,
  item: Extract<DocumentItem, { type: 'shape' }>,
  idx: number,
): void {
  state.pendingCols = null;
  const w = Math.max(20, Math.min(pageLayout.contentWidth, (item as any).width || 160));
  const h = Math.max(10, (item as any).height || 100);
  const blockH = h + 16;

  if (state.currentHeight + blockH > getPageMaxHeight() + 1) {
    if (state.currentPage.length > 0) {
      pushNewPage(state);
    }
  }
  state.currentPage.push({ ...(item as any), width: w, height: h, _docIdx: idx } as any);
  state.currentHeight += blockH;
  state.trailingSpace = 0;
}

function layoutTableItem(
  state: LayoutCursorState,
  item: Extract<DocumentItem, { type: 'table' }>,
  idx: number,
): void {
  state.pendingCols = null;
  const tableProps = () => ({
    colWidths: item.colWidths,
    backgroundColor: (item as any).backgroundColor,
    background: (item as any).background,
    borderStyle: (item as any).borderStyle,
  });
  let currentTableInPage: TableNode = { type: 'table', rows: [], _docIdx: idx, ...tableProps() };

  item.rows.forEach((row, ri) => {
    (row as any)._rowIdx = ri;
    const n = Math.max(1, row.cells.length);
    const baseCol = pageLayout.tableGridWidth / n;
    const colWidths = item.colWidths;

    const cellLineList: Glyph[][][] = row.cells.map((cell, ci) => {
      if ((cell as any).merged) return [];
      const span = Math.max(1, (cell as any).colSpan ?? 1);
      let w = baseCol * span;
      if (colWidths && colWidths.length > 0) {
        let sum = 0;
        for (let i = 0; i < span; i++) sum += colWidths[ci + i] ?? baseCol;
        w = sum;
      }
      return buildRunLines(cell.children || [], Math.max(20, w - TABLE_CELL_PADDING - TABLE_CELL_BORDER));
    });

    let maxRowLines = 0;
    let visibleCells = 0;
    cellLineList.forEach((cellLines) => {
      if (cellLines.length > 0) visibleCells += 1;
      if (cellLines.length > maxRowLines) maxRowLines = cellLines.length;
    });

    const lineHeights: number[] = [];
    for (let li = 0; li < maxRowLines; li++) {
      let lineH = 0;
      cellLineList.forEach((cellLines) => {
        const line = cellLines[li];
        if (line) {
          const h = lineHeightOfLine(line, defaultLineSpacing);
          if (h > lineH) lineH = h;
        }
      });
      lineHeights.push(lineH);
    }

    const contentHeight = lineHeights.reduce((acc, h) => acc + h, 0);
    let rowHeight = visibleCells === 0 ? 0 : contentHeight + TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
    if (row.height && row.height > rowHeight) rowHeight = row.height;

    const overhead =
      currentTableInPage.rows.length === 0 ? (currentTableInPage._continued ? 0 : TABLE_MARGIN_EDGE) : 0;

    if (state.currentHeight + overhead + rowHeight > getPageMaxHeight() + 1) {
      const remaining = getPageMaxHeight() - state.currentHeight - overhead;
      let splitLines = 0;
      let headAcc = TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
      while (splitLines < maxRowLines - 1 && headAcc + lineHeights[splitLines] <= remaining) {
        headAcc += lineHeights[splitLines];
        splitLines += 1;
      }

      const headPx = headAcc;
      const tailPx =
        contentHeight - (headAcc - TABLE_CELL_VERTICAL_PADDING - TABLE_BORDER_HEIGHT) +
        TABLE_CELL_VERTICAL_PADDING +
        TABLE_BORDER_HEIGHT;

      console.log(
        `[layout] docIdx=${idx} row=${row.cells[0]?.children[0]?.text} cur=${state.currentHeight} oh=${overhead} rh=${rowHeight} maxLines=${maxRowLines} K=${splitLines} firstH=${lineHeights[0]} cellW=${tableCellContentWidth(row.cells.length).toFixed(2)} headPx=${headPx} tailPx=${tailPx} pageAfter=${state.currentHeight + headPx}`,
      );

      let pieceRow: TableRowNode | null = null;
      let pieceCellLines: Glyph[][][] = [];
      let pieceLineHeights: number[] = [];

      if (splitLines >= 1) {
        const headCells = row.cells.map((cell, ci) => ({
          ...cell,
          children: runsFromLines(cellLineList[ci].slice(0, splitLines)),
        }));
        const tailCells = row.cells.map((cell, ci) => ({
          ...cell,
          children: runsFromLines(cellLineList[ci].slice(splitLines)),
        }));

        currentTableInPage.rows.push({ ...row, cells: headCells, height: undefined });
        currentTableInPage._continues = true;
        state.currentPage.push(currentTableInPage);
        pushNewPage(state);

        currentTableInPage = {
          type: 'table',
          rows: [{ ...row, cells: tailCells, height: undefined }],
          _docIdx: idx,
          _continued: true,
          ...tableProps(),
        };
        const tailContent = contentHeight - (headAcc - TABLE_CELL_VERTICAL_PADDING - TABLE_BORDER_HEIGHT);
        state.currentHeight += tailContent + TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
        pieceRow = { ...row, cells: tailCells };
        pieceCellLines = cellLineList.map((lines) => lines.slice(splitLines));
        pieceLineHeights = lineHeights.slice(splitLines);
      } else {
        const broke = currentTableInPage.rows.length > 0 || state.currentPage.length > 0;
        if (currentTableInPage.rows.length > 0) {
          currentTableInPage._continues = true;
          state.currentPage.push(currentTableInPage);
        }
        if (broke) {
          pushNewPage(state);
          currentTableInPage = {
            type: 'table',
            rows: [row],
            _docIdx: idx,
            _continued: true,
            ...tableProps(),
          };
          state.currentHeight += rowHeight;
          pieceRow = row;
          pieceCellLines = cellLineList;
          pieceLineHeights = lineHeights;
        } else {
          currentTableInPage = { type: 'table', rows: [row], _docIdx: idx, ...tableProps() };
          state.currentHeight += TABLE_MARGIN_EDGE + rowHeight;
          pieceRow = row;
          pieceCellLines = cellLineList;
          pieceLineHeights = lineHeights;
        }
      }

      // 거대 행 꼬리가 한 페이지를 초과하면 줄 단위로 추가 분할
      while (
        pieceRow !== null &&
        currentTableInPage.rows.length === 1 &&
        state.currentHeight > getPageMaxHeight()
      ) {
        const firstOverhead = currentTableInPage._continued ? 0 : TABLE_MARGIN_EDGE;
        const rem = getPageMaxHeight() - firstOverhead;
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

        console.log(
          `[layout-split] docIdx=${idx} row=${prow.cells[0]?.children[0]?.text} K2=${k} headPx=${acc} tailLeft=${pieceLineHeights.length - k}`,
        );

        currentTableInPage.rows = [{ ...prow, cells: head2Cells, height: undefined }];
        currentTableInPage._continues = true;
        state.currentPage.push(currentTableInPage);
        state.pages.push(state.currentPage);
        state.currentPage = [];

        pieceRow = { ...prow, cells: tail2Cells, height: undefined };
        pieceCellLines = pieceCellLines.map((lines) => lines.slice(k));
        pieceLineHeights = pieceLineHeights.slice(k);
        currentTableInPage = {
          type: 'table',
          rows: [pieceRow],
          _docIdx: idx,
          _continued: true,
          ...tableProps(),
        };
        state.currentHeight =
          pieceLineHeights.reduce((a, h) => a + h, 0) + TABLE_CELL_VERTICAL_PADDING + TABLE_BORDER_HEIGHT;
      }
    } else {
      if (currentTableInPage.rows.length === 0) {
        state.currentHeight += currentTableInPage._continued ? 0 : TABLE_MARGIN_EDGE;
      }
      currentTableInPage.rows.push(row);
      state.currentHeight += rowHeight;
    }
  });

  if (currentTableInPage.rows.length > 0) {
    if (!currentTableInPage._continues) state.currentHeight += TABLE_MARGIN_EDGE;
    state.currentPage.push(currentTableInPage);
  }
}

function buildParagraphFragment(
  lines: Glyph[][],
  docIdx: number,
  charOffset: number,
  align?: string,
  columns?: number,
  indent?: number,
  spacing?: number,
  spaceBefore?: number,
  spaceAfter?: number,
  leftIndent?: number,
  textIndent?: number,
  rightIndent?: number,
  styleSource?: TextRun,
): ParagraphNode | null {
  const runs = mergeRuns(lines.flatMap(glyphLineToRuns));
  if (runs.length === 0) return null;

  // 빈 줄([])에서 glyphLineToRuns가 스타일 없는 {text:''}를 반환하므로 원본 런 스타일을 보존
  if (styleSource) {
    for (const r of runs) {
      if ((r.text || '').length === 0) {
        if (r.fontFamily === undefined && styleSource.fontFamily !== undefined) r.fontFamily = styleSource.fontFamily;
        if (r.fontSize === undefined && styleSource.fontSize !== undefined) r.fontSize = styleSource.fontSize;
        if (r.bold === undefined && styleSource.bold !== undefined) r.bold = styleSource.bold;
        if (r.italic === undefined && styleSource.italic !== undefined) r.italic = styleSource.italic;
        if (r.underline === undefined && styleSource.underline !== undefined) r.underline = styleSource.underline;
        if (r.strike === undefined && styleSource.strike !== undefined) r.strike = styleSource.strike;
        if (r.color === undefined && styleSource.color !== undefined) r.color = styleSource.color;
        if (r.backgroundColor === undefined && styleSource.backgroundColor !== undefined) r.backgroundColor = styleSource.backgroundColor;
      }
    }
  }

  const fragment: ParagraphNode = {
    type: 'paragraph',
    children: runs,
    _docIdx: docIdx,
    _charOffset: charOffset,
  };

  if (align) fragment.align = align as any;
  if (columns && columns > 1) fragment.columns = columns;
  if (leftIndent !== undefined) fragment.leftIndent = leftIndent;
  if (textIndent !== undefined) fragment.textIndent = textIndent;
  if (rightIndent !== undefined) fragment.rightIndent = rightIndent;
  if (indent) fragment.indent = indent;
  if (spaceBefore && spaceBefore > 0) fragment.spaceBefore = spaceBefore;
  if (spaceAfter && spaceAfter > 0) fragment.spaceAfter = spaceAfter;

  const spacingPct = spacing ?? defaultLineSpacing;
  fragment.lineSpacing = spacingPct;
  fragment.lineHeight = lines.length > 0 ? lineHeightOfLine(lines[0], spacingPct) : 0;

  return fragment;
}