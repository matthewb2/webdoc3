import {
  TRACK_WIDTH,
  marginLeftTrack,
  contentWidth,
  renderRulerTicks,
  getTargetParagraphContext,
  readIndent,
  applyIndentToDom,
  type ParagraphContext,
} from '../utils/rulerUtils';

type EditorZoomDetail = { zoom?: number };
let initialized = false;

export function initRulerHandler(worker?: Worker): void {
  if (initialized) return;
  initialized = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setupRuler(worker), { once: true });
  } else {
    setupRuler(worker);
  }
}

function setupRuler(worker?: Worker): void {
  const leftIndentMarker = document.getElementById('marker-left-indent') as HTMLElement | null;
  const firstLineMarker = document.getElementById('marker-first-line') as HTMLElement | null;
  const rightIndentMarker = document.getElementById('marker-right-indent') as HTMLElement | null;
  const guideLine = document.getElementById('ruler-guide') as HTMLElement | null;
  const rulerTrack = document.getElementById('ruler-track') as HTMLElement | null;
  const rulerTicksContainer = document.getElementById('ruler-ticks') as HTMLElement | null;
  const contentBand = document.getElementById('ruler-content-band') as HTMLElement | null;

  if (!leftIndentMarker || !firstLineMarker || !rightIndentMarker || !guideLine || !rulerTrack || !rulerTicksContainer || !contentBand) {
    console.warn('[ruler] 눈금자 요소를 찾지 못했습니다.');
    return;
  }

  let rulerZoom = 1;
  let activeMarker: HTMLElement | null = null;
  let dragCtx: ParagraphContext | null = null;

  function getCtx(): ParagraphContext | null {
    if (dragCtx && dragCtx.p && document.contains(dragCtx.p)) return dragCtx;
    return getTargetParagraphContext();
  }

  function updateContentBand(base: number, cw: number, leftIndent: number, rightIndent: number): void {
    const left = (base + leftIndent) * rulerZoom;
    const width = Math.max(0, cw - leftIndent - rightIndent) * rulerZoom;
    contentBand!.style.left = `${left}px`;
    contentBand!.style.width = `${width}px`;
  }

  function updateMarkersFromContext(ctx: ParagraphContext | null): void {
    const base = marginLeftTrack() + (ctx?.leftOffset ?? 0);
    const cw = ctx?.contentWidth ?? contentWidth();
    if (!ctx) {
      leftIndentMarker!.style.left = `${marginLeftTrack() * rulerZoom}px`;
      firstLineMarker!.style.left = `${marginLeftTrack() * rulerZoom}px`;
      rightIndentMarker!.style.left = `${(marginLeftTrack() + cw) * rulerZoom}px`;
      updateContentBand(marginLeftTrack(), cw, 0, 0);
      return;
    }
    const { leftIndent, textIndent, rightIndent } = readIndent(ctx.p);
    leftIndentMarker!.style.left = `${(base + leftIndent) * rulerZoom}px`;
    firstLineMarker!.style.left = `${(base + leftIndent + textIndent) * rulerZoom}px`;
    rightIndentMarker!.style.left = `${(base + cw - rightIndent) * rulerZoom}px`;
    updateContentBand(base, cw, leftIndent, rightIndent);
  }

  function updateMarkersFromSelection(): void {
    if (activeMarker) return;
    updateMarkersFromContext(getTargetParagraphContext());
  }

  function setRulerZoom(zoom: number | undefined): void {
    if (typeof zoom !== 'number' || !Number.isFinite(zoom) || zoom <= 0) return;
    rulerZoom = zoom;
    rulerTrack!.style.width = `${TRACK_WIDTH * rulerZoom}px`;
    renderRulerTicks(rulerTicksContainer!, rulerZoom);
    updateMarkersFromSelection();
  }

  function commitIndent(ctx: ParagraphContext) {
    if (!worker) return;
    const p = ctx.p;
    const leftIndent = parseFloat(p.dataset.leftIndent || '0') || 0;
    const textIndent = parseFloat(p.dataset.textIndent || '0') || 0;
    const rightIndent = parseFloat(p.dataset.rightIndent || '0') || 0;
    const tableIdx = parseInt(p.dataset.tableIdx || '', 10);
    const cellR = parseInt(p.dataset.cellR || '', 10);
    const cellC = parseInt(p.dataset.cellC || '', 10);
    const cellPara = parseInt(p.dataset.cellPara || '0', 10);
    if (Number.isFinite(tableIdx) && Number.isFinite(cellR) && Number.isFinite(cellC)) {
      worker.postMessage({
        type: 'EDIT_INDENT',
        payload: { paragraphIndices: [], leftIndent, textIndent, rightIndent, tableCell: { tableIdx, row: cellR, col: cellC, cellPara: Number.isFinite(cellPara) ? cellPara : 0 } },
      });
      return;
    }
    const idx = parseInt(p.dataset.pIdx || '', 10);
    if (!Number.isFinite(idx)) return;
    worker.postMessage({ type: 'EDIT_INDENT', payload: { paragraphIndices: [idx], leftIndent, textIndent, rightIndent } });
  }

  const onMouseMove = (event: MouseEvent) => {
    if (!activeMarker) return;
    const ctx = getCtx();
    if (!ctx) return;
    const rect = rulerTrack!.getBoundingClientRect();
    const base = marginLeftTrack() + ctx.leftOffset;
    const cw = Math.max(20, ctx.contentWidth);
    const basePx = base * rulerZoom;
    const cwPx = cw * rulerZoom;

    let posX = event.clientX - rect.left;
    posX = Math.max(basePx, Math.min(posX, basePx + cwPx));

    const absValue = (posX - basePx) / rulerZoom;
    const cur = readIndent(ctx.p);
    if (activeMarker === leftIndentMarker) {
      const newLeft = Math.max(0, Math.min(cw - cur.rightIndent, absValue));
      applyIndentToDom(ctx.p, newLeft, cur.textIndent, cur.rightIndent);
      leftIndentMarker!.style.left = `${(base + newLeft) * rulerZoom}px`;
      firstLineMarker!.style.left = `${(base + newLeft + cur.textIndent) * rulerZoom}px`;
      updateContentBand(base, cw, newLeft, cur.rightIndent);
    } else if (activeMarker === firstLineMarker) {
      const relIndent = Math.max(-cur.leftIndent, Math.min(cw - cur.leftIndent - cur.rightIndent, absValue - cur.leftIndent));
      applyIndentToDom(ctx.p, cur.leftIndent, relIndent, cur.rightIndent);
      leftIndentMarker!.style.left = `${(base + cur.leftIndent) * rulerZoom}px`;
      firstLineMarker!.style.left = `${(base + cur.leftIndent + relIndent) * rulerZoom}px`;
      updateContentBand(base, cw, cur.leftIndent, cur.rightIndent);
    } else if (activeMarker === rightIndentMarker) {
      const newRight = Math.max(0, Math.min(cw - Math.max(0, cur.leftIndent), cw - absValue));
      applyIndentToDom(ctx.p, cur.leftIndent, cur.textIndent, newRight);
      rightIndentMarker!.style.left = `${(base + cw - newRight) * rulerZoom}px`;
      updateContentBand(base, cw, cur.leftIndent, newRight);
    }

    const markerRect = activeMarker.getBoundingClientRect();
    guideLine!.style.left = `${markerRect.left + markerRect.width / 2}px`;
  };

  const onMouseUp = () => {
    const ctx = getCtx();
    if (ctx && ctx.p && document.contains(ctx.p)) commitIndent(ctx);
    activeMarker = null;
    dragCtx = null;
    guideLine!.style.display = 'none';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const attachMarkerListener = (marker: HTMLElement) => {
    marker.addEventListener('mousedown', (event) => {
      event.preventDefault();
      dragCtx = getTargetParagraphContext();
      if (!dragCtx) return;
      activeMarker = marker;
      guideLine!.style.display = 'block';
      const markerRect = marker.getBoundingClientRect();
      guideLine!.style.left = `${markerRect.left + markerRect.width / 2}px`;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  };

  attachMarkerListener(leftIndentMarker);
  attachMarkerListener(firstLineMarker);
  attachMarkerListener(rightIndentMarker);

  document.addEventListener('selectionchange', updateMarkersFromSelection);
  window.addEventListener('editor-zoom', (event) => {
    setRulerZoom((event as CustomEvent<EditorZoomDetail>).detail?.zoom);
  });
  window.addEventListener('page-margins-change', () => {
    setRulerZoom(rulerZoom);
    updateMarkersFromSelection();
  });

  leftIndentMarker.style.left = `${marginLeftTrack()}px`;
  firstLineMarker.style.left = `${marginLeftTrack()}px`;
  rightIndentMarker.style.left = `${(marginLeftTrack() + contentWidth()) * rulerZoom}px`;
  setRulerZoom(1);
  rulerTrack.classList.add('ruler-ready');
  const container = rulerTrack.closest('.ruler-container') as HTMLElement | null;
  if (container) container.style.visibility = 'visible';
}
