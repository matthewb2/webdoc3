import type { PageModel } from '../layout/layout';
import { setRenderZoom, updateVisiblePages } from '../renderHtml';

export function initWorkerListener(
  worker: Worker,
  onReady: (pages: PageModel[]) => void,
  onStream: (pages: PageModel[]) => void,
) {
  let layoutProgressShown = false;

  worker.addEventListener('message', (event: MessageEvent<any>) => {
    const message = event.data;
    if (message.type === 'RENDER_READY') {
      onReady(message.payload);
      if (layoutProgressShown) {
        layoutProgressShown = false;
        const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement | null;
        if (hwpStatus) hwpStatus.textContent = `레이아웃 완료: ${message.payload.length}페이지`;
      }
    } else if (message.type === 'RENDER_STREAM') {
      onStream(message.payload.pages);
    } else if (message.type === 'LAYOUT_PROGRESS') {
      const { done, total } = message.payload;
      if (total >= 50) {
        layoutProgressShown = true;
        const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement | null;
        if (hwpStatus) hwpStatus.textContent = `레이아웃 계산 중... ${done}/${total}`;
      }
    }
  });
}

export function initViewportScrollListener(onScroll: () => void) {
  let scrollRaf = 0;
  const viewportEl = document.querySelector('.editor-viewport') as HTMLDivElement | null;
  viewportEl?.addEventListener(
    'scroll',
    () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        onScroll();
      });
    },
    { passive: true },
  );
}

let zoomLevel = 1;
let zoomApply: ((z: number) => void) | null = null;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

export function getZoomLevel(): number {
  return zoomLevel;
}

export function setEditorZoom(z: number): void {
  if (zoomApply) zoomApply(z);
}

export function zoomEditorIn(): void {
  setEditorZoom(zoomLevel + ZOOM_STEP);
}

export function zoomEditorOut(): void {
  setEditorZoom(zoomLevel - ZOOM_STEP);
}

export function zoomEditorReset(): void {
  setEditorZoom(1);
}

export function refreshZoomLayout(container: HTMLDivElement): void {
  container.style.height = '';
  container.style.marginBottom = '';
}

export function initZoomControls(container: HTMLDivElement) {
  const outBtn = document.getElementById('btn-zoom-out') as HTMLButtonElement | null;
  const inBtn = document.getElementById('btn-zoom-in') as HTMLButtonElement | null;
  const label = document.getElementById('zoom-label') as HTMLButtonElement | null;
  if (!outBtn || !inBtn || !label) return;
  const apply = (z: number) => {
    zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
    label.textContent = `${Math.round(zoomLevel * 100)}%`;
    container.style.transform = '';
    container.style.transformOrigin = '';
    refreshZoomLayout(container);
    setRenderZoom(zoomLevel);
    updateVisiblePages();
    window.dispatchEvent(new CustomEvent('editor-zoom', { detail: { zoom: zoomLevel } }));
  };
  zoomApply = apply;
  outBtn.addEventListener('click', () => apply(zoomLevel - ZOOM_STEP));
  inBtn.addEventListener('click', () => apply(zoomLevel + ZOOM_STEP));
  label.addEventListener('click', () => apply(1));
  label.title = '클릭하면 100%';
  apply(1);
}