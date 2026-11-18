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

export function getTargetParagraph(): HTMLElement | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const editorContainer = document.getElementById('editor-container');
  let node: Node | null = selection.anchorNode;
  while (node) {
    if (node instanceof HTMLElement) {
      if (node.tagName === 'P') {
        return editorContainer && editorContainer.contains(node) ? node : null;
      }
      if (node.id === 'editor-container') return null;
    }
    node = node.parentNode;
  }
  return null;
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
