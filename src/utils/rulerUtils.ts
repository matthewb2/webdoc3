import { pageLayout } from '../layout/layoutConstants';

export const TRACK_WIDTH = 794; // A4 페이지 너비
export const SCALE_STEP = 40;

export function marginLeftTrack() { return pageLayout.margins.left; }
export function contentWidth() { return pageLayout.contentWidth; }

export function renderRulerTicks(rulerTicksContainer: HTMLElement, rulerZoom: number): void {
  rulerTicksContainer.innerHTML = '';
  rulerTicksContainer.style.left = `${marginLeftTrack() * rulerZoom}px`;
  for (let px = 0; px <= contentWidth(); px += 10) {
    const left = px * rulerZoom;
    const tick = document.createElement('div');
    tick.className = 'ruler-tick';
    tick.style.left = `${left}px`;

    if (px % SCALE_STEP === 0) {
      tick.classList.add('ruler-tick-major');
      const value = (px / SCALE_STEP).toFixed(1).replace(/\.0$/, '');
      const num = document.createElement('span');
      num.className = 'ruler-number';
      num.style.left = `${left}px`;
      num.textContent = value;
      rulerTicksContainer.appendChild(num);
    } else {
      tick.classList.add('ruler-tick-sub');
    }
    rulerTicksContainer.appendChild(tick);
  }
}

export interface ParagraphContext {
  p: HTMLElement;
  td: HTMLTableCellElement | null;
  /** 셀 내용 영역 너비(px). td가 없으면 페이지 contentWidth */
  contentWidth: number;
  /** 페이지 content 영역 기준 셀 내용 왼쪽 오프셋(px). td가 없으면 0 */
  leftOffset: number;
}

export function getTargetParagraphContext(): ParagraphContext | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const editorContainer = document.getElementById('editor-container');
  let node: Node | null = selection.anchorNode;
  let p: HTMLElement | null = null;
  let td: HTMLTableCellElement | null = null;
  while (node) {
    if (node instanceof HTMLElement) {
      if (!p && node.tagName === 'P') p = node;
      if (!td && node.tagName === 'TD') td = node as HTMLTableCellElement;
      if (node.id === 'editor-container') break;
    }
    node = node.parentNode;
  }
  if (!p || !editorContainer || !editorContainer.contains(p)) return null;

  if (td && editorContainer.contains(td)) {
    const page = td.closest('.page') as HTMLElement | null;
    if (page) {
      const pageRect = page.getBoundingClientRect();
      const tdRect = td.getBoundingClientRect();
      const zoom = pageRect.width / 794 || 1;
      const cs = window.getComputedStyle(td);
      const padL = (parseFloat(cs.paddingLeft) || 0);
      const padR = (parseFloat(cs.paddingRight) || 0);
      const borderL = (parseFloat(cs.borderLeftWidth) || 0);
      const borderR = (parseFloat(cs.borderRightWidth) || 0);
      const cellContentW = Math.max(20, (tdRect.width / zoom) - padL - padR - borderL - borderR);
      const pageContentLeft = pageRect.left + pageLayout.margins.left * zoom;
      const cellContentLeft = tdRect.left + (borderL + padL) * zoom;
      const leftOffset = Math.max(0, (cellContentLeft - pageContentLeft) / zoom);
      return { p, td, contentWidth: cellContentW, leftOffset };
    }
  }

  return { p, td: null, contentWidth: contentWidth(), leftOffset: 0 };
}

export function getTargetParagraph(): HTMLElement | null {
  return getTargetParagraphContext()?.p ?? null;
}

export function readIndent(p: HTMLElement): { leftIndent: number; textIndent: number } {
  const dl = parseFloat(p.dataset.leftIndent || '');
  const dt = parseFloat(p.dataset.textIndent || '');
  const hasData = Number.isFinite(dl) || Number.isFinite(dt);
  if (hasData) {
    return {
      leftIndent: Number.isFinite(dl) ? dl : 0,
      textIndent: Number.isFinite(dt) ? dt : 0,
    };
  }
  const legacy = parseFloat(p.dataset.indent || '');
  if (Number.isFinite(legacy) && legacy !== 0) {
    if (legacy > 0) return { leftIndent: 0, textIndent: legacy };
    return { leftIndent: -legacy, textIndent: legacy };
  }
  const cs = window.getComputedStyle(p);
  const paddingLeft = parseFloat(cs.paddingLeft) || 0;
  const textIndent = parseFloat(cs.textIndent) || 0;
  return { leftIndent: paddingLeft, textIndent };
}

export function applyIndentToDom(p: HTMLElement, leftIndent: number, textIndent: number) {
  p.style.paddingLeft = leftIndent ? `${leftIndent}px` : '';
  p.style.textIndent = textIndent ? `${textIndent}px` : '';
  p.dataset.leftIndent = String(leftIndent);
  p.dataset.textIndent = String(textIndent);
  delete p.dataset.indent;
}
