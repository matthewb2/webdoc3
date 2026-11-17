import type { DocumentModel, TextRun } from '../types';

export type FindPos = { docIdx: number; charIndex: number; isInsideTable: boolean; rowIndex: number; cellIndex: number };
export type MatchPos = FindPos & { length: number };
type SearchSeg = { pos: FindPos; runs: TextRun[]; text: string };

export type DocOpsContext = {
  getState: () => DocumentModel;
  setState: (s: DocumentModel) => void;
  getDefaultCharShape: () => { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string };
  setDefaultCharShape: (s: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string }) => void;
  requestLayout: () => void;
  emit: (message: any) => void;
};

export function createDocOps(ctx: DocOpsContext) {
  const { getState, getDefaultCharShape, requestLayout } = ctx;
  void ctx.setState;
  void ctx.emit;
  const documentState = () => getState();

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

  function applyDefaultShape(run: TextRun): void {
    const d = getDefaultCharShape();
    if (d.bold) run.bold = true;
    if (d.italic) run.italic = true;
    if (d.underline) run.underline = true;
    if (d.strike) run.strike = true;
    if (d.color) run.color = d.color;
  }

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

  function editDeleteRange(paragraphIndex: number, fromCharIndex: number, endCharIndex: number) {
    const paragraph = documentState()[paragraphIndex];
    if (paragraph && paragraph.type === 'paragraph' && paragraph.children) {
      const total = paragraph.children.reduce((acc, r) => acc + (r.text?.length || 0), 0);
      const f = Math.max(0, Math.min(fromCharIndex, total));
      const t = Math.max(f, Math.min(endCharIndex, total));
      if (t > f) {
        const startIdx = splitRunAt(paragraph.children, f);
        const endIdx = splitRunAt(paragraph.children, t);
        for (let i = startIdx; i < endIdx; i++) {
          paragraph.children[i].text = '';
        }
        if (paragraph.children.length === 0) {
          paragraph.children.push(seedRun());
        }
        requestLayout();
      }
    }
  }

  function editInsert(docIdx: number, charIndex: number, text: string) {
    console.log(`[edit] insert p=${docIdx} at=${charIndex} text=${JSON.stringify(text.slice(0, 30))}`);
    const item = documentState()[docIdx];
    if (item?.type !== 'paragraph') {
      console.log('[shape-space-debug][worker:editInsert] rejected', { docIdx, charIndex, itemType: item?.type ?? null, itemExists: !!item, docLen: documentState().length, text });
      return;
    }
    if (item.children.length === 0) item.children.push(seedRun());
    const { runIndex, localIndex } = locateRun(item.children, Math.max(0, charIndex));
    const run = item.children[runIndex];
    if (isBareRun(run)) applyDefaultShape(run);
    const t = run.text || '';
    run.text = t.slice(0, localIndex) + text + t.slice(localIndex);
    console.log('[shape-space-debug][worker:editInsert] applied', { docIdx, charIndex, runIndex, localIndex, insertedLen: text.length, runTextLenAfter: run.text.length });
    requestLayout();
  }

  function editDelete(docIdx: number, charIndex: number) {
    const state = documentState();
    const item = state[docIdx];
    if (item?.type !== 'paragraph') return;
    if (charIndex <= 0) {
      if (docIdx <= 0) return;
      const prev = state[docIdx - 1];
      const total = item.children.reduce((acc, r) => acc + (r.text?.length || 0), 0);
      if (!prev || prev.type !== 'paragraph') {
        if (total === 0) state.splice(docIdx, 1);
        else return;
        requestLayout();
        return;
      }
      prev.children.push(...item.children);
      state.splice(docIdx, 1);
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
    const state = documentState();
    const item = state[docIdx];
    if (item?.type !== 'paragraph') return;
    const total = item.children.reduce((acc, r) => acc + (r.text?.length || 0), 0);
    if (charIndex < total) {
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
    const next = state[docIdx + 1];
    if (!next) {
      if (total === 0 && state.length > 1) {
        state.splice(docIdx, 1);
        requestLayout();
      }
      return;
    }
    if (next.type !== 'paragraph') {
      if (total === 0) {
        state.splice(docIdx, 1);
        requestLayout();
      }
      return;
    }
    item.children.push(...next.children);
    state.splice(docIdx + 1, 1);
    requestLayout();
  }

  function editSplit(docIdx: number, charIndex: number) {
    const state = documentState();
    const item = state[docIdx];
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
      leftIndent: item.leftIndent,
      textIndent: item.textIndent,
      lineSpacing: item.lineSpacing,
      spaceBefore: item.spaceBefore,
      spaceAfter: item.spaceAfter,
    };
    state[docIdx] = { type: 'paragraph', children: left.length > 0 ? left : [seedRun()], ...paraProps };
    state.splice(docIdx + 1, 0, { type: 'paragraph', children: right.length > 0 ? right : [seedRun()], ...paraProps });
    requestLayout();
  }

  function editInsertShape(docIdx: number, charIndex: number, shape: 'rect' | 'ellipse' | 'line' | 'arrow') {
    const state = documentState();
    const defaults: Record<string, { w: number; h: number }> = {
      rect: { w: 180, h: 100 },
      ellipse: { w: 160, h: 100 },
      line: { w: 180, h: 2 },
      arrow: { w: 180, h: 40 },
    };
    const d = defaults[shape] || { w: 160, h: 100 };
    const shapeNode: any = {
      type: 'shape',
      shape,
      width: d.w,
      height: d.h,
      fill: shape === 'line' || shape === 'arrow' ? 'none' : '#d9e8ff',
      stroke: '#2b579a',
      strokeWidth: 2,
    };

    const item = state[docIdx];
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
        leftIndent: item.leftIndent,
        textIndent: item.textIndent,
        lineSpacing: item.lineSpacing,
        spaceBefore: item.spaceBefore,
        spaceAfter: item.spaceAfter,
      };
      const leftPara = { type: 'paragraph' as const, children: left.length > 0 ? left : [seedRun()], ...paraProps };
      const rightPara = { type: 'paragraph' as const, children: right.length > 0 ? right : [seedRun()], ...paraProps };
      state.splice(docIdx, 1, leftPara, shapeNode, rightPara);
    } else {
      const insertAt = Math.min(Math.max(0, docIdx + 1), state.length);
      const emptyPara = { type: 'paragraph' as const, children: [seedRun()] };
      state.splice(insertAt, 0, shapeNode, emptyPara);
    }
    requestLayout();
  }

  function editColor(docIndices: number[], color?: string, backgroundColor?: string) {
    (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
      const item = documentState()[docIdx];
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

  function editFontRange(docIdx: number, from: number, to: number, attrs: { fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean }) {
    if (applyRunAttrs(documentState()[docIdx], from, to, attrs)) requestLayout();
  }

  function editColorRange(docIdx: number, from: number, to: number, color?: string, backgroundColor?: string) {
    if (applyRunAttrs(documentState()[docIdx], from, to, { color, backgroundColor })) requestLayout();
  }

  function editFont(docIdx: number, attrs: { fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean }) {
    const item = documentState()[docIdx];
    if (item?.type !== 'paragraph') return;
    item.children.forEach((run) => {
      if (attrs.fontFamily !== undefined) run.fontFamily = attrs.fontFamily;
      if (attrs.fontSize !== undefined) run.fontSize = attrs.fontSize;
      if (attrs.bold !== undefined) { if (attrs.bold) run.bold = true; else delete run.bold; }
      if (attrs.italic !== undefined) { if (attrs.italic) run.italic = true; else delete run.italic; }
      if (attrs.underline !== undefined) { if (attrs.underline) run.underline = true; else delete run.underline; }
      if (attrs.strike !== undefined) { if (attrs.strike) run.strike = true; else delete run.strike; }
    });
    requestLayout();
  }

  function editAlign(docIndices: number[], align?: string) {
    const valid = ['left', 'center', 'right', 'justify'];
    const value = align && valid.includes(align) ? align : 'left';
    (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
      const item = documentState()[docIdx];
      if (item?.type !== 'paragraph') return;
      item.align = value as any;
    });
    requestLayout();
  }

  function editLineSpacing(docIndices: number[], lineSpacing: number) {
    const value = typeof lineSpacing === 'number' && isFinite(lineSpacing) ? Math.min(300, Math.max(50, lineSpacing)) : 160;
    (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
      const item = documentState()[docIdx];
      if (item?.type !== 'paragraph') return;
      item.lineSpacing = value;
    });
    requestLayout();
  }

  function editIndent(docIndices: number[], payload: { leftIndent?: number; textIndent?: number }) {
    (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
      const item = documentState()[docIdx];
      if (item?.type !== 'paragraph') return;
      if (payload.leftIndent !== undefined) {
        const v = Number(payload.leftIndent);
        if (Number.isFinite(v)) item.leftIndent = Math.max(0, Math.min(600, Math.round(v * 100) / 100));
      }
      if (payload.textIndent !== undefined) {
        const v = Number(payload.textIndent);
        if (Number.isFinite(v)) item.textIndent = Math.max(-600, Math.min(600, Math.round(v * 100) / 100));
      }
      if (payload.leftIndent !== undefined || payload.textIndent !== undefined) {
        delete item.indent;
      }
    });
    requestLayout();
  }

  function editApplyStyle(
    docIndices: number[],
    style: { align?: string; lineSpacing?: number; fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string },
  ) {
    const validAlign = ['left', 'center', 'right', 'justify'];
    const indices = Array.isArray(docIndices) ? docIndices : [];
    if (indices.length === 0) return;
    indices.forEach((docIdx) => {
      const item = documentState()[docIdx];
      if (item?.type !== 'paragraph') return;
      if (style.align && validAlign.includes(style.align)) item.align = style.align as any;
      if (typeof style.lineSpacing === 'number' && isFinite(style.lineSpacing)) {
        item.lineSpacing = Math.min(300, Math.max(50, style.lineSpacing));
      }
      item.children.forEach((run) => {
        if (style.fontFamily !== undefined) run.fontFamily = style.fontFamily;
        if (style.fontSize !== undefined) run.fontSize = style.fontSize;
        if (style.color !== undefined) {
          if (style.color === '') delete run.color;
          else run.color = style.color;
        }
        if (style.bold !== undefined) { if (style.bold) run.bold = true; else delete run.bold; }
        if (style.italic !== undefined) { if (style.italic) run.italic = true; else delete run.italic; }
        if (style.underline !== undefined) { if (style.underline) run.underline = true; else delete run.underline; }
        if (style.strike !== undefined) { if (style.strike) run.strike = true; else delete run.strike; }
      });
    });
    requestLayout();
  }

  function editColumns(docIndices: number[], columns: number) {
    const value = columns && columns > 1 ? columns : undefined;
    (Array.isArray(docIndices) ? docIndices : []).forEach((docIdx) => {
      const item = documentState()[docIdx];
      if (item?.type !== 'paragraph') return;
      if (value === undefined) delete item.columns;
      else item.columns = value;
    });
    requestLayout();
  }

  // Find/replace
  function collectSearchSegments(): SearchSeg[] {
    const segs: SearchSeg[] = [];
    const state = documentState();
    for (let docIdx = 0; docIdx < state.length; docIdx++) {
      const item = state[docIdx];
      if (!item) continue;
      if (item.type === 'paragraph') {
        const runs = item.children || [];
        segs.push({ pos: { docIdx, charIndex: 0, isInsideTable: false, rowIndex: 0, cellIndex: 0 }, runs, text: runs.map((r) => r.text || '').join('') });
      } else if (item.type === 'table') {
        item.rows.forEach((row, rowIndex) => {
          row.cells.forEach((cell, cellIndex) => {
            if (!cell || (cell as any).merged) return;
            const runs = cell.children || [];
            segs.push({ pos: { docIdx, charIndex: 0, isInsideTable: true, rowIndex, cellIndex }, runs, text: runs.map((r) => r.text || '').join('') });
          });
        });
      }
    }
    return segs;
  }

  function samePos(a: FindPos | null | undefined, b: FindPos): boolean {
    if (!a) return false;
    return a.docIdx === b.docIdx && a.isInsideTable === b.isInsideTable && a.rowIndex === b.rowIndex && a.cellIndex === b.cellIndex;
  }

  function posAfter(from: FindPos | null, queryLen: number, seg: SearchSeg, forward: boolean): number {
    if (!from || !samePos(from, seg.pos)) return 0;
    const base = Math.max(0, from.charIndex);
    return forward ? base + Math.max(1, queryLen) : Math.max(0, base - 1);
  }

  function findInModel(query: string, from: FindPos | null, direction: 'forward' | 'backward'): MatchPos | null {
    if (!query) return null;
    const segs = collectSearchSegments();
    if (segs.length === 0) return null;
    let fromSegIdx = -1;
    if (from) fromSegIdx = segs.findIndex((s) => samePos(from, s.pos));
    if (direction === 'forward') {
      for (let pass = 0; pass < 2; pass++) {
        const start = pass === 0 ? Math.max(0, fromSegIdx) : 0;
        const end = pass === 0 ? segs.length : Math.max(0, fromSegIdx + 1);
        for (let si = start; si < end; si++) {
          const seg = segs[si];
          const offset = pass === 0 ? posAfter(from, query.length, seg, true) : 0;
          const idx = seg.text.indexOf(query, offset);
          if (idx >= 0) return { ...seg.pos, charIndex: idx, length: query.length };
        }
        if (fromSegIdx < 0) break;
      }
    } else {
      for (let pass = 0; pass < 2; pass++) {
        const start = pass === 0 ? (fromSegIdx >= 0 ? fromSegIdx : segs.length - 1) : segs.length - 1;
        const end = pass === 0 ? -1 : (fromSegIdx >= 0 ? fromSegIdx - 1 : -1);
        for (let si = start; si > end; si--) {
          const seg = segs[si];
          let searchFrom = seg.text.length;
          if (pass === 0 && from && samePos(from, seg.pos)) searchFrom = Math.max(0, from.charIndex - 1);
          const idx = seg.text.lastIndexOf(query, searchFrom);
          if (idx >= 0) return { ...seg.pos, charIndex: idx, length: query.length };
        }
        if (fromSegIdx < 0) break;
      }
    }
    return null;
  }

  function replaceInRuns(runs: TextRun[], charIndex: number, length: number, replacement: string): boolean {
    if (runs.length === 0) runs.push(seedRun());
    const total = runs.reduce((acc, r) => acc + (r.text?.length || 0), 0);
    const from = Math.max(0, Math.min(charIndex, total));
    const to = Math.max(from, Math.min(charIndex + length, total));
    if (to < from) return false;
    if (to > from) {
      const startIdx = splitRunAt(runs, from);
      const endIdx = splitRunAt(runs, to);
      for (let i = startIdx; i < endIdx; i++) runs[i].text = '';
    }
    if (replacement.length > 0) {
      const { runIndex, localIndex } = locateRun(runs, from);
      const run = runs[runIndex];
      if (run && isBareRun(run)) applyDefaultShape(run);
      if (run) {
        const t = run.text || '';
        run.text = t.slice(0, localIndex) + replacement + t.slice(localIndex);
      }
    }
    const compacted = runs.filter((r) => (r.text || '').length > 0 || runs.length === 1);
    if (compacted.length === 0) compacted.push(seedRun());
    runs.length = 0;
    runs.push(...compacted);
    return true;
  }

  function getRunsForPos(pos: FindPos): TextRun[] | null {
    const item = documentState()[pos.docIdx];
    if (!item) return null;
    if (!pos.isInsideTable && item.type === 'paragraph') return item.children || [];
    if (pos.isInsideTable && item.type === 'table') {
      const cell = item.rows[pos.rowIndex]?.cells[pos.cellIndex];
      if (!cell || (cell as any).merged) return null;
      if (!cell.children) cell.children = [];
      return cell.children;
    }
    return null;
  }

  function replaceOneInModel(query: string, replacement: string, from: FindPos | null): { replaced: boolean; count?: number; next?: MatchPos | null } {
    if (!query) return { replaced: false };
    const match = findInModel(query, from, 'forward');
    if (!match) return { replaced: false, next: null };
    const runs = getRunsForPos(match);
    if (!runs) return { replaced: false };
    replaceInRuns(runs, match.charIndex, match.length, replacement);
    requestLayout();
    const nextFrom: FindPos = { ...match, charIndex: match.charIndex + replacement.length };
    const next = findInModel(query, nextFrom, 'forward');
    return { replaced: true, count: 1, next: next || null };
  }

  function replaceAllInModel(query: string, replacement: string): number {
    if (!query) return 0;
    let count = 0;
    const segs = collectSearchSegments();
    for (const seg of segs) {
      let text = seg.runs.map((r) => r.text || '').join('');
      if (!text.includes(query)) continue;
      let idx = text.lastIndexOf(query);
      while (idx >= 0) {
        replaceInRuns(seg.runs, idx, query.length, replacement);
        count++;
        text = seg.runs.map((r) => r.text || '').join('');
        idx = text.lastIndexOf(query, idx - 1);
      }
    }
    if (count > 0) requestLayout();
    return count;
  }

  return {
    seedRun,
    locateRun,
    editDeleteRange,
    editInsert,
    editDelete,
    editDeleteForward,
    editSplit,
    editInsertShape,
    editColor,
    editFontRange,
    editColorRange,
    editFont,
    editAlign,
    editLineSpacing,
    editIndent,
    editApplyStyle,
    editColumns,
    findInModel,
    replaceOneInModel,
    replaceAllInModel,
  };
}
