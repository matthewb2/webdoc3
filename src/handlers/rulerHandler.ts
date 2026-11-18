import {
  TRACK_WIDTH,
  marginLeftTrack,
  contentWidth,
  renderRulerTicks,
  getTargetParagraph,
  readIndent,
  applyIndentToDom,
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
  const guideLine = document.getElementById('ruler-guide') as HTMLElement | null;
  const rulerTrack = document.getElementById('ruler-track') as HTMLElement | null;
  const rulerTicksContainer = document.getElementById('ruler-ticks') as HTMLElement | null;

  if (!leftIndentMarker || !firstLineMarker || !guideLine || !rulerTrack || !rulerTicksContainer) {
    console.warn('[ruler] 눈금자 요소를 찾지 못했습니다.');
    return;
  }

  let rulerZoom = 1;
  let activeMarker: HTMLElement | null = null;
  let dragTargetP: HTMLElement | null = null;

  function updateMarkersFromParagraph(p: HTMLElement | null): void {
    if (!p) {
      leftIndentMarker!.style.left = `${marginLeftTrack() * rulerZoom}px`;
      firstLineMarker!.style.left = `${marginLeftTrack() * rulerZoom}px`;
      return;
    }
    const { leftIndent, textIndent } = readIndent(p);
    leftIndentMarker!.style.left = `${(marginLeftTrack() + leftIndent) * rulerZoom}px`;
    firstLineMarker!.style.left = `${(marginLeftTrack() + leftIndent + textIndent) * rulerZoom}px`;
  }

  function updateMarkersFromSelection(): void {
    if (activeMarker) return;
    updateMarkersFromParagraph(getTargetParagraph());
  }

  function setRulerZoom(zoom: number | undefined): void {
    if (typeof zoom !== 'number' || !Number.isFinite(zoom) || zoom <= 0) return;
    rulerZoom = zoom;
    rulerTrack!.style.width = `${TRACK_WIDTH * rulerZoom}px`;
    renderRulerTicks(rulerTicksContainer!, rulerZoom);

    if (getTargetParagraph()) {
      updateMarkersFromSelection();
    } else {
      leftIndentMarker!.style.left = `${marginLeftTrack() * rulerZoom}px`;
      firstLineMarker!.style.left = `${marginLeftTrack() * rulerZoom}px`;
    }
  }

  function commitIndent(p: HTMLElement) {
    if (!worker) return;
    const idx = parseInt(p.dataset.pIdx || '', 10);
    if (!Number.isFinite(idx)) return;
    const leftIndent = parseFloat(p.dataset.leftIndent || '0') || 0;
    const textIndent = parseFloat(p.dataset.textIndent || '0') || 0;
    worker.postMessage({ type: 'EDIT_INDENT', payload: { paragraphIndices: [idx], leftIndent, textIndent } });
  }

  const onMouseMove = (event: MouseEvent) => {
    if (!activeMarker) return;
    const rect = rulerTrack!.getBoundingClientRect();
    const margin = marginLeftTrack() * rulerZoom;
    const content = contentWidth() * rulerZoom;

    let posX = event.clientX - rect.left;
    posX = Math.max(margin, Math.min(posX, margin + content));

    const absValue = (posX - margin) / rulerZoom;
    const targetP = dragTargetP && document.contains(dragTargetP) ? dragTargetP : getTargetParagraph();

    if (targetP) {
      const cur = readIndent(targetP);
      if (activeMarker === leftIndentMarker) {
        const newLeft = Math.max(0, Math.min(contentWidth(), absValue));
        applyIndentToDom(targetP, newLeft, cur.textIndent);
        leftIndentMarker!.style.left = `${(marginLeftTrack() + newLeft) * rulerZoom}px`;
        firstLineMarker!.style.left = `${(marginLeftTrack() + newLeft + cur.textIndent) * rulerZoom}px`;
      } else if (activeMarker === firstLineMarker) {
        const relIndent = Math.max(-cur.leftIndent, Math.min(contentWidth() - cur.leftIndent, absValue - cur.leftIndent));
        applyIndentToDom(targetP, cur.leftIndent, relIndent);
        leftIndentMarker!.style.left = `${(marginLeftTrack() + cur.leftIndent) * rulerZoom}px`;
        firstLineMarker!.style.left = `${(marginLeftTrack() + cur.leftIndent + relIndent) * rulerZoom}px`;
      }
    }

    const markerRect = activeMarker.getBoundingClientRect();
    guideLine!.style.left = `${markerRect.left + markerRect.width / 2}px`;
  };

  const onMouseUp = () => {
    if (dragTargetP && document.contains(dragTargetP)) {
      commitIndent(dragTargetP);
    }
    activeMarker = null;
    dragTargetP = null;
    guideLine!.style.display = 'none';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const attachMarkerListener = (marker: HTMLElement) => {
    marker.addEventListener('mousedown', (event) => {
      event.preventDefault();
      activeMarker = marker;
      dragTargetP = getTargetParagraph();
      guideLine!.style.display = 'block';
      const markerRect = marker.getBoundingClientRect();
      guideLine!.style.left = `${markerRect.left + markerRect.width / 2}px`;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  };

  attachMarkerListener(leftIndentMarker);
  attachMarkerListener(firstLineMarker);

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
  setRulerZoom(1);
  rulerTrack.classList.add('ruler-ready');
  const container = rulerTrack.closest('.ruler-container') as HTMLElement | null;
  if (container) container.style.visibility = 'visible';
}
