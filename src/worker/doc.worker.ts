import type { DocumentModel, TableCellNode, TableNode, TableRowNode, TextRun } from '../types';
import { clearBreaks, runLayoutEngineAsync, setBreaks, setDefaultLineSpacing, setFontMetrics } from './layout';
import { setPageMargins } from './layoutConstants';
export type { PageModel } from './layout';


let documentState: DocumentModel = [];

// 설정 파일의 기본 글자 모양 (새 run 시딩용, INIT_SETTINGS로 수신)
let defaultCharShape: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string } = {};

function seedRun(): TextRun {
  const run: TextRun = { text: '' };
  applyDefaultShape(run);
  return run;
}

function isBareRun(run: TextRun): boolean {
  return (
    !run.bold &&
    !run.italic &&
    !run.underline &&
    !run.strike &&
    run.fontFamily === undefined &&
    run.fontSize === undefined &&
    run.color === undefined &&
    run.backgroundColor === undefined
  );
}

// 속성이 전혀 없는 run에 첫 입력이 들어오면 기본 모양 적용
function applyDefaultShape(run: TextRun): void {
  if (defaultCharShape.bold) run.bold = true;
  if (defaultCharShape.italic) run.italic = true;
  if (defaultCharShape.underline) run.underline = true;
  if (defaultCharShape.strike) run.strike = true;
  if (defaultCharShape.color) run.color = defaultCharShape.color;
}






self.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
  if (message.type === 'EDIT_DELETE_RANGE') {
    const { paragraphIndex, fromCharIndex, endCharIndex } = message.payload;
    
    // 1. documentModel 대신 documentState를 참조하여 문단(paragraph)을 가져옵니다.
    const paragraph = documentState[paragraphIndex];
    if (paragraph && paragraph.type === 'paragraph' && paragraph.children) {
      // 2. 해당 단락의 런(Run) 구조에서 fromCharIndex ~ endCharIndex 범위의 텍스트를 제거합니다.
      // (기존에 정의된 applyRunAttrs 또는 런 분할 로직을 활용하거나 범위 슬라이싱 적용)
      const total = paragraph.children.reduce((acc, r) => acc + (r.text?.length || 0), 0);
      const f = Math.max(0, Math.min(fromCharIndex, total));
      const t = Math.max(f, Math.min(endCharIndex, total));
      
      if (t > f) {
        // 낮은 쪽과 높은 쪽을 각각 분할한 뒤 사이의 런 텍스트를 비우거나 제거
        const startIdx = splitRunAt(paragraph.children, f);
        const endIdx = splitRunAt(paragraph.children, t);
        
        // startIdx부터 endIdx 전까지의 런 텍스트를 빈 문자열로 만들거나 제거
        for (let i = startIdx; i < endIdx; i++) {
          paragraph.children[i].text = '';
        }
        
        // 빈 런들 중 텍스트가 없는 것들을 정리하거나 빈 배열 방지
        if (paragraph.children.length === 0) {
          paragraph.children.push(seedRun());
        }
        
        // 3. 레이아웃 재계산 및 렌더링 갱신 요청
        requestLayout();
      }
    }
  }
  if (message.type === 'INIT_METRICS') {
    setFontMetrics(message.payload);
  } else if (message.type === 'BREAKS') {
    setBreaks(message.payload as Record<string, number[]>);
  } else if (message.type === 'INIT_DOC') {
    documentState = message.payload;
    requestLayout();
  } else if (message.type === 'EDIT_INSERT') {
    editInsert(message.payload.paragraphIndex, message.payload.charIndex, message.payload.text);
  } else if (message.type === 'EDIT_DELETE') {
    editDelete(message.payload.paragraphIndex, message.payload.charIndex);
  } else if (message.type === 'EDIT_DELETE_FWD') {
    editDeleteForward(message.payload.paragraphIndex, message.payload.charIndex);
  } else if (message.type === 'INIT_SETTINGS') {
    const cs = message.payload?.charShape;
    defaultCharShape = cs && typeof cs === 'object' ? { ...cs } : {};
    if (typeof message.payload?.lineSpacing === 'number') {
      setDefaultLineSpacing(message.payload.lineSpacing);
    }
    if (message.payload?.pageMargins) {
      setPageMargins(message.payload.pageMargins);
      clearBreaks();
    }
  } else if (message.type === 'EDIT_LINE_SPACING') {
    editLineSpacing(message.payload.paragraphIndices, message.payload.lineSpacing);
  } else if (message.type === 'EDIT_SPLIT') {
    editSplit(message.payload.paragraphIndex, message.payload.charIndex);
  } else if (message.type === 'GET_DOC') {
    self.postMessage({ type: 'DOC_SNAPSHOT', payload: documentState });
  } else if (message.type === 'EDIT_FONT') {
    editFont(message.payload.paragraphIndex, message.payload);
  } else if (message.type === 'EDIT_COLUMNS') {
    editColumns(message.payload.paragraphIndices, message.payload.columns);
  } else if (message.type === 'EDIT_ALIGN') {
    editAlign(message.payload.paragraphIndices, message.payload.align);
  } else if (message.type === 'EDIT_TABLE_ALIGN') {
    editTableAlign(message.payload.tableDocIdx, message.payload.rows, message.payload.cols, message.payload.align);
  } else if (message.type === 'EDIT_TABLE_MERGE') {
    editTableMerge(message.payload.tableDocIdx, message.payload.r0, message.payload.r1, message.payload.c0, message.payload.c1);
  } else if (message.type === 'EDIT_TABLE_ROW_HEIGHT') {
    editTableRowHeight(message.payload.tableDocIdx, message.payload.rowIndex, message.payload.height);
  } else if (message.type === 'EDIT_TABLE_COL_WIDTH') {
    editTableColWidth(message.payload.tableDocIdx, message.payload.colIndex, message.payload.width);
  } else if (message.type === 'EDIT_INSERT_TABLE') {
    editInsertTable(message.payload.paragraphIndex, message.payload.charIndex, message.payload.rows, message.payload.cols);
  } else if (message.type === 'EDIT_TABLE_BORDER') {
    const node = documentState[message.payload.tableDocIdx];
    if (node && node.type === 'table') {
      (node as any).borderStyle = message.payload.borderStyle;
      requestLayout();
    }
  } else if (message.type === 'SET_PAGE_MARGINS') {
    setPageMargins(message.payload);
    clearBreaks();
    requestLayout();
  } else if (message.type === 'EDIT_COLOR') {
    editColor(message.payload.paragraphIndices, message.payload.color, message.payload.backgroundColor);
  } else if (message.type === 'EDIT_FONT_RANGE') {
    editFontRange(message.payload.paragraphIndex, message.payload.fromCharIndex, message.payload.endCharIndex, message.payload);
  } else if (message.type === 'EDIT_COLOR_RANGE') {
    editColorRange(message.payload.paragraphIndex, message.payload.fromCharIndex, message.payload.endCharIndex, message.payload.color, message.payload.backgroundColor);
  }
});

function locateRun(children: TextRun[], charIndex: number): { runIndex: number; localIndex: number } {
  let acc = 0;
  for (let i = 0; i < children.length; i++) {
    const len = children[i].text?.length || 0;
    if (charIndex <= acc + len) return { runIndex: i, localIndex: Math.max(0, charIndex - acc) };
    acc += len;
  }
  const last = Math.max(0, children.length - 1);
  return { runIndex: last, localIndex: children[last]?.text?.length || 0 };
}

function editInsert(docIdx: number, charIndex: number, text: string) {
  console.log(`[edit] insert p=${docIdx} at=${charIndex} text=${JSON.stringify(text.slice(0, 30))}`);
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  if (item.children.length === 0) item.children.push(seedRun());
  const { runIndex, localIndex } = locateRun(item.children, Math.max(0, charIndex));
  const run = item.children[runIndex];
  if (isBareRun(run)) applyDefaultShape(run);
  const t = run.text || '';
  run.text = t.slice(0, localIndex) + text + t.slice(localIndex);
  requestLayout();
}

function editColor(docIndices: number[], color?: string, backgroundColor?: string) {
  (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
    const item = documentState[docIdx];
    if (item?.type !== 'paragraph') return;
    item.children.forEach((run) => {
      if (color !== undefined) {
        if (color === '') delete run.color;
        else run.color = color;
      }
      if (backgroundColor !== undefined) {
        if (backgroundColor === '') delete run.backgroundColor;
        else run.backgroundColor = backgroundColor;
      }
    });
  });
  requestLayout();
}

function splitRunAt(children: TextRun[], idx: number): number {
  let acc = 0;
  for (let i = 0; i < children.length; i++) {
    const len = children[i].text?.length || 0;
    if (idx <= acc) return i;
    if (idx < acc + len) {
      const run = children[i];
      const t = run.text || '';
      const at = idx - acc;
      children.splice(i, 1, { ...run, text: t.slice(0, at) }, { ...run, text: t.slice(at) });
      return i + 1;
    }
    acc += len;
  }
  return children.length;
}

function applyRunAttrs(
  item: any,
  from: number,
  to: number,
  attrs: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
  },
): boolean {
  if (!item || item.type !== 'paragraph') return false;
  if (item.children.length === 0) item.children.push({ text: '' });
  const total = item.children.reduce((acc: number, r: any) => acc + (r.text?.length || 0), 0);
  const f = Math.max(0, Math.min(from, total));
  const t = Math.max(f, Math.min(to, total));
  if (t <= f) return false;
  // 낮은 쪽 먼저 분할해야 뒤쪽 인덱스가 어긋나지 않음
  const startIdx = splitRunAt(item.children, f);
  const endIdx = splitRunAt(item.children, t);
  for (let i = startIdx; i < endIdx; i++) {
    const run = item.children[i];
    if (attrs.fontFamily !== undefined) run.fontFamily = attrs.fontFamily;
    if (attrs.fontSize !== undefined) run.fontSize = attrs.fontSize;
    if (attrs.color !== undefined) {
      if (attrs.color === '') delete run.color;
      else run.color = attrs.color;
    }
    if (attrs.backgroundColor !== undefined) {
      if (attrs.backgroundColor === '') delete run.backgroundColor;
      else run.backgroundColor = attrs.backgroundColor;
    }
    if (attrs.bold !== undefined) {
      if (attrs.bold) run.bold = true;
      else delete run.bold;
    }
    if (attrs.italic !== undefined) {
      if (attrs.italic) run.italic = true;
      else delete run.italic;
    }
    if (attrs.underline !== undefined) {
      if (attrs.underline) run.underline = true;
      else delete run.underline;
    }
    if (attrs.strike !== undefined) {
      if (attrs.strike) run.strike = true;
      else delete run.strike;
    }
  }
  return true;
}

function editFontRange(
  docIdx: number,
  from: number,
  to: number,
  attrs: { fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean },
) {
  if (applyRunAttrs(documentState[docIdx], from, to, attrs)) requestLayout();
}

function editColorRange(docIdx: number, from: number, to: number, color?: string, backgroundColor?: string) {
  if (applyRunAttrs(documentState[docIdx], from, to, { color, backgroundColor })) requestLayout();
}

function editFont(
  docIdx: number,
  attrs: {
    fontFamily?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
  },
) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  item.children.forEach((run) => {
    if (attrs.fontFamily !== undefined) run.fontFamily = attrs.fontFamily;
    if (attrs.fontSize !== undefined) run.fontSize = attrs.fontSize;
    if (attrs.bold !== undefined) {
      if (attrs.bold) run.bold = true;
      else delete run.bold;
    }
    if (attrs.italic !== undefined) {
      if (attrs.italic) run.italic = true;
      else delete run.italic;
    }
    if (attrs.underline !== undefined) {
      if (attrs.underline) run.underline = true;
      else delete run.underline;
    }
    if (attrs.strike !== undefined) {
      if (attrs.strike) run.strike = true;
      else delete run.strike;
    }
  });
  requestLayout();
}

function editTableAlign(tableDocIdx: number, rows: number[], cols: number[], align?: string) {
  const valid = ['left', 'center', 'right', 'justify'];
  const value = align && valid.includes(align) ? align : 'left';
  const table = documentState[tableDocIdx];
  if (!table || table.type !== 'table') return;
  const rowSet = new Set(Array.isArray(rows) ? rows : []);
  const colSet = new Set(Array.isArray(cols) ? cols : []);
  table.rows.forEach((row, ri) => {
    if (!rowSet.has(ri)) return;
    row.cells.forEach((cell, ci) => {
      if (!colSet.has(ci)) return;
      cell.align = value as any;
    });
  });
  requestLayout();
}

function editTableMerge(tableDocIdx: number, r0: number, r1: number, c0: number, c1: number) {
  const table = documentState[tableDocIdx];
  if (!table || table.type !== 'table') return;
  const top = Math.max(0, Math.min(r0, r1));
  const bottom = Math.min(table.rows.length - 1, Math.max(r0, r1));
  if (bottom < top) return;
  const maxCols = Math.max(0, ...table.rows.map((row) => row.cells.length));
  const left = Math.max(0, Math.min(c0, c1));
  const right = Math.min(maxCols - 1, Math.max(c0, c1));
  if (right < left) return;
  if (bottom === top && right === left) return;
  const masterRow = table.rows[top];
  const master = masterRow && masterRow.cells[left];
  if (!master || master.merged) return;
  const merged: TextRun[] = [];
  for (let r = top; r <= bottom; r++) {
    const row = table.rows[r];
    if (!row) continue;
    for (let c = left; c <= right; c++) {
      const cell = row.cells[c];
      if (!cell) continue;
      if (r === top && c === left) continue;
      merged.push(...(cell.children || []));
      cell.children = [];
      cell.merged = true;
      delete cell.align;
    }
  }
  master.children.push(...merged);
  master.rowSpan = bottom - top + 1;
  master.colSpan = right - left + 1;
  delete master.merged;
  requestLayout();
}

function editTableRowHeight(tableDocIdx: number, rowIndex: number, height: number) {
  const table = documentState[tableDocIdx];
  if (!table || table.type !== 'table') return;
  const row = table.rows.find((r: any) => r && r._rowIdx === rowIndex) ?? table.rows[rowIndex];
  if (!row) return;
  const h = Math.max(24, Math.min(2000, height));
  row.height = h;
  requestLayout();
}

function editTableColWidth(tableDocIdx: number, colIndex: number, width: number) {
  const table = documentState[tableDocIdx];
  if (!table || table.type !== 'table') return;
  const n = Math.max(colIndex + 1, ...(table.rows.map((r) => r.cells.length)), table.colWidths?.length ?? 0);
  const base = 624 / Math.max(1, table.rows[0]?.cells.length ?? n);
  if (!table.colWidths) table.colWidths = new Array(n).fill(base);
  while (table.colWidths.length < n) table.colWidths.push(base);
  for (let i = 0; i < table.colWidths.length; i++) if (!table.colWidths[i]) table.colWidths[i] = base;
  table.colWidths[colIndex] = Math.max(24, Math.min(2000, width));
  requestLayout();
}

function editAlign(docIndices: number[], align?: string) {
  const valid = ['left', 'center', 'right', 'justify'];
  const value = align && valid.includes(align) ? align : 'left';
  (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
    const item = documentState[docIdx];
    if (item?.type !== 'paragraph') return;
    item.align = value as any;
  });
  requestLayout();
}

function editLineSpacing(docIndices: number[], lineSpacing: number) {
  const value = typeof lineSpacing === 'number' && isFinite(lineSpacing) ? Math.min(300, Math.max(50, lineSpacing)) : 160;
  (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
    const item = documentState[docIdx];
    if (item?.type !== 'paragraph') return;
    item.lineSpacing = value;
  });
  requestLayout();
}

function editColumns(docIndices: number[], columns: number) {
  const value = columns && columns > 1 ? columns : undefined;
  (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
    const item = documentState[docIdx];
    if (item?.type !== 'paragraph') return;
    if (value === undefined) {
      delete item.columns;
    } else {
      item.columns = value;
    }
  });
  requestLayout();
}

function editDelete(docIdx: number, charIndex: number) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  if (charIndex <= 0) {
    // 문단 시작점에서 백스페이스: 이전 문단과 병합 (빈 문단 삭제 포함)
    if (docIdx <= 0) return;
    const prev = documentState[docIdx - 1];
    const total = item.children.reduce((acc, r) => acc + (r.text?.length || 0), 0);
    if (!prev || prev.type !== 'paragraph') {
      if (total === 0) documentState.splice(docIdx, 1);
      else return;
      requestLayout();
      return;
    }
    prev.children.push(...item.children);
    documentState.splice(docIdx, 1);
    requestLayout();
    return;
  }
  const total = item.children.reduce((acc, r) => acc + (r.text?.length || 0), 0);
  if (charIndex - 1 >= total) return;
  const { runIndex, localIndex } = locateRun(item.children, charIndex - 1);
  let ri = runIndex;
  let run = item.children[ri];
  while (run && (run.text || '').length === 0 && ri > 0) {
    ri -= 1;
    run = item.children[ri];
  }
  if (!run) return;
  const t = run.text || '';
  if (t.length === 0) return;
  const delAt = Math.min(localIndex, t.length - 1);
  run.text = t.slice(0, Math.max(0, delAt)) + t.slice(delAt + 1);
  requestLayout();
}

function editDeleteForward(docIdx: number, charIndex: number) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  const total = item.children.reduce((acc, r) => acc + (r.text?.length || 0), 0);
  if (charIndex < total) {
    // 커서 위치의 글자 1개 삭제
    const { runIndex, localIndex } = locateRun(item.children, Math.max(0, charIndex));
    let ri = runIndex;
    let run = item.children[ri];
    let local = localIndex;
    while (run && (run.text || '').length === 0 && ri < item.children.length - 1) {
      ri += 1;
      run = item.children[ri];
      local = 0;
    }
    if (!run) return;
    const t = run.text || '';
    if (local >= t.length) {
      let ni = ri + 1;
      while (ni < item.children.length && (item.children[ni].text || '').length === 0) ni += 1;
      if (ni >= item.children.length) return;
      const nt = item.children[ni].text || '';
      item.children[ni].text = nt.slice(1);
    } else {
      run.text = t.slice(0, local) + t.slice(local + 1);
    }
    requestLayout();
    return;
  }
  // 문단 끝에서 DEL: 다음 문단과 병합 (빈 문단 삭제 포함)
  const next = documentState[docIdx + 1];
  if (!next) {
    if (total === 0 && documentState.length > 1) {
      documentState.splice(docIdx, 1);
      requestLayout();
    }
    return;
  }
  if (next.type !== 'paragraph') {
    if (total === 0) {
      documentState.splice(docIdx, 1);
      requestLayout();
    }
    return;
  }
  item.children.push(...next.children);
  documentState.splice(docIdx + 1, 1);
  requestLayout();
}

function editSplit(docIdx: number, charIndex: number) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  const { runIndex, localIndex } = locateRun(item.children, Math.max(0, charIndex));
  const left: TextRun[] = [];
  const right: TextRun[] = [];
  item.children.forEach((run, i) => {
    const t = run.text || '';
    if (i < runIndex) left.push(run);
    else if (i > runIndex) right.push(run);
    else {
      left.push({ ...run, text: t.slice(0, localIndex) });
      right.push({ ...run, text: t.slice(localIndex) });
    }
  });
  const paraProps = {
    align: item.align,
    columns: item.columns,
    indent: item.indent,
    lineSpacing: item.lineSpacing,
    spaceBefore: item.spaceBefore,
    spaceAfter: item.spaceAfter,
  };
  documentState[docIdx] = { type: 'paragraph', children: left.length > 0 ? left : [seedRun()], ...paraProps };
  documentState.splice(docIdx + 1, 0, { type: 'paragraph', children: right.length > 0 ? right : [seedRun()], ...paraProps });
  requestLayout();
}

function editInsertTable(docIdx: number, charIndex: number, rows: number, cols: number) {
  const rCount = Math.max(1, Math.min(50, Math.floor(rows) || 2));
  const cCount = Math.max(1, Math.min(50, Math.floor(cols) || 2));
  const tableRows: TableRowNode[] = [];
  for (let r = 0; r < rCount; r++) {
    const cells: TableCellNode[] = [];
    for (let c = 0; c < cCount; c++) {
      cells.push({ type: 'table-cell', children: [{ text: '' }] });
    }
    tableRows.push({ type: 'table-row', cells });
  }
  const table: TableNode = { type: 'table', rows: tableRows };

  const item = documentState[docIdx];
  if (item?.type === 'paragraph') {
    const { runIndex, localIndex } = locateRun(item.children, Math.max(0, charIndex));
    const left: TextRun[] = [];
    const right: TextRun[] = [];
    item.children.forEach((run, i) => {
      const t = run.text || '';
      if (i < runIndex) left.push(run);
      else if (i > runIndex) right.push(run);
      else {
        left.push({ ...run, text: t.slice(0, localIndex) });
        right.push({ ...run, text: t.slice(localIndex) });
      }
    });
    const paraProps = {
      align: item.align,
      columns: item.columns,
      indent: item.indent,
      lineSpacing: item.lineSpacing,
      spaceBefore: item.spaceBefore,
      spaceAfter: item.spaceAfter,
    };
    const leftPara = { type: 'paragraph' as const, children: left.length > 0 ? left : [seedRun()], ...paraProps };
    const rightPara = { type: 'paragraph' as const, children: right.length > 0 ? right : [seedRun()], ...paraProps };
    documentState.splice(docIdx, 1, leftPara, table, rightPara);
  } else {
    const insertAt = Math.min(Math.max(0, docIdx + 1), documentState.length);
    const emptyPara = { type: 'paragraph' as const, children: [seedRun()] };
    documentState.splice(insertAt, 0, table, emptyPara);
  }
  requestLayout();
}




let layoutToken: { cancelled: boolean } = { cancelled: true };

function requestLayout() {
  layoutToken.cancelled = true;
  const token = { cancelled: false };
  layoutToken = token;
  runLayoutEngineAsync(documentState, (message: any) => self.postMessage(message), token);
}
