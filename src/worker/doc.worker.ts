import type { DocumentModel, TextRun } from '../types';
import { runLayoutEngineAsync, setBreaks, setFontMetrics } from './layout';
export type { PageModel } from './layout';


let documentState: DocumentModel = [];






self.addEventListener('message', (event: MessageEvent<any>) => {
  const message = event.data;
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
  if (item.children.length === 0) item.children.push({ text: '' });
  const { runIndex, localIndex } = locateRun(item.children, Math.max(0, charIndex));
  const run = item.children[runIndex];
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

function editAlign(docIndices: number[], align?: string) {
  const value = align && align !== 'left' ? align : undefined;
  (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
    const item = documentState[docIdx];
    if (item?.type !== 'paragraph') return;
    if (value === undefined) {
      delete item.align;
    } else {
      item.align = value as any;
    }
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
  documentState[docIdx] = { type: 'paragraph', children: left.length > 0 ? left : [{ text: '' }], align: item.align, columns: item.columns, indent: item.indent };
  documentState.splice(docIdx + 1, 0, { type: 'paragraph', children: right.length > 0 ? right : [{ text: '' }], align: item.align, columns: item.columns, indent: item.indent });
  requestLayout();
}




let layoutToken: { cancelled: boolean } = { cancelled: true };

function requestLayout() {
  layoutToken.cancelled = true;
  const token = { cancelled: false };
  layoutToken = token;
  runLayoutEngineAsync(documentState, (message: any) => self.postMessage(message), token);
}
