// src/render.ts - 페이지 DOM 생성 + 가상화 뷰포트
import type { PageModel } from './worker/doc.worker';

let rendererContainer!: HTMLDivElement;

export function initRenderer(container: HTMLDivElement) {
  rendererContainer = container;
}

function applyRunStyle(span: HTMLSpanElement, run: any) {
  if (run.bold) span.style.fontWeight = 'bold';
  if (run.italic) span.style.fontStyle = 'italic';
  const decorations: string[] = [];
  if (run.underline) decorations.push('underline');
  if (run.strike) decorations.push('line-through');
  if (decorations.length > 0) span.style.textDecoration = decorations.join(' ');
  if (run.fontFamily) span.style.fontFamily = run.fontFamily;
  if (run.fontSize) span.style.fontSize = `${run.fontSize}px`;
  if (run.color) span.style.color = run.color;
}
// [가상화] 고정 페이지 규격 기반 렌더링 (CSS .page height 900 + gap 30)
const PAGE_PITCH = 930;
const VIRTUAL_BUFFER = 2;

let cachedPages: PageModel[] = [];
const mountedPages = new Map<number, HTMLDivElement>();
let topSpacer: HTMLDivElement | null = null;
let bottomSpacer: HTMLDivElement | null = null;

function ensureSpacers() {
  if (!topSpacer) {
    topSpacer = document.createElement('div');
    rendererContainer.prepend(topSpacer);
  }
  if (!bottomSpacer) {
    bottomSpacer = document.createElement('div');
    rendererContainer.appendChild(bottomSpacer);
  }
}

function createPageElement(pageData: PageModel, pIndex: number): HTMLDivElement {
  const pageEl = document.createElement('div');
  pageEl.className = 'page';
  pageEl.contentEditable = 'true';
  pageEl.dataset.pageNumber = (pIndex + 1).toString();

  // 여백 경계선: canvas로 본문 경계에 간극 없이 직선 표시 (편집 불가)
  const padPx = parseFloat(getComputedStyle(pageEl).paddingLeft) || 0;
  const dpr = window.devicePixelRatio || 1;
  const marginCanvas = document.createElement('canvas');
  marginCanvas.className = 'margin-lines';
  marginCanvas.width = Math.round(800 * dpr);
  marginCanvas.height = Math.round(900 * dpr);
  marginCanvas.contentEditable = 'false';
  const mctx = marginCanvas.getContext('2d');
  if (mctx) {
    mctx.scale(dpr, dpr);
    mctx.fillStyle = '#a6aeb5';
    const tick = 18;
    const x0 = padPx, x1 = 800 - padPx, y0 = padPx, y1 = 900 - padPx;
    mctx.fillRect(x0 - tick, y0 - 1, tick, 1);
    mctx.fillRect(x0 - 1, y0 - tick, 1, tick);
    mctx.fillRect(x1, y0 - 1, tick, 1);
    mctx.fillRect(x1, y0 - tick, 1, tick);
    mctx.fillRect(x0 - tick, y1, tick, 1);
    mctx.fillRect(x0 - 1, y1, 1, tick);
    mctx.fillRect(x1, y1, tick, 1);
    mctx.fillRect(x1, y1, 1, tick);
  }
  pageEl.appendChild(marginCanvas);

  // 안전장치: pageData가 배열이 아니면 빈 페이지만 반환
  if (!Array.isArray(pageData)) return pageEl;

  pageData.forEach((item: any, itemIdx: number) => {
    if (!item) return;

    const docIdx = item._docIdx ?? itemIdx;

    if (item.type === 'paragraph') {
      const p = document.createElement('p');
      p.dataset.pIdx = docIdx.toString();
      p.dataset.pOffset = (item._charOffset ?? 0).toString();
      if (item.lineHeight) p.style.lineHeight = `${item.lineHeight}px`;

      // [구현] 단락 정렬 반영 (중앙, 우측 등)
      if (item.align) {
        p.style.textAlign = item.align;
      }

      const children: Array<{ text: string; bold?: boolean }> = item.children || [];
      children.forEach((run) => {
        const span = document.createElement('span');
        span.innerText = run.text === '' ? '\u200B' : run.text;
        applyRunStyle(span, run);
        p.appendChild(span);
      });
      pageEl.appendChild(p);
    }
    else if (item.type === 'table') {
      const table = document.createElement('table');
      table.dataset.pIdx = docIdx.toString();
      // [이어진 표] 페이지 경계에 맞닿은 바깥 경계선 hidden (이어짐 표시)
      if (item._continued) table.style.borderTop = 'hidden';
      if (item._continues) table.style.borderBottom = 'hidden';
      const rows: Array<any> = item.rows || [];
      const trEls: HTMLTableRowElement[] = [];

      rows.forEach((row: any) => {
        if (!row) return;
        const tr = document.createElement('tr');
        const cells: Array<any> = row.cells || [];

        cells.forEach((cell: any) => {
          if (!cell) return;
          const td = document.createElement('td');
          const cellCount = cells.length || 1;
            td.style.width = `${(600 - 1) / cellCount}px`;

          const cellChildren: Array<any> = cell.children || [];
          cellChildren.forEach((run: any) => {
            const span = document.createElement('span');
            span.innerText = run.text === '' ? '\u200B' : run.text;
            applyRunStyle(span, run);
            td.appendChild(span);
          });

          tr.appendChild(td);
        });

        table.appendChild(tr);
        trEls.push(tr);
      });
      // 이어진 경계에 맞닿은 셀 경계선도 hidden (스타일시트 !important를 이기기 위해 important 지정)
      if (item._continued && trEls.length > 0) {
        trEls[0].querySelectorAll('td').forEach((td) => { td.style.setProperty('border-top-style', 'hidden', 'important'); });
      }
      if (item._continues && trEls.length > 0) {
        trEls[trEls.length - 1].querySelectorAll('td').forEach((td) => { td.style.setProperty('border-bottom-style', 'hidden', 'important'); });
      }
      pageEl.appendChild(table);
    }
  });

  return pageEl;
}

export function renderVirtualPages(pages: PageModel[], isFinal: boolean) {
  // 안전장치: pages가 배열이 아니거나 비어있으면 중단
  if (!Array.isArray(pages)) return;
  if (isFinal) {
    cachedPages = pages;
    // 최종본은 내용이 바뀌었으므로 기존 마운트 전부 해제
    mountedPages.forEach((el) => el.remove());
    mountedPages.clear();
  }
  ensureSpacers();
  rendererContainer.style.gap = '0px';
  updateVisiblePages();
}

export function appendStreamPages(newPages: PageModel[]) {
  if (!Array.isArray(newPages) || newPages.length === 0) return;
  newPages.forEach((p) => cachedPages.push(p));
  ensureSpacers();
  rendererContainer.style.gap = '0px';
  updateVisiblePages();
}

function visibleRange(forceIdx?: number): [number, number] {
  const n = cachedPages.length;
  if (n === 0) return [0, -1];
  let start = 0;
  let end = n - 1;
  const viewportEl = document.querySelector('.editor-viewport') as HTMLDivElement | null;
  if (viewportEl) {
    const vRect = viewportEl.getBoundingClientRect();
    const cRect = rendererContainer.getBoundingClientRect();
    const topInContent = vRect.top - cRect.top;
    const bottomInContent = topInContent + viewportEl.clientHeight;
    start = Math.floor(topInContent / PAGE_PITCH) - VIRTUAL_BUFFER;
    end = Math.floor(bottomInContent / PAGE_PITCH) + VIRTUAL_BUFFER;
  }
  if (forceIdx !== undefined) {
    start = Math.min(start, forceIdx);
    end = Math.max(end, forceIdx);
  }
  return [Math.max(0, start), Math.min(n - 1, end)];
}

export function updateVisiblePages(forceIdx?: number) {
  if (!topSpacer || !bottomSpacer) return;
  const n = cachedPages.length;
  if (n === 0) {
    mountedPages.forEach((el) => el.remove());
    mountedPages.clear();
    topSpacer.style.height = '0px';
    bottomSpacer.style.height = '0px';
    return;
  }
  const [start, end] = visibleRange(forceIdx);
  // 범위를 벗어난 페이지 DOM 제거 (메모리 절약)
  mountedPages.forEach((el, idx) => {
    if (idx < start || idx > end) {
      el.remove();
      mountedPages.delete(idx);
    }
  });
  // DOM 재활용: 역순 insertBefore로 올바른 순서 유지
  let anchor: Node | null = bottomSpacer;
  for (let i = end; i >= start; i--) {
    let el = mountedPages.get(i);
    if (!el) {
      el = createPageElement(cachedPages[i], i);
      mountedPages.set(i, el);
    }
    el.style.marginBottom = i === n - 1 ? '0px' : '30px';
    rendererContainer.insertBefore(el, anchor);
    anchor = el;
  }
  topSpacer.style.height = `${start * PAGE_PITCH}px`;
  bottomSpacer.style.height = end >= n - 1 ? '0px' : `${(n - 1 - end) * PAGE_PITCH - 30}px`;
}

export function findCursorPageIndex(docIdx: number): number {
  for (let i = 0; i < cachedPages.length; i++) {
    const page = cachedPages[i];
    for (let k = 0; k < page.length; k++) {
      if ((page[k] as any)._docIdx === docIdx) return i;
    }
  }
  return -1;
}

