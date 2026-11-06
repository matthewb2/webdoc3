// 편집용지 눈금자: 줌 배율에 맞춰 눈금/마커를 다시 그리고,
// 마커 드래그로 현재 문단의 들여쓰기를 조절한다.

const MARGIN_LEFT_TRACK = 85; // 페이지 내부 패딩
const CONTENT_WIDTH = 624; // 순수 편집 영역 너비 (794 - 85*2)
const TRACK_WIDTH = 794; // A4 페이지 너비
const SCALE_STEP = 40;

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
    rulerTicksContainer.style.left = `${MARGIN_LEFT_TRACK * rulerZoom}px`;
    for (let px = 0; px <= CONTENT_WIDTH; px += 10) {
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

    leftIndentMarker.style.left = `${(MARGIN_LEFT_TRACK + paddingLeft) * rulerZoom}px`;
    firstLineMarker.style.left = `${(MARGIN_LEFT_TRACK + textIndent) * rulerZoom}px`;
  }

  function setRulerZoom(zoom: number | undefined): void {
    if (typeof zoom !== 'number' || !Number.isFinite(zoom) || zoom <= 0) return;

    const ratio = zoom / rulerZoom;
    rulerZoom = zoom;

    rulerTrack.style.width = `${TRACK_WIDTH * rulerZoom}px`;
    renderRulerTicks();

    if (getTargetParagraph()) {
      updateMarkersFromSelection();
    } else {
      const leftIndent = (parseFloat(leftIndentMarker.style.left) || 0) * ratio;
      const firstLine = (parseFloat(firstLineMarker.style.left) || 0) * ratio;
      leftIndentMarker.style.left = `${leftIndent}px`;
      firstLineMarker.style.left = `${firstLine}px`;
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
    const margin = MARGIN_LEFT_TRACK * rulerZoom;
    const content = CONTENT_WIDTH * rulerZoom;

    let posX = event.clientX - rect.left;
    posX = Math.max(margin, Math.min(posX, margin + content));

    activeMarker.style.left = `${posX}px`;

    const markerRect = activeMarker.getBoundingClientRect();
    updateGuideLine(markerRect.left + markerRect.width / 2);

    const indentValue = (posX - margin) / rulerZoom;
    const targetP = getTargetParagraph();

    if (targetP) {
      if (activeMarker === leftIndentMarker) {
        targetP.style.paddingLeft = `${Math.max(0, indentValue)}px`;
      } else if (activeMarker === firstLineMarker) {
        targetP.style.textIndent = `${indentValue}px`;
      }
    }
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

  setRulerZoom(1);
}
