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
  } else if (message.type === 'EDIT_SPLIT') {
    editSplit(message.payload.paragraphIndex, message.payload.charIndex);
  } else if (message.type === 'GET_DOC') {
    self.postMessage({ type: 'DOC_SNAPSHOT', payload: documentState });
  } else if (message.type === 'EDIT_FONT') {
    editFont(message.payload.paragraphIndex, message.payload.fontFamily, message.payload.fontSize);
  } else if (message.type === 'EDIT_COLUMNS') {
    editColumns(message.payload.paragraphIndices, message.payload.columns);
  } else if (message.type === 'EDIT_ALIGN') {
    editAlign(message.payload.paragraphIndices, message.payload.align);
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

function editFont(docIdx: number, fontFamily?: string, fontSize?: number) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  item.children.forEach((run) => {
    if (fontFamily !== undefined) run.fontFamily = fontFamily;
    if (fontSize !== undefined) run.fontSize = fontSize;
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
  if (charIndex <= 0) return;
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
  documentState[docIdx] = { type: 'paragraph', children: left.length > 0 ? left : [{ text: '' }], align: item.align, columns: item.columns };
  documentState.splice(docIdx + 1, 0, { type: 'paragraph', children: right.length > 0 ? right : [{ text: '' }], align: item.align, columns: item.columns });
  requestLayout();
}




let layoutToken: { cancelled: boolean } = { cancelled: true };

function requestLayout() {
  layoutToken.cancelled = true;
  const token = { cancelled: false };
  layoutToken = token;
  runLayoutEngineAsync(documentState, (message: any) => self.postMessage(message), token);
}
