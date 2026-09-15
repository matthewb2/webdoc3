import type { DocumentModel } from '../types';
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
  }
});

function editInsert(docIdx: number, charIndex: number, text: string) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  const fullText = item.children[0]?.text || '';
  const before = fullText.slice(0, charIndex);
  const after = fullText.slice(charIndex);
  item.children[0] = { text: before + text + after, bold: item.children[0]?.bold };
  requestLayout();
}

function editDelete(docIdx: number, charIndex: number) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  const fullText = item.children[0]?.text || '';
  if (charIndex <= 0) return;
  const before = fullText.slice(0, charIndex - 1);
  const after = fullText.slice(charIndex);
  item.children[0] = { text: before + after, bold: item.children[0]?.bold };
  requestLayout();
}

function editSplit(docIdx: number, charIndex: number) {
  const item = documentState[docIdx];
  if (item?.type !== 'paragraph') return;
  const fullText = item.children[0]?.text || '';
  const before = fullText.slice(0, charIndex);
  const after = fullText.slice(charIndex);
  documentState[docIdx] = { type: 'paragraph', children: [{ text: before, bold: item.children[0]?.bold }] };
  documentState.splice(docIdx + 1, 0, { type: 'paragraph', children: [{ text: after, bold: item.children[0]?.bold }] });
  requestLayout();
}




let layoutToken: { cancelled: boolean } = { cancelled: true };

function requestLayout() {
  layoutToken.cancelled = true;
  const token = { cancelled: false };
  layoutToken = token;
  runLayoutEngineAsync(documentState, (message: any) => self.postMessage(message), token);
}
