// 편집용지 눈금자: 줌 배율에 맞춰 눈금/마커를 다시 그리고,
// 마커 드래그로 현재 문단의 들여쓰기를 조절한다.
import { pageLayout } from './worker/layoutConstants';

const TRACK_WIDTH = 794; // A4 페이지 너비
const SCALE_STEP = 40;

function marginLeftTrack() { return pageLayout.margins.left; }
function contentWidth() { return pageLayout.contentWidth; }

type EditorZoomDetail = { zoom?: number };

let initialized = false;

/** 눈금자를 초기화한다. 여러 번 호출해도 한 번만 설정된다. */
export function ruler(): void {
  if (initialized) return;
  initialized = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}

function setup(): void {
  const leftIndentEl = document.getElementById('marker-left-indent') as HTMLElement | null;
  const firstLineEl = document.getElementById('marker-first-line') as HTMLElement | null;
  const guideEl = document.getElementById('ruler-guide') as HTMLElement | null;
  const trackEl = document.getElementById('ruler-track') as HTMLElement | null;
  const ticksEl = document.getElementById('ruler-ticks') as HTMLElement | null;

  if (!leftIndentEl || !firstLineEl || !guideEl || !trackEl || !ticksEl) {
    console.warn('[ruler] 눈금자 요소를 찾지 못했습니다.');
    return;
  }

  const leftIndentMarker = leftIndentEl;
  const firstLineMarker = firstLineEl;
  const guideLine = guideEl;
  const rulerTrack = trackEl;
  const rulerTicksContainer = ticksEl;

  let rulerZoom = 1;
  let activeMarker: HTMLElement | null = null;

  function renderRulerTicks(): void {
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

  function getTargetParagraph(): HTMLElement | null {
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

  function updateMarkersFromSelection(): void {
    const targetP = getTargetParagraph();
    if (!targetP) return;
    const paddingLeft = parseFloat(window.getComputedStyle(targetP).paddingLeft) || 0;
    const textIndent = parseFloat(window.getComputedStyle(targetP).textIndent) || 0;
    // CSS text-indent is relative to the padding edge, so absolute first-line = paddingLeft + textIndent
    const leftAbs = paddingLeft;
    const firstAbs = paddingLeft + textIndent;

    leftIndentMarker.style.left = `${(marginLeftTrack() + leftAbs) * rulerZoom}px`;
    firstLineMarker.style.left = `${(marginLeftTrack() + firstAbs) * rulerZoom}px`;
  }

  function setRulerZoom(zoom: number | undefined): void {
    if (typeof zoom !== 'number' || !Number.isFinite(zoom) || zoom <= 0) return;

    rulerZoom = zoom;

    rulerTrack.style.width = `${TRACK_WIDTH * rulerZoom}px`;
    renderRulerTicks();

    if (getTargetParagraph()) {
      updateMarkersFromSelection();
    } else {
      // 선택된 문단이 없으면 들여쓰기 0(본문 시작) 위치로 유지
      leftIndentMarker.style.left = `${marginLeftTrack() * rulerZoom}px`;
      firstLineMarker.style.left = `${marginLeftTrack() * rulerZoom}px`;
    }
  }

  function updateGuideLine(clientX: number): void {
    guideLine.style.left = `${clientX}px`;
  }

  function onMouseDown(event: MouseEvent, marker: HTMLElement): void {
    activeMarker = marker;
    guideLine.style.display = 'block';
    updateGuideLine(event.clientX);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(event: MouseEvent): void {
    if (!activeMarker) return;
    const rect = rulerTrack.getBoundingClientRect();
    const margin = marginLeftTrack() * rulerZoom;
    const content = contentWidth() * rulerZoom;

    let posX = event.clientX - rect.left;
    posX = Math.max(margin, Math.min(posX, margin + content));

    const absValue = (posX - margin) / rulerZoom;
    const targetP = getTargetParagraph();

    if (targetP) {
      const curPad = parseFloat(window.getComputedStyle(targetP).paddingLeft) || 0;
      const curIndent = parseFloat(window.getComputedStyle(targetP).textIndent) || 0;
      if (activeMarker === leftIndentMarker) {
        const newLeft = Math.max(0, absValue);
        // 왼쪽 들여쓰기 이동 시 첫 줄 들여쓰기(상대 오프셋)를 유지해 함께 이동
        const firstOffset = curIndent;
        targetP.style.paddingLeft = `${newLeft}px`;
        targetP.style.textIndent = `${firstOffset}px`;
        leftIndentMarker.style.left = `${(marginLeftTrack() + newLeft) * rulerZoom}px`;
        firstLineMarker.style.left = `${(marginLeftTrack() + newLeft + firstOffset) * rulerZoom}px`;
      } else if (activeMarker === firstLineMarker) {
        const relIndent = absValue - curPad;
        targetP.style.textIndent = `${relIndent}px`;
        leftIndentMarker.style.left = `${(marginLeftTrack() + curPad) * rulerZoom}px`;
        firstLineMarker.style.left = `${(marginLeftTrack() + curPad + relIndent) * rulerZoom}px`;
      }
    } else {
      activeMarker.style.left = `${posX}px`;
    }

    const markerRect = activeMarker.getBoundingClientRect();
    updateGuideLine(markerRect.left + markerRect.width / 2);
  }

  function onMouseUp(): void {
    activeMarker = null;
    guideLine.style.display = 'none';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  leftIndentMarker.addEventListener('mousedown', (event) => onMouseDown(event, leftIndentMarker));
  firstLineMarker.addEventListener('mousedown', (event) => onMouseDown(event, firstLineMarker));

  document.addEventListener('selectionchange', updateMarkersFromSelection);

  window.addEventListener('editor-zoom', (event) => {
    const detail = (event as CustomEvent<EditorZoomDetail>).detail;
    setRulerZoom(detail?.zoom);
  });

  window.addEventListener('page-margins-change', () => {
    setRulerZoom(rulerZoom);
    updateMarkersFromSelection();
  });

  // 초기 위치: 들여쓰기 0(본문 시작)
  leftIndentMarker.style.left = `${marginLeftTrack()}px`;
  firstLineMarker.style.left = `${marginLeftTrack()}px`;
  setRulerZoom(1);
  rulerTrack.classList.add('ruler-ready');
  const container = rulerTrack.closest('.ruler-container') as HTMLElement | null;
  if (container) container.style.visibility = 'visible';
}
