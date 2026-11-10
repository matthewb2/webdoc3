// src/render.ts - 페이지 DOM 생성 + 가상화 뷰포트
import type { PageModel } from './worker/doc.worker';
import { defaultAlign, defaultIndent, defaultLineSpacing } from './settings';
import { PAGE_GAP, PAGE_HEIGHT, PAGE_PITCH, PAGE_WIDTH, pageLayout } from './worker/layoutConstants';

let rendererContainer!: HTMLDivElement;

export function initRenderer(container: HTMLDivElement) {
  rendererContainer = container;
}

export function getCachedPages(): PageModel[] {
  return cachedPages;
}

function applyRunStyle(span: HTMLSpanElement, run: any, lineSpacing?: number) {
  if (run.bold) span.style.fontWeight = 'bold';
  if (run.italic) span.style.fontStyle = 'italic';
  const decorations: string[] = [];
  if (run.underline) decorations.push('underline');
  if (run.strike) decorations.push('line-through');
  if (decorations.length > 0) span.style.textDecoration = decorations.join(' ');
  if (run.fontFamily) span.style.fontFamily = run.fontFamily;
  const fs = run.fontSize ?? 16;
  span.style.fontSize = `${fs}px`;
  if (run.color) span.style.color = run.color;
  if (run.backgroundColor) span.style.backgroundColor = run.backgroundColor;
  // 텍스트 런(글자) 기준 줄높이: 단위 없는 배수(자기 font-size 기준). 문단 strut은 p에서 제거됨.
  const spacing = typeof lineSpacing === 'number' && isFinite(lineSpacing) ? lineSpacing : 160;
  span.style.lineHeight = `${spacing / 100}`;
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

function cellParagraphHasText(p: HTMLElement): boolean {
  return (p.textContent || '').replace(/\u200B/g, '').length > 0;
}

function resetCellParagraph(p: HTMLElement) {
  p.innerHTML = '';
  const span = document.createElement('span');
  span.innerText = '\u200B';
  p.appendChild(span);
}

function firstTextNode(el: Node): Text | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  return walker.nextNode() as Text | null;
}

// 표 셀에서 Enter를 눌렀을 때 브라우저 기본 동작은 <p><br></p>를 삽입한다.
// 이 경우 문단 끝의 ↵ 표시가 <br> 다음 줄로 밀려 빈 줄이 하나 더 생긴다.
// 커서 뒤 내용을 새 <p>로 직접 옮기고 빈 문단에는 제로폭 공백을 넣어
// Enter 한 번당 정확히 한 줄만 늘어나도록 한다.
function insertTableCellParagraph(td: HTMLTableCellElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  if (!sel.isCollapsed) sel.deleteFromDocument();
  const range = sel.getRangeAt(0);

  const startEl = range.startContainer.nodeType === Node.TEXT_NODE
    ? range.startContainer.parentElement
    : (range.startContainer as HTMLElement);
  const currentP = startEl?.closest('p') as HTMLParagraphElement | null;
  if (!currentP || !td.contains(currentP)) return false;

  const newP = document.createElement('p');
  newP.style.margin = '0';
  newP.contentEditable = 'true';

  const tail = document.createRange();
  tail.setStart(range.startContainer, range.startOffset);
  tail.setEnd(currentP, currentP.childNodes.length);
  newP.appendChild(tail.extractContents());

  if (!cellParagraphHasText(currentP)) resetCellParagraph(currentP);
  if (!cellParagraphHasText(newP)) resetCellParagraph(newP);

  currentP.after(newP);

  const target = firstTextNode(newP);
  const caret = document.createRange();
  if (target) caret.setStart(target, 0);
  else caret.selectNodeContents(newP);
  caret.collapse(true);
  sel.removeAllRanges();
  sel.addRange(caret);
  return true;
}

function createPageElement(pageData: PageModel, pIndex: number): HTMLDivElement {
  const pageEl = document.createElement('div');
  pageEl.className = 'page';
  pageEl.contentEditable = 'true';
  pageEl.spellcheck = false;
  pageEl.dataset.pageNumber = (pIndex + 1).toString();

  // A4 기준 스타일 적용
  const m = pageLayout.margins;
  pageEl.style.width = `${PAGE_WIDTH}px`;
  pageEl.style.minHeight = `${PAGE_HEIGHT}px`;
  pageEl.style.padding = `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px`;
  pageEl.style.boxSizing = 'border-box';
  pageEl.style.position = 'relative';
  pageEl.style.background = 'white';
  pageEl.style.margin = '0 auto';
  pageEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

  // 표 셀 안에서 Enter를 누르면 브라우저 기본 동작(<p><br></p> 삽입)이
  // 문단 끝의 ↵ 표시를 다음 줄로 밀어 빈 줄을 만든다. 페이지 단위에서
  // 가로채 커서 뒤 내용을 새 문단으로 직접 옮긴다.
  // (keydown 이벤트는 현재 포커스된 편집 루트인 .page로 전달되므로 페이지에 건다)
  pageEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Enter' || e.isComposing || e.shiftKey) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.anchorNode) return;
    const anchor = sel.anchorNode;
    const anchorEl = anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as Element);
    const td = anchorEl?.closest('td') as HTMLTableCellElement | null;
    if (!td || !pageEl.contains(td)) return;
    // 삽입이 실제로 일어난 경우에만 기본 동작을 막는다.
    if (insertTableCellParagraph(td)) e.preventDefault();
  });

  const padLeft = pageLayout.margins.left;
  const padRight = pageLayout.margins.right;
  const padTop = pageLayout.margins.top;
  const padBottom = pageLayout.margins.bottom;
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
    const x0 = D(padLeft), x1 = D(PAGE_WIDTH - padRight), y0 = D(padTop), y1 = D(PAGE_HEIGHT - padBottom);
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
      // 줄간격은 텍스트 런(span) 기준으로 적용한다. p에 고정 px lineHeight를 주면
      // (font-size:0이어도 절대값 strut이 생겨) 문단 전체 줄높이가 고정되므로 px 폴백을 사용하지 않는다.
      const pLineSpacing = item.lineSpacing ?? defaultLineSpacing();
      p.dataset.lineSpacing = String(pLineSpacing);
      p.style.lineHeight = '0';
      const firstRun = (item.children || [])[0] as any;
      const paraMarkSize = typeof firstRun?.fontSize === 'number' && isFinite(firstRun.fontSize) ? firstRun.fontSize : 16;
      p.style.fontSize = `${paraMarkSize}px`;
      if (item.spaceBefore) p.style.paddingTop = `${item.spaceBefore}px`;
      if (item.spaceAfter) p.style.paddingBottom = `${item.spaceAfter}px`;

      const effectiveAlign = item.align ?? defaultAlign();
      p.style.textAlign = effectiveAlign;
      p.dataset.align = effectiveAlign;

      if (item.leftIndent !== undefined || item.textIndent !== undefined) {
        const left = item.leftIndent ?? 0;
        const first = item.textIndent ?? 0;
        if (left) {
          p.style.paddingLeft = `${left}px`;
          p.dataset.leftIndent = String(left);
        }
        if (first) {
          p.style.textIndent = `${first}px`;
          p.dataset.textIndent = String(first);
        }
      } else {
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
      }

      const runLineSpacing = item.lineSpacing ?? defaultLineSpacing();
      const children: Array<{ text: string; bold?: boolean }> = item.children || [];
      children.forEach((run) => {
        const span = document.createElement('span');
        span.innerText = run.text === '' ? '\u200B' : run.text;
        applyRunStyle(span, run, runLineSpacing);
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
      if (item.borderStyle === 'none') table.classList.add('tbl-border-none');
      else if (item.borderStyle === 'no-vertical') table.classList.add('tbl-border-no-vertical');

      const rows: Array<any> = item.rows || [];
      const contentWidth = pageLayout.contentWidth;
      const colCount = (item.colWidths && item.colWidths.length) || (rows[0]?.cells?.length || 1);
      let effectiveColWidths: number[] | null = null;
      if (item.colWidths && item.colWidths.length > 0) {
        const totalW = item.colWidths.reduce((a: number, b: number) => a + (b || 0), 0);
        if (totalW > 0) {
          // 편집 용지(본문 영역) 너비에 맞춰 열 너비를 비율 유지하며 확장
          const scale = contentWidth / totalW;
          effectiveColWidths = item.colWidths.map((v: number) => (v || 0) * scale);
        }
      }
      table.style.width = `${contentWidth}px`;
      if (item.backgroundColor) table.style.backgroundColor = item.backgroundColor;
      if (item.background) table.style.backgroundColor = item.background;

      rows.forEach((row: any, ri: number) => {
        if (!row) return;
        const tr = document.createElement('tr');
        if (row.backgroundColor) tr.style.backgroundColor = row.backgroundColor;
        if (row.background) tr.style.backgroundColor = row.background;
        if (row.height) tr.style.height = `${row.height}px`;

        const cells: Array<any> = row.cells || [];
        const modelRow = row._rowIdx ?? ri;
        const cellCount = colCount || cells.length || 1;

        cells.forEach((cell: any, ci: number) => {
          if (!cell || cell.merged) return;
          const td = document.createElement('td');
          td.dataset.r = String(modelRow);
          td.dataset.c = String(ci);

          td.contentEditable = 'true';
          td.style.outline = 'none';
          td.style.backgroundColor = 'white';

          const colSpan = Math.max(1, cell.colSpan ?? 1);
          const rowSpan = Math.max(1, cell.rowSpan ?? 1);

          const baseCol = contentWidth / cellCount;
          let w = baseCol * colSpan;
          if (effectiveColWidths) {
            let sum = 0;
            for (let i = 0; i < colSpan; i++) sum += effectiveColWidths[ci + i] ?? baseCol;
            w = sum;
          }
          td.style.width = `${w}px`;
          
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
              p.style.lineHeight = '0';
              const pChildren: Array<any> = paraItem.children || [];
              const paraMarkSize = typeof (pChildren[0] as any)?.fontSize === 'number' && isFinite((pChildren[0] as any).fontSize)
                ? (pChildren[0] as any).fontSize
                : 16;
              p.style.fontSize = `${paraMarkSize}px`;
              if (pChildren.length === 0) {
                // 내용이 비어있어도 텍스트 노드(제로 폭 공백)를 반드시 생성하여 커서가 p가 아닌 텍스트 노드에 앵커되도록 함
                const span = document.createElement('span');
                span.innerText = '\u200B';
                p.appendChild(span);
              } else {
                pChildren.forEach((run: any) => {
                  const span = document.createElement('span');
                  span.innerText = run.text === '' ? '\u200B' : run.text;
                  applyRunStyle(span, run, defaultLineSpacing());
                  p.appendChild(span);
                });
              }
              td.appendChild(p);
            });
          } else {
            const p = document.createElement('p');
            p.style.margin = '0';
            p.contentEditable = 'true';
            p.style.lineHeight = '0';
            const paraMarkSize = typeof (cellChildren[0] as any)?.fontSize === 'number' && isFinite((cellChildren[0] as any).fontSize)
              ? (cellChildren[0] as any).fontSize
              : 16;
            p.style.fontSize = `${paraMarkSize}px`;
            if (cellChildren.length === 0) {
              const span = document.createElement('span');
              span.innerText = '\u200B';
              p.appendChild(span);
            } else {
              cellChildren.forEach((run: any) => {
                const span = document.createElement('span');
                span.innerText = run.text === '' ? '\u200B' : run.text;
                applyRunStyle(span, run, defaultLineSpacing());
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