import type { DocumentModel } from '../types';
import { clearBreaks, runLayoutEngineAsync, setBreaks, setDefaultLineSpacing, setFontMetrics } from '../layout/layout';
import { setPageMargins } from '../layout/layoutConstants';
import { editTableAlign, editTableBorder, editTableColWidth, editTableMerge, editTableRowHeight, editInsertTable as editInsertTableOp } from './tableOps';
import { createDocOps } from './docOps';
export type { PageModel } from '../layout/layout';

export interface DocEngine {
  postMessage(message: any): void;
  addEventListener(type: 'message', listener: (event: MessageEvent<any>) => void): void;
  removeEventListener(type: 'message', listener: (event: MessageEvent<any>) => void): void;
}

export function createDocEngine(): DocEngine {
  const listeners = new Set<(event: MessageEvent<any>) => void>();
  const emit = (message: any) => {
    const event = { data: message } as MessageEvent<any>;
    listeners.forEach((l) => l(event));
  };

  let documentState: DocumentModel = [];
  let defaultCharShape: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string } = {};

  let layoutToken: { cancelled: boolean } = { cancelled: true };
  let layoutRaf = 0;

  function requestLayout() {
    // Invalidate any in-flight async layout work; the scheduled rAF will pick up the latest token/state.
    layoutToken.cancelled = true;
    layoutToken = { cancelled: false };
    if (layoutRaf) return;
    layoutRaf = window.requestAnimationFrame(() => {
      layoutRaf = 0;
      const token = layoutToken;
      runLayoutEngineAsync(documentState, (message: any) => emit(message), token);
    });
  }

  const ops = createDocOps({
    getState: () => documentState,
    setState: (s) => { documentState = s; },
    getDefaultCharShape: () => defaultCharShape,
    setDefaultCharShape: (s) => { defaultCharShape = s; },
    requestLayout,
    emit,
  });

  const handleMessage = (message: any) => {
    if (message.type === 'EDIT_DELETE_RANGE') {
      const { paragraphIndex, fromCharIndex, endCharIndex } = message.payload;
      ops.editDeleteRange(paragraphIndex, fromCharIndex, endCharIndex);
    } else if (message.type === 'INIT_METRICS') {
      setFontMetrics(message.payload);
    } else if (message.type === 'BREAKS') {
      setBreaks(message.payload as Record<string, number[]>);
    } else if (message.type === 'INIT_DOC') {
      documentState = message.payload;
      requestLayout();
    } else if (message.type === 'EDIT_INSERT') {
      ops.editInsert(message.payload.paragraphIndex, message.payload.charIndex, message.payload.text);
    } else if (message.type === 'EDIT_DELETE') {
      ops.editDelete(message.payload.paragraphIndex, message.payload.charIndex);
    } else if (message.type === 'EDIT_DELETE_FWD') {
      ops.editDeleteForward(message.payload.paragraphIndex, message.payload.charIndex);
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
      ops.editLineSpacing(message.payload.paragraphIndices, message.payload.lineSpacing);
    } else if (message.type === 'EDIT_SPLIT') {
      ops.editSplit(message.payload.paragraphIndex, message.payload.charIndex);
    } else if (message.type === 'GET_DOC') {
      emit({ type: 'DOC_SNAPSHOT', payload: documentState });
    } else if (message.type === 'EDIT_FONT') {
      ops.editFont(message.payload.paragraphIndex, message.payload);
    } else if (message.type === 'EDIT_COLUMNS') {
      ops.editColumns(message.payload.paragraphIndices, message.payload.columns);
    } else if (message.type === 'EDIT_ALIGN') {
      ops.editAlign(message.payload.paragraphIndices, message.payload.align);
    } else if (message.type === 'EDIT_TABLE_ALIGN') {
      editTableAlign(documentState, requestLayout, message.payload.tableDocIdx, message.payload.rows, message.payload.cols, message.payload.align);
    } else if (message.type === 'EDIT_TABLE_MERGE') {
      editTableMerge(documentState, requestLayout, message.payload.tableDocIdx, message.payload.r0, message.payload.r1, message.payload.c0, message.payload.c1);
    } else if (message.type === 'EDIT_TABLE_ROW_HEIGHT') {
      editTableRowHeight(documentState, requestLayout, message.payload.tableDocIdx, message.payload.rowIndex, message.payload.height);
    } else if (message.type === 'EDIT_TABLE_COL_WIDTH') {
      editTableColWidth(documentState, requestLayout, message.payload.tableDocIdx, message.payload.colIndex, message.payload.width);
    } else if (message.type === 'EDIT_INSERT_TABLE') {
      editInsertTableOp(documentState, requestLayout, { locateRun: ops.locateRun, seedRun: ops.seedRun }, message.payload.paragraphIndex, message.payload.charIndex, message.payload.rows, message.payload.cols);
    } else if (message.type === 'EDIT_INSERT_SHAPE') {
      console.log('[shape-space-debug][worker] EDIT_INSERT_SHAPE', message.payload, 'docLenBefore=', documentState.length, 'targetType=', documentState[message.payload?.paragraphIndex]?.type);
      ops.editInsertShape(message.payload.paragraphIndex, message.payload.charIndex, message.payload.shape);
      console.log('[shape-space-debug][worker] after EDIT_INSERT_SHAPE docLen=', documentState.length);
    } else if (message.type === 'EDIT_SHAPE_PLACEMENT') {
      const node = documentState[message.payload.docIdx];
      if (node && (node as any).type === 'shape') {
        (node as any).placement = message.payload.placement;
        requestLayout();
      }
    } else if (message.type === 'EDIT_TABLE_BORDER') {
      editTableBorder(documentState, requestLayout, message.payload.tableDocIdx, message.payload.borderStyle);
    } else if (message.type === 'SET_PAGE_MARGINS') {
      setPageMargins(message.payload);
      clearBreaks();
      requestLayout();
    } else if (message.type === 'EDIT_COLOR') {
      ops.editColor(message.payload.paragraphIndices, message.payload.color, message.payload.backgroundColor);
    } else if (message.type === 'EDIT_FONT_RANGE') {
      ops.editFontRange(message.payload.paragraphIndex, message.payload.fromCharIndex, message.payload.endCharIndex, message.payload);
    } else if (message.type === 'EDIT_COLOR_RANGE') {
      ops.editColorRange(message.payload.paragraphIndex, message.payload.fromCharIndex, message.payload.endCharIndex, message.payload.color, message.payload.backgroundColor);
    } else if (message.type === 'EDIT_FIND') {
      const { query, from, direction } = message.payload || {};
      const match = ops.findInModel(query || '', from || null, direction === 'backward' ? 'backward' : 'forward');
      emit({ type: 'FIND_RESULT', payload: { found: !!match, match: match || undefined } });
    } else if (message.type === 'EDIT_REPLACE') {
      const { query, replacement, from } = message.payload || {};
      const result = ops.replaceOneInModel(query || '', replacement ?? '', from || null);
      emit({ type: 'REPLACE_RESULT', payload: result });
    } else if (message.type === 'EDIT_REPLACE_ALL') {
      const { query, replacement } = message.payload || {};
      const count = ops.replaceAllInModel(query || '', replacement ?? '');
      emit({ type: 'REPLACE_ALL_RESULT', payload: { count } });
    } else if (message.type === 'EDIT_APPLY_STYLE') {
      ops.editApplyStyle(message.payload?.paragraphIndices || [], message.payload || {});
    } else if (message.type === 'EDIT_INDENT') {
      ops.editIndent(message.payload?.paragraphIndices || [], message.payload || {});
    }
  };

  return {
    postMessage(message: any) {
      // Synchronous model/state updates on main thread; layout is scheduled asynchronously.
      handleMessage(message);
    },
    addEventListener(type: 'message', listener: (event: MessageEvent<any>) => void) {
      if (type === 'message') listeners.add(listener);
    },
    removeEventListener(type: 'message', listener: (event: MessageEvent<any>) => void) {
      if (type === 'message') listeners.delete(listener);
    },
  };
}
