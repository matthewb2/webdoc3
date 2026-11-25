import type { CursorState } from '../types';
import { defaultAlign, defaultFontFamily, defaultFontSize } from '../settings';
import { getInstalledFonts } from '../utils/fontRegistry';
import { cellPosFromTd, getCellSelection, type CellSel } from './tableSelection';
import { peekPendingSelection, selectedParagraphIndices, selectionRangeInParagraph, stashSelection } from '../selection';

export interface FontStyleAttrs {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

const DEFAULT_FONT_FAMILIES = [
  '맑은 고딕', '바탕', '굴림', '돋움', '궁서',
  'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Courier New', 'Noto Sans KR',
];

const FONT_SIZES_PT = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
const pxToPt = (px: number) => Math.round(((px * 72) / 96) * 10) / 10;
const ptToPx = (pt: number) => Math.round(((pt * 96) / 72) * 100) / 100;

let fontContainer: HTMLDivElement | null = null;
let fontWorker: Worker | null = null;
let fontCursor: CursorState | null = null;

export function getFontContainer(): HTMLDivElement | null {
  return fontContainer;
}

function canonicalFontListName(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes('함초롬바탕') || lower.includes('함초롱바탕') || lower === 'batang' || lower === '바탕') return '바탕';
  if (lower.includes('함초롬돋움') || lower.includes('함초롱돋움')) return '맑은 고딕';
  if (lower === 'dotum' || lower === '돋움') return '돋움';
  if (lower === 'malgun gothic' || lower === '맑은 고딕') return '맑은 고딕';
  if (lower === 'gulim' || lower === '굴림') return '굴림';
  if (lower === 'gungsuh' || lower === '궁서') return '궁서';
  return name.trim();
}

function getFontFamilyList(): string[] {
  const installed = getInstalledFonts();
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (f: string) => {
    const k = canonicalFontListName(f).toLowerCase().trim();
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(canonicalFontListName(f));
  };
  for (const f of DEFAULT_FONT_FAMILIES) add(f);
  if (installed.length > 0) {
    const rest = installed.filter((f) => !seen.has(canonicalFontListName(f).toLowerCase().trim()));
    rest.sort((a, b) => a.localeCompare(b, 'ko'));
    for (const f of rest) add(f);
  }
  return out;
}

function fillSelect(select: HTMLSelectElement, values: Array<string | number>) {
  const existing = Array.from(select.options).map((o) => o.value);
  const wanted = values.map((v) => String(v));
  if (existing.length === wanted.length && existing.every((v, i) => v === wanted[i])) return;
  select.innerHTML = '';
  values.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = String(v);
    opt.textContent = String(v);
    select.appendChild(opt);
  });
}

function canonicalFontName(value: string): string {
  const raw = (value || '').split(',')[0].replace(/['"]/g, '').trim();
  const lower = raw.toLowerCase();
  if (lower.includes('함초롬바탕') || lower.includes('함초롱바탕') || lower === 'batang' || lower === '바탕') return '바탕';
  if (lower.includes('함초롬돋움') || lower.includes('함초롱돋움')) return '맑은 고딕';
  if (lower === 'dotum' || lower === '돋움') return '돋움';
  if (lower === 'malgun gothic' || lower === '맑은 고딕') return '맑은 고딕';
  if (lower === 'gulim' || lower === '굴림') return '굴림';
  if (lower === 'gungsuh' || lower === '궁서') return '궁서';
  return raw;
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const norm = (s: string) => s.replace(/['"]/g, '').trim().toLowerCase();
  const raw = (value || '').split(',')[0].replace(/['"]/g, '').trim();
  const canonical = canonicalFontName(value);
  const options = Array.from(select.options);
  const found =
    options.find((o) => norm(o.value) === norm(value)) ||
    options.find((o) => norm(o.value) === norm(raw)) ||
    options.find((o) => norm(o.value) === norm(canonical)) ||
    options.find((o) => norm(canonicalFontName(o.value)) === norm(canonical));
  if (found) {
    select.value = found.value;
  } else if (raw) {
    const opt = document.createElement('option');
    opt.value = raw;
    opt.textContent = raw;
    select.appendChild(opt);
    select.value = raw;
  }
}

export function refreshFontFamilyList(): void {
  const familySelect = document.getElementById('font-family-select') as HTMLSelectElement | null;
  if (!familySelect) return;
  const current = familySelect.value;
  fillSelect(familySelect, getFontFamilyList());
  setSelectValue(familySelect, current || defaultFontFamily());
}

export function postFontStyle(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  attrs: FontStyleAttrs,
) {
  const snap = peekPendingSelection();
  selectedParagraphIndices(container, cursor.docIdx, snap).forEach((docIdx) => {
    const r = selectionRangeInParagraph(container, docIdx, snap);
    if (r) {
      worker.postMessage({
        type: 'EDIT_FONT_RANGE',
        payload: { paragraphIndex: docIdx, fromCharIndex: r.from, endCharIndex: r.to, ...attrs },
      });
    } else {
      worker.postMessage({ type: 'EDIT_FONT', payload: { paragraphIndex: docIdx, ...attrs } });
    }
  });
}

function postColorStyle(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  attrs: { color?: string; backgroundColor?: string },
) {
  const snap = peekPendingSelection();
  selectedParagraphIndices(container, cursor.docIdx, snap).forEach((docIdx) => {
    const r = selectionRangeInParagraph(container, docIdx, snap);
    if (r) {
      worker.postMessage({
        type: 'EDIT_COLOR_RANGE',
        payload: { paragraphIndex: docIdx, fromCharIndex: r.from, endCharIndex: r.to, ...attrs },
      });
    } else {
      worker.postMessage({ type: 'EDIT_COLOR', payload: { paragraphIndices: [docIdx], ...attrs } });
    }
  });
}

export function syncFontCombos() {
  if (!fontContainer) return;
  const familySelect = document.getElementById('font-family-select') as HTMLSelectElement | null;
  const sizeSelect = document.getElementById('font-size-select') as HTMLSelectElement | null;
  if (!familySelect || !sizeSelect || familySelect.options.length === 0) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node || !fontContainer.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const span = el?.closest?.('span') as HTMLSpanElement | null;
  if (!span || !fontContainer.contains(span)) return;
  setSelectValue(familySelect, span.style.fontFamily || defaultFontFamily());
  const sizePx = parseFloat(span.style.fontSize);
  const pt = isNaN(sizePx) ? pxToPt(defaultFontSize()) : pxToPt(sizePx);
  const ptText = Math.abs(pt - Math.round(pt)) < 0.01 ? String(Math.round(pt)) : String(pt);
  setSelectValue(sizeSelect, ptText);
}

export function initFontCombos(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  fontContainer = container;
  fontWorker = worker;
  fontCursor = cursor;
  const familySelect = document.getElementById('font-family-select') as HTMLSelectElement | null;
  const sizeSelect = document.getElementById('font-size-select') as HTMLSelectElement | null;
  if (!familySelect || !sizeSelect) return;
  fillSelect(familySelect, getFontFamilyList());
  fillSelect(sizeSelect, FONT_SIZES_PT.map(String));
  familySelect.disabled = false;
  sizeSelect.disabled = false;
  familySelect.value = defaultFontFamily();
  const initPt = pxToPt(defaultFontSize());
  sizeSelect.value = Math.abs(initPt - Math.round(initPt)) < 0.01 ? String(Math.round(initPt)) : String(initPt);
  familySelect.addEventListener('pointerdown', () => stashSelection(container));
  sizeSelect.addEventListener('pointerdown', () => stashSelection(container));
  familySelect.addEventListener('change', () => {
    if (fontWorker && fontCursor) {
      postFontStyle(container, fontWorker, fontCursor, { fontFamily: familySelect.value });
    }
  });
  sizeSelect.addEventListener('change', () => {
    const ptSize = parseFloat(sizeSelect.value);
    if (fontWorker && fontCursor && !isNaN(ptSize)) {
      postFontStyle(container, fontWorker, fontCursor, { fontSize: ptToPx(ptSize) });
    }
  });
  syncFontCombos();
}

export function initColumnCombo(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const select = document.getElementById('column-count-select') as HTMLSelectElement | null;
  if (!select) return;
  select.addEventListener('pointerdown', () => stashSelection(container));
  select.addEventListener('change', () => {
    const n = parseInt(select.value, 10) || 1;
    const snap = peekPendingSelection();
    worker.postMessage({
      type: 'EDIT_COLUMNS',
      payload: { paragraphIndices: selectedParagraphIndices(container, cursor.docIdx, snap), columns: n },
    });
  });
  syncColumnCombo();
}

export function syncColumnCombo() {
  const select = document.getElementById('column-count-select') as HTMLSelectElement | null;
  if (!select) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node) return;
  const container = document.getElementById('editor-container');
  if (!container || !container.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const p = el?.closest?.('p');
  if (!p || !container.contains(p)) return;
  const wrap = p.closest('div[data-cols]');
  select.value = (wrap && wrap.getAttribute('data-cols')) || '1';
  if (!['1', '2', '3'].includes(select.value)) select.value = '1';
}

function currentTableTarget(container: HTMLDivElement): CellSel | null {
  const selection = window.getSelection();
  const node = selection && selection.rangeCount > 0 ? selection.anchorNode : null;
  const el = node ? (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null)) : null;
  const td = el?.closest?.('td') as HTMLTableCellElement | null;
  if (!td || !container.contains(td)) return null;
  const sel = getCellSelection();
  const pos = cellPosFromTd(td);
  if (!pos) return null;
  if (sel && sel.tableDocIdx === pos.tableDocIdx) return sel;
  return { tableDocIdx: pos.tableDocIdx, r0: pos.r, r1: pos.r, c0: pos.c, c1: pos.c };
}

export function initAlignCombo(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const select = document.getElementById('align-select') as HTMLSelectElement | null;
  if (!select) return;
  select.addEventListener('pointerdown', () => stashSelection(container));
  select.addEventListener('change', () => {
    const raw = select.value;
    const align = ['left', 'center', 'right', 'justify'].includes(raw) ? raw : 'left';
    const tableTarget = currentTableTarget(container);
    if (tableTarget) {
      const rows: number[] = [];
      for (let r = tableTarget.r0; r <= tableTarget.r1; r++) rows.push(r);
      const cols: number[] = [];
      for (let c = tableTarget.c0; c <= tableTarget.c1; c++) cols.push(c);
      worker.postMessage({ type: 'EDIT_TABLE_ALIGN', payload: { tableDocIdx: tableTarget.tableDocIdx, rows, cols, align } });
      return;
    }
    const snap = peekPendingSelection();
    worker.postMessage({
      type: 'EDIT_ALIGN',
      payload: { paragraphIndices: selectedParagraphIndices(container, cursor.docIdx, snap), align },
    });
  });
  syncAlignCombo();
}

export function syncAlignCombo() {
  const select = document.getElementById('align-select') as HTMLSelectElement | null;
  if (!select) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node) return;
  const container = document.getElementById('editor-container');
  if (!container || !container.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const p = el?.closest?.('p');
  if (p && container.contains(p)) {
    select.value = (p as HTMLElement).dataset.align || defaultAlign();
  } else {
    const td = el?.closest?.('td') as HTMLElement | null;
    if (!td || !container.contains(td)) return;
    const align = td.style.textAlign || defaultAlign();
    select.value = ['left', 'center', 'right', 'justify'].includes(align) ? align : defaultAlign();
    return;
  }
  if (!['left', 'center', 'right', 'justify'].includes(select.value)) select.value = defaultAlign();
}

function cssColorToHex(color: string): string | null {
  const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (m) {
    const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `#${h(+m[1])}${h(+m[2])}${h(+m[3])}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color.toLowerCase();
  return null;
}

export function initColorControls(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const textInput = document.getElementById('text-color-input') as HTMLInputElement | null;
  const bgInput = document.getElementById('bg-color-input') as HTMLInputElement | null;
  if (!textInput || !bgInput) return;
  textInput.addEventListener('pointerdown', () => stashSelection(container));
  bgInput.addEventListener('pointerdown', () => stashSelection(container));
  textInput.addEventListener('input', () => {
    postColorStyle(container, worker, cursor, { color: textInput.value });
  });
  bgInput.addEventListener('input', () => {
    postColorStyle(container, worker, cursor, { backgroundColor: bgInput.value });
  });
  textInput.addEventListener('dblclick', () => {
    postColorStyle(container, worker, cursor, { color: '' });
  });
  bgInput.addEventListener('dblclick', () => {
    postColorStyle(container, worker, cursor, { backgroundColor: '' });
  });
  syncColorControls();
}

export function syncColorControls() {
  const textInput = document.getElementById('text-color-input') as HTMLInputElement | null;
  const bgInput = document.getElementById('bg-color-input') as HTMLInputElement | null;
  if (!textInput || !bgInput) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const node = selection.anchorNode;
  if (!node) return;
  const container = document.getElementById('editor-container');
  if (!container || !container.contains(node)) return;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const span = el?.closest?.('span') as HTMLSpanElement | null;
  if (!span || !container.contains(span)) return;
  textInput.value = cssColorToHex(span.style.color || '') || '#000000';
  bgInput.value = cssColorToHex(span.style.backgroundColor || '') || '#ffffff';
}