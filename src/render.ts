// src/render.ts - 페이지 DOM 생성 + 가상화 뷰포트
import type { PageModel } from './worker/doc.worker';
import { defaultAlign, defaultIndent } from './settings';
import { PAGE_GAP, PAGE_HEIGHT, PAGE_PADDING, PAGE_PITCH, PAGE_WIDTH } from './layoutConstants';

let rendererContainer!: HTMLDivElement;

export function initRenderer(container: HTMLDivElement) {
  rendererContainer = container;
}

export function getCachedPages(): PageModel[] {
  return cachedPages;
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
  if (run.backgroundColor) span.style.backgroundColor = run.backgroundColor;
}

// 가상화 계산은 실제 페이지 높이 + CSS margin-bottom(PAGE_GAP)과 일치해야 한다.
const VIRTUAL_BUFFER = 2;

// 줌 스케일 (transform 기준). 가상화의 시각 px를 레이아웃 px로 환산할 때 사용
let renderZoom = 1;

export function setRenderZoom(z: number): void {
  renderZoom = z > 0 ? z : 1;
}

let cachedPages: PageModel[] = [];
const mountedPages = new Map<number, HTMLDivElement>();
const loggedTableKeys = new Set<string>();
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
  pageEl.spellcheck = false;
  pageEl.dataset.pageNumber = (pIndex + 1).toString();

  // A4 기준 스타일 적용
  pageEl.style.width = `${PAGE_WIDTH}px`;
  pageEl.style.minHeight = `${PAGE_HEIGHT}px`;
  pageEl.style.padding = `${PAGE_PADDING}px`;
  pageEl.style.boxSizing = 'border-box';
  pageEl.style.position = 'relative';
  pageEl.style.background = 'white';
  pageEl.style.margin = '0 auto';
  pageEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

  const padRaw = parseFloat(getComputedStyle(pageEl).paddingLeft);
  const padPx = Number.isFinite(padRaw) && padRaw > 0 ? padRaw : PAGE_PADDING; // A4 기본 여백 가정
  const dpr = window.devicePixelRatio || 1;
  const marginCanvas = document.createElement('canvas');
  marginCanvas.className = 'margin-lines';
  
  // A4 캔버스 크기
  marginCanvas.width = Math.round(PAGE_WIDTH * dpr);
  marginCanvas.height = Math.round(PAGE_HEIGHT * dpr);
  marginCanvas.style.position = 'absolute';
  marginCanvas.style.top = '0';
  marginCanvas.style.left = '0';
  marginCanvas.style.width = `${PAGE_WIDTH}px`;
  marginCanvas.style.height = `${PAGE_HEIGHT}px`;
  marginCanvas.style.pointerEvents = 'none';
  marginCanvas.contentEditable = 'false';
  
  const mctx = marginCanvas.getContext('2d');
  if (mctx) {
    const D = (v: number) => Math.round(v * dpr);
    mctx.fillStyle = '#8a94a0';
    const tick = Math.round(18 * dpr);
    const lw = Math.max(1, Math.round(dpr));
    const x0 = D(padPx), x1 = D(PAGE_WIDTH - padPx), y0 = D(padPx), y1 = D(PAGE_HEIGHT - padPx);
    mctx.fillRect(x0 - tick, y0 - lw, tick, lw);
    mctx.fillRect(x0 - lw, y0 - tick, lw, tick);
    mctx.fillRect(x1, y0 - lw, tick, lw);
    mctx.fillRect(x1, y0 - tick, lw, tick);
    mctx.fillRect(x0 - tick, y1, tick, lw);
    mctx.fillRect(x0 - lw, y1, lw, tick);
    mctx.fillRect(x1, y1, tick, lw);
    mctx.fillRect(x1, y1, lw, tick);
  }
  pageEl.appendChild(marginCanvas);

  if (!Array.isArray(pageData)) return pageEl;

  let colDiv: HTMLDivElement | null = null;
  let colDivN = 0;
  const flushColDiv = () => {
    if (colDiv) {
      pageEl.appendChild(colDiv);
      colDiv = null;
      colDivN = 0;
    }
  };
  const colCountOf = (it: any) => (it.type === 'paragraph' && it.columns && it.columns > 1 ? it.columns : 0);

  pageData.forEach((item: any, itemIdx: number) => {
    if (!item) return;
    if (colCountOf(item) === 0 || (colDiv && colDivN !== colCountOf(item))) flushColDiv();

    const docIdx = item._docIdx ?? itemIdx;

    if (item.type === 'paragraph') {
      const p = document.createElement('p');
      p.dataset.pIdx = docIdx.toString();
      p.dataset.pOffset = (item._charOffset ?? 0).toString();
      if (item.lineHeight) p.style.lineHeight = `${item.lineHeight}px`;
      if (item.lineSpacing) p.dataset.lineSpacing = String(item.lineSpacing);
      if (item.spaceBefore) p.style.paddingTop = `${item.spaceBefore}px`;
      if (item.spaceAfter) p.style.paddingBottom = `${item.spaceAfter}px`;

      const effectiveAlign = item.align ?? defaultAlign();
      p.style.textAlign = effectiveAlign;
      p.dataset.align = effectiveAlign;

      const effectiveIndent = item.indent ?? defaultIndent();
      if (effectiveIndent) {
        if (effectiveIndent > 0) {
          p.style.textIndent = `${effectiveIndent}px`;
        } else {
          p.style.paddingLeft = `${-effectiveIndent}px`;
          p.style.textIndent = `${effectiveIndent}px`;
        }
        p.dataset.indent = String(effectiveIndent);
      }

      const children: Array<{ text: string; bold?: boolean }> = item.children || [];
      children.forEach((run) => {
        const span = document.createElement('span');
        span.innerText = run.text === '' ? '\u200B' : run.text;
        applyRunStyle(span, run);
        p.appendChild(span);
      });
      const colN = colCountOf(item);
      if (colN > 0) {
        if (!colDiv) {
          colDiv = document.createElement('div');
          colDiv.className = `doc-cols-${colN}`;
          colDiv.dataset.cols = String(colN);
          colDivN = colN;
        }
        colDiv.appendChild(p);
      } else {
        pageEl.appendChild(p);
      }
    }
    else if (item.type === 'table') {
      const table = document.createElement('table');
      table.dataset.pIdx = docIdx.toString();
      if (item._continued) table.style.marginTop = '0';
      if (item._continues) table.style.marginBottom = '0';
      
      table.style.borderCollapse = 'collapse';
      if (item.backgroundColor) table.style.backgroundColor = item.backgroundColor;
      if (item.background) table.style.backgroundColor = item.background;

      const rows: Array<any> = item.rows || [];

      rows.forEach((row: any, ri: number) => {
        if (!row) return;
        const tr = document.createElement('tr');
        if (row.backgroundColor) tr.style.backgroundColor = row.backgroundColor;
        if (row.background) tr.style.backgroundColor = row.background;

        const cells: Array<any> = row.cells || [];
        const modelRow = row._rowIdx ?? ri;

        cells.forEach((cell: any, ci: number) => {
          if (!cell || cell.merged) return;
          const td = document.createElement('td');
          td.dataset.r = String(modelRow);
          td.dataset.c = String(ci);
          
          // 셀 편집 및 이벤트 디버깅 리스너 부착
          td.contentEditable = 'true';
          td.style.outline = 'none';

          td.addEventListener('focus', (e) => {
            console.log(`[cell-input-debug] TD focused at row=${modelRow}, col=${ci}`, e);
          });
          td.addEventListener('keydown', (e) => {
            console.log(`[cell-input-debug] TD keydown key="${e.key}" code="${e.code}" target=`, e.target);
          });
          td.addEventListener('input', (e) => {
            console.log(`[cell-input-debug] TD input fired! value/text=`, td.textContent, e);
          });

          const cellCount = cells.length || 1;
          const colSpan = Math.max(1, cell.colSpan ?? 1);
          const rowSpan = Math.max(1, cell.rowSpan ?? 1);
          
          const contentWidth = PAGE_WIDTH - (padPx * 2);
          td.style.width = `${(contentWidth / cellCount) * colSpan}px`;
          
          if (colSpan > 1) td.colSpan = colSpan;
          if (rowSpan > 1) td.rowSpan = rowSpan;

          if (cell.backgroundColor) td.style.backgroundColor = cell.backgroundColor;
          if (cell.background) td.style.backgroundColor = cell.background;

          // src/render.ts (표 셀 내부 생성 로직 수정 부분)

          // 표 내부 셀 콘텐츠 생성 부문 수정
          const cellChildren: Array<any> = cell.children || [];
          
          if (cellChildren.length > 0 && cellChildren[0].type === 'paragraph') {
            cellChildren.forEach((paraItem: any) => {
              const p = document.createElement('p');
              p.style.margin = '0';
              p.contentEditable = 'true';
              const pChildren: Array<any> = paraItem.children || [];
              if (pChildren.length === 0) {
                // 내용이 비어있어도 텍스트 노드(제로 폭 공백)를 반드시 생성하여 커서가 p가 아닌 텍스트 노드에 앵커되도록 함
                const span = document.createElement('span');
                span.innerText = '\u200B';
                p.appendChild(span);
              } else {
                pChildren.forEach((run: any) => {
                  const span = document.createElement('span');
                  span.innerText = run.text === '' ? '\u200B' : run.text;
                  applyRunStyle(span, run);
                  p.appendChild(span);
                });
              }
              td.appendChild(p);
            });
          } else {
            const p = document.createElement('p');
            p.style.margin = '0';
            p.contentEditable = 'true';
            if (cellChildren.length === 0) {
              const span = document.createElement('span');
              span.innerText = '\u200B';
              p.appendChild(span);
            } else {
              cellChildren.forEach((run: any) => {
                const span = document.createElement('span');
                span.innerText = run.text === '' ? '\u200B' : run.text;
                applyRunStyle(span, run);
                p.appendChild(span);
              });
            }
            td.appendChild(p);
          }

          tr.appendChild(td);
        });

        table.appendChild(tr);
      });
      pageEl.appendChild(table);
    }
  });
  flushColDiv();

  return pageEl;
}

export function renderVirtualPages(pages: PageModel[], isFinal: boolean) {
  if (!Array.isArray(pages)) return;
  if (isFinal) {
    cachedPages = pages;
    mountedPages.forEach((el) => el.remove());
    mountedPages.clear();
    loggedTableKeys.clear();
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

function visibleRange(forceIdx?: number | number[]): [number, number] {
  const n = cachedPages.length;
  if (n === 0) return [0, -1];
  let start = 0;
  let end = n - 1;
  const viewportEl = document.querySelector('.editor-viewport') as HTMLDivElement | null;
  if (viewportEl) {
    const vRect = viewportEl.getBoundingClientRect();
    const cRect = rendererContainer.getBoundingClientRect();
    const topInContent = (vRect.top - cRect.top) / renderZoom;
    const bottomInContent = topInContent + viewportEl.clientHeight;
    start = Math.floor(topInContent / PAGE_PITCH) - VIRTUAL_BUFFER;
    end = Math.floor(bottomInContent / PAGE_PITCH) + VIRTUAL_BUFFER;
  }
  if (forceIdx !== undefined) {
    const list = Array.isArray(forceIdx) ? forceIdx : [forceIdx];
    list.forEach((f) => {
      start = Math.min(start, f);
      end = Math.max(end, f);
    });
  }
  return [Math.max(0, start), Math.min(n - 1, end)];
}

export function updateVisiblePages(forceIdx?: number | number[]) {
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
  mountedPages.forEach((el, idx) => {
    if (idx < start || idx > end) {
      el.remove();
      mountedPages.delete(idx);
    }
  });
  let anchor: Node | null = bottomSpacer;
  for (let i = end; i >= start; i--) {
    let el = mountedPages.get(i);
    if (!el) {
      el = createPageElement(cachedPages[i], i);
      mountedPages.set(i, el);
    }
    el.style.marginBottom = i === n - 1 ? '0px' : `${PAGE_GAP}px`;
    if (el.parentNode !== rendererContainer || el.nextSibling !== anchor) {
      rendererContainer.insertBefore(el, anchor);
    }
    anchor = el;
  }
  topSpacer.style.height = `${start * PAGE_PITCH}px`;
  bottomSpacer.style.height = end >= n - 1 ? '0px' : `${(n - 1 - end) * PAGE_PITCH}px`;
}

export function findCursorPageIndex(docIdx: number): number {
  const all = findCursorPageIndices(docIdx);
  return all.length > 0 ? all[0] : -1;
}

export function findCursorPageIndices(docIdx: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < cachedPages.length; i++) {
    const page = cachedPages[i];
    for (let k = 0; k < page.length; k++) {
      if ((page[k] as any)._docIdx === docIdx) {
        out.push(i);
        break;
      }
    }
  }
  return out;
}