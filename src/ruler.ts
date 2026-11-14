// 편집용지 눈금자: 줌 배율에 맞춰 눈금/마커를 다시 그리고,
// 마커 드래그로 현재 커서가 위치한 문단의 들여쓰기를 조절한다.
import { pageLayout } from './layout/layoutConstants';

const TRACK_WIDTH = 794; // A4 페이지 너비
const SCALE_STEP = 40;

function marginLeftTrack() { return pageLayout.margins.left; }
function contentWidth() { return pageLayout.contentWidth; }

type EditorZoomDetail = { zoom?: number };

let initialized = false;

/** 눈금자를 초기화한다. 여러 번 호출해도 한 번만 설정된다. */
export function ruler(worker?: Worker): void {
  if (initialized) return;
  initialized = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setup(worker), { once: true });
  } else {
    setup(worker);
  }
}

function setup(worker?: Worker): void {
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
  // 드래그 시작 시점의 대상 문단을 고정(드래그 중 selection 변화에 영향받지 않음)
  let dragTargetP: HTMLElement | null = null;

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

  function readIndent(p: HTMLElement): { leftIndent: number; textIndent: number } {
    // 모델/렌더가 설정한 data-*를 우선 사용(현재 커서 문단 기준), 없으면 computed style
    const dl = parseFloat(p.dataset.leftIndent || '');
    const dt = parseFloat(p.dataset.textIndent || '');
    const hasData = Number.isFinite(dl) || Number.isFinite(dt);
    if (hasData) {
      return {
        leftIndent: Number.isFinite(dl) ? dl : 0,
        textIndent: Number.isFinite(dt) ? dt : 0,
      };
    }
    // legacy: indent(+/-) 또는 paddingLeft/textIndent
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

  function updateMarkersFromParagraph(p: HTMLElement | null): void {
    if (!p) {
      leftIndentMarker.style.left = `${marginLeftTrack() * rulerZoom}px`;
      firstLineMarker.style.left = `${marginLeftTrack() * rulerZoom}px`;
      return;
    }
    const { leftIndent, textIndent } = readIndent(p);
    const leftAbs = leftIndent;
    const firstAbs = leftIndent + textIndent;

    leftIndentMarker.style.left = `${(marginLeftTrack() + leftAbs) * rulerZoom}px`;
    firstLineMarker.style.left = `${(marginLeftTrack() + firstAbs) * rulerZoom}px`;
  }

  function updateMarkersFromSelection(): void {
    if (activeMarker) return; // 드래그 중에는 고정 대상 기준 유지
    updateMarkersFromParagraph(getTargetParagraph());
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

  function applyIndentToDom(p: HTMLElement, leftIndent: number, textIndent: number) {
    p.style.paddingLeft = leftIndent ? `${leftIndent}px` : '';
    p.style.textIndent = textIndent ? `${textIndent}px` : '';
    p.dataset.leftIndent = String(leftIndent);
    p.dataset.textIndent = String(textIndent);
    delete p.dataset.indent;
  }

  function commitIndent(p: HTMLElement) {
    if (!worker) return;
    const idx = parseInt(p.dataset.pIdx || '', 10);
    if (!Number.isFinite(idx)) return;
    const leftIndent = parseFloat(p.dataset.leftIndent || '0') || 0;
    const textIndent = parseFloat(p.dataset.textIndent || '0') || 0;
    worker.postMessage({ type: 'EDIT_INDENT', payload: { paragraphIndices: [idx], leftIndent, textIndent } });
  }

  function onMouseDown(event: MouseEvent, marker: HTMLElement): void {
    event.preventDefault(); // 에디터 selection이 마커 클릭으로 사라지는 것 방지
    const targetP = getTargetParagraph();
    activeMarker = marker;
    dragTargetP = targetP;
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
    const targetP = dragTargetP && document.contains(dragTargetP) ? dragTargetP : getTargetParagraph();

    if (targetP) {
      const cur = readIndent(targetP);
      const curPad = cur.leftIndent;
      const curIndent = cur.textIndent;
      if (activeMarker === leftIndentMarker) {
        const newLeft = Math.max(0, Math.min(contentWidth(), absValue));
        // 왼쪽 들여쓰기 이동 시 첫 줄 들여쓰기(상대 오프셋)를 유지해 함께 이동
        const firstOffset = curIndent;
        applyIndentToDom(targetP, newLeft, firstOffset);
        leftIndentMarker.style.left = `${(marginLeftTrack() + newLeft) * rulerZoom}px`;
        firstLineMarker.style.left = `${(marginLeftTrack() + newLeft + firstOffset) * rulerZoom}px`;
      } else if (activeMarker === firstLineMarker) {
        const relIndent = Math.max(-curPad, Math.min(contentWidth() - curPad, absValue - curPad));
        applyIndentToDom(targetP, curPad, relIndent);
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
    if (dragTargetP && document.contains(dragTargetP)) {
      commitIndent(dragTargetP);
    }
    activeMarker = null;
    dragTargetP = null;
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
