import type { CursorState } from '../types';
import { defaultAlign, defaultFontFamily, defaultFontSize, defaultLineSpacing } from '../settings';
import { stashSelection } from '../selection';
import { getFontContainer, postFontStyle } from './formatControlsHandler';

function anchorSpan(): HTMLSpanElement | null {
  const fontContainer = getFontContainer();
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const node = selection.anchorNode;
  if (!node || !fontContainer || !fontContainer.contains(node)) return null;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const span = el?.closest?.('span') as HTMLSpanElement | null;
  if (!span || !fontContainer.contains(span)) return null;
  return span;
}

function spanStyleState(span: HTMLSpanElement): { bold: boolean; italic: boolean; underline: boolean } {
  const weight = span.style.fontWeight;
  return {
    bold: weight === 'bold' || (weight !== '' && !isNaN(Number(weight)) && Number(weight) >= 700),
    italic: span.style.fontStyle === 'italic',
    underline: (span.style.textDecoration || '').includes('underline'),
  };
}

export function initParagraphStyles(_container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const bodyBtn = document.getElementById('btn-style-body') as HTMLButtonElement | null;
  const titleBtn = document.getElementById('btn-style-title') as HTMLButtonElement | null;
  if (!bodyBtn || !titleBtn) return;
  [bodyBtn, titleBtn].forEach((btn) => btn.addEventListener('mousedown', (e) => e.preventDefault()));
  const targetParagraphIndices = (): number[] => {
    if (cursor.isInsideTable) return [];
    return [cursor.docIdx];
  };
  bodyBtn.addEventListener('click', () => {
    const indices = targetParagraphIndices();
    if (indices.length === 0) return;
    worker.postMessage({
      type: 'EDIT_APPLY_STYLE',
      payload: {
        paragraphIndices: indices,
        align: defaultAlign(),
        lineSpacing: defaultLineSpacing(),
        fontFamily: defaultFontFamily(),
        fontSize: defaultFontSize(),
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        color: '',
      },
    });
  });
  titleBtn.addEventListener('click', () => {
    const indices = targetParagraphIndices();
    if (indices.length === 0) return;
    worker.postMessage({
      type: 'EDIT_APPLY_STYLE',
      payload: {
        paragraphIndices: indices,
        align: 'center',
        lineSpacing: 160,
        fontFamily: defaultFontFamily(),
        fontSize: 28,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        color: '',
      },
    });
  });
}

export function initStyleButtons(container: HTMLDivElement, worker: Worker, cursor: CursorState) {
  const normalBtn = document.getElementById('btn-style-normal') as HTMLButtonElement | null;
  const boldBtn = document.getElementById('btn-style-bold') as HTMLButtonElement | null;
  const italicBtn = document.getElementById('btn-style-italic') as HTMLButtonElement | null;
  const underlineBtn = document.getElementById('btn-style-underline') as HTMLButtonElement | null;
  if (!normalBtn || !boldBtn || !italicBtn || !underlineBtn) return;
  [normalBtn, boldBtn, italicBtn, underlineBtn].forEach((btn) => {
    btn.addEventListener('mousedown', (e) => e.preventDefault());
  });
  normalBtn.addEventListener('click', () => {
    stashSelection(container);
    postFontStyle(container, worker, cursor, { bold: false, italic: false, underline: false, strike: false });
  });
  boldBtn.addEventListener('click', () => {
    stashSelection(container);
    const span = anchorSpan();
    postFontStyle(container, worker, cursor, { bold: !(span && spanStyleState(span).bold) });
  });
  italicBtn.addEventListener('click', () => {
    stashSelection(container);
    const span = anchorSpan();
    postFontStyle(container, worker, cursor, { italic: !(span && spanStyleState(span).italic) });
  });
  underlineBtn.addEventListener('click', () => {
    stashSelection(container);
    const span = anchorSpan();
    postFontStyle(container, worker, cursor, { underline: !(span && spanStyleState(span).underline) });
  });
  syncStyleButtons();
}

export function syncStyleButtons() {
  const boldBtn = document.getElementById('btn-style-bold');
  const italicBtn = document.getElementById('btn-style-italic');
  const underlineBtn = document.getElementById('btn-style-underline');
  if (!boldBtn || !italicBtn || !underlineBtn) return;
  const span = anchorSpan();
  const state = span ? spanStyleState(span) : { bold: false, italic: false, underline: false };
  boldBtn.classList.toggle('active', state.bold);
  italicBtn.classList.toggle('active', state.italic);
  underlineBtn.classList.toggle('active', state.underline);
}