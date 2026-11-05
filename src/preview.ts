// src/preview.ts - 읽기 전용 미리보기 모드 (쪽맞춤/맞쪽보기 및 상태바 페이지 번호 연동)
import { getCachedPages, updateVisiblePages } from './render';
import { getZoomLevel } from './listener';

let previewMode = false;
let twoPagesMode = false;
let previewFit: number | null = null;
let previewCustomZoom = 1; // 미리보기 전용 수동 줌 레벨

function setVisible(selector: string, visible: boolean, display: string): void {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return;
  el.style.display = visible ? display : 'none';
}

function updateFitButtonState(): void {
  const btnFit = document.getElementById('btn-preview-fit') || document.getElementById('btn-preview-fit-page');
  if (btnFit) {
    if (previewFit !== null) {
      btnFit.classList.add('active');
    } else {
      btnFit.classList.remove('active');
    }
  }
}

function updateZoomLabel(): void {
  const label = document.getElementById('preview-zoom-label');
  if (label) {
    const activeZoom = previewFit !== null ? previewFit : previewCustomZoom;
    label.textContent = `${Math.round(activeZoom * 100)}%`;
  }
}

// 현재 스크롤 위치를 바탕으로 보이는 페이지 번호 업데이트
function updatePreviewPageIndicator(): void {
  const viewport = document.querySelector('.preview-viewport') as HTMLDivElement | null;
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  const infoEl = document.getElementById('preview-cursor-page');
  if (!viewport || !pv || !infoEl) return;

  const pages = pv.querySelectorAll('.page');
  if (pages.length === 0) {
    infoEl.textContent = '0 / 0 페이지';
    return;
  }

  const vpRect = viewport.getBoundingClientRect();
  let currentIdx = 0;

  for (let i = 0; i < pages.length; i++) {
    const r = (pages[i] as HTMLElement).getBoundingClientRect();
    // 뷰포트 상단 영역에 걸쳐 있거나 가장 가까운 페이지 탐색
    if (r.bottom > vpRect.top + 50) {
      currentIdx = i;
      break;
    }
  }

  const total = pages.length;
  infoEl.textContent = `${currentIdx + 1} / ${total} 페이지`;
}

// 읽기 전용 미리보기: 전체 페이지 마운트 후 복제 렌더
function enterPreview(): void {
  if (previewMode) return;
  const total = getCachedPages().length;
  if (total === 0) return;
  previewMode = true;
  twoPagesMode = false;
  previewFit = null;
  previewCustomZoom = getZoomLevel(); // 메인 화면의 줌 레벨을 이어받음

  const all: number[] = [];
  for (let i = 0; i < total; i++) all.push(i);
  updateVisiblePages(all);

  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  if (pv) {
    pv.innerHTML = '';
    pv.classList.remove('two-pages-mode');
    document.querySelectorAll('#editor-container .page').forEach((pg) => {
      const clone = pg.cloneNode(true) as HTMLElement;
      clone.removeAttribute('contenteditable');
      clone.contentEditable = 'false';
      pv.appendChild(clone);
    });
    updatePreviewFitLabel();
    applyPreviewTransform();
  }
  setVisible('.toolbar', false, 'flex');
  setVisible('.editor-viewport', false, 'block');
  setVisible('.statusbar', false, 'flex');
  setVisible('.preview-toolbar', true, 'flex');
  setVisible('.preview-viewport', true, 'flex');
  setVisible('.preview-statusbar', true, 'flex'); // 상태바 표시
  
  // 초기 페이지 번호 반영
  requestAnimationFrame(updatePreviewPageIndicator);
}

function applyPreviewTransform(): void {
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  if (!pv) return;
  const z = previewFit ?? previewCustomZoom;
  pv.style.transform = `scale(${z})`;
  pv.style.transformOrigin = 'top center';
  pv.style.height = '';
  pv.style.height = `${Math.ceil(pv.scrollHeight * z)}px`;
  updateZoomLabel();
  updatePreviewPageIndicator();
}

function updatePreviewFitLabel(): void {
  const el = document.getElementById('preview-mode-label');
  if (el) {
    const modes: string[] = [];
    if (twoPagesMode) modes.push('맞쪽보기');
    if (previewFit !== null) modes.push('쪽맞춤');
    
    if (modes.length > 0) {
      el.textContent = `미리보기 (${modes.join(', ')}, 읽기 전용)`;
    } else {
      el.textContent = '미리보기 (읽기 전용)';
    }
  }
  updateFitButtonState();
}

// 쪽맞춤 토글 (독립 동작)
function togglePreviewFit(pageEl?: HTMLElement): void {
  const viewport = document.querySelector('.preview-viewport') as HTMLDivElement | null;
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  if (!viewport || !pv) return;

  if (previewFit !== null) {
    previewFit = null;
    updatePreviewFitLabel();
    applyPreviewTransform();
    return;
  }

  let targetPage = pageEl;
  if (!targetPage) {
    const vpRect = viewport.getBoundingClientRect();
    const pages = pv.querySelectorAll('.page');
    for (let i = 0; i < pages.length; i++) {
      const r = (pages[i] as HTMLElement).getBoundingClientRect();
      if (r.bottom > vpRect.top + 1) {
        targetPage = pages[i] as HTMLElement;
        break;
      }
    }
    if (!targetPage && pages.length > 0) {
      targetPage = pages[0] as HTMLElement;
    }
  }

  if (!targetPage) return;

  const oldZ = previewFit ?? previewCustomZoom;
  const pvRect = pv.getBoundingClientRect();
  const pgRect = targetPage.getBoundingClientRect();
  const layoutOffset = (pgRect.top - pvRect.top) / oldZ;

  const pageHeight = targetPage.offsetHeight || 900;
  const availableHeight = viewport.clientHeight - 40;
  const scale = availableHeight > 0 ? availableHeight / pageHeight : 1;

  previewFit = Math.round(scale * 1000) / 1000;
  updatePreviewFitLabel();
  applyPreviewTransform();
  viewport.scrollTop = 20 + layoutOffset * previewFit;
}

// 맞쪽보기 토글 (독립 동작)
function toggleTwoPagesMode(): void {
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  const viewport = document.querySelector('.preview-viewport') as HTMLDivElement | null;
  const btnTwo = document.getElementById('btn-preview-two-pages') || document.getElementById('btn-preview-two');
  if (!pv || !viewport) return;

  twoPagesMode = !twoPagesMode;
  if (twoPagesMode) {
    pv.classList.add('two-pages-mode');
    btnTwo?.classList.add('active');
  } else {
    pv.classList.remove('two-pages-mode');
    btnTwo?.classList.remove('active');
  }

  updatePreviewFitLabel();
  applyPreviewTransform();
}

// 수동 줌 조절 (미리보기 전용)
function changePreviewZoom(delta: number): void {
  previewFit = null; // 수동 줌 조절 시 쪽맞춤 해제
  updatePreviewFitLabel();
  previewCustomZoom = Math.min(2, Math.max(0.5, Math.round((previewCustomZoom + delta) * 100) / 100));
  applyPreviewTransform();
}

function resetPreviewZoom(): void {
  previewFit = null;
  updatePreviewFitLabel();
  previewCustomZoom = 1;
  applyPreviewTransform();
}

function exitPreview(): void {
  if (!previewMode) return;
  const previewViewport = document.querySelector('.preview-viewport') as HTMLDivElement | null;
  let pageNumber: string | null = null;
  if (previewViewport) {
    const vpRect = previewViewport.getBoundingClientRect();
    const pages = previewViewport.querySelectorAll('#preview-container .page');
    for (let i = 0; i < pages.length; i++) {
      const r = (pages[i] as HTMLElement).getBoundingClientRect();
      if (r.bottom > vpRect.top + 1) {
        pageNumber = (pages[i] as HTMLElement).dataset.pageNumber || null;
        break;
      }
    }
  }
  previewMode = false;
  twoPagesMode = false;
  previewFit = null;
  
  const btnTwo = document.getElementById('btn-preview-two-pages') || document.getElementById('btn-preview-two');
  btnTwo?.classList.remove('active');
  updateFitButtonState();

  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  if (pv) {
    pv.innerHTML = '';
    pv.classList.remove('two-pages-mode');
    pv.style.transform = '';
    pv.style.height = '';
  }
  setVisible('.toolbar', true, 'flex');
  setVisible('.editor-viewport', true, 'block');
  setVisible('.statusbar', true, 'flex');
  setVisible('.preview-toolbar', false, 'flex');
  setVisible('.preview-viewport', false, 'none');
  setVisible('.preview-statusbar', false, 'flex'); // 상태바 숨김

  if (pageNumber) {
    let target = document.querySelector(
      `#editor-container .page[data-page-number="${pageNumber}"]`,
    ) as HTMLElement | null;
    if (!target) {
      const idx = parseInt(pageNumber, 10) - 1;
      if (!isNaN(idx) && idx >= 0) {
        updateVisiblePages([idx]);
        target = document.querySelector(
          `#editor-container .page[data-page-number="${pageNumber}"]`,
        ) as HTMLElement | null;
      }
    }
    if (target) target.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' });
  }
}

export function initPreviewMode(): void {
  document.getElementById('btn-preview')?.addEventListener('click', () => enterPreview());
  document.getElementById('btn-preview-edit')?.addEventListener('click', () => exitPreview());
  document.getElementById('btn-preview-close')?.addEventListener('click', () => exitPreview());
  
  const handleFitClick = () => {
    if (previewMode) togglePreviewFit();
  };
  document.getElementById('btn-preview-fit')?.addEventListener('click', handleFitClick);
  document.getElementById('btn-preview-fit-page')?.addEventListener('click', handleFitClick);

  const handleTwoPagesClick = () => {
    if (previewMode) toggleTwoPagesMode();
  };
  document.getElementById('btn-preview-two-pages')?.addEventListener('click', handleTwoPagesClick);
  document.getElementById('btn-preview-two')?.addEventListener('click', handleTwoPagesClick);

  // 미리보기 상태바 확대/축소 버튼 이벤트 연결
  document.getElementById('btn-preview-zoom-out')?.addEventListener('click', () => {
    if (previewMode) changePreviewZoom(-0.1);
  });
  document.getElementById('btn-preview-zoom-in')?.addEventListener('click', () => {
    if (previewMode) changePreviewZoom(0.1);
  });
  document.getElementById('preview-zoom-label')?.addEventListener('click', () => {
    if (previewMode) resetPreviewZoom();
  });

  // 미리보기 뷰포트 스크롤 이벤트에 페이지 번호 갱신 연동
  const previewViewportEl = document.querySelector('.preview-viewport') as HTMLDivElement | null;
  let scrollRaf = 0;
  previewViewportEl?.addEventListener('scroll', () => {
    if (!previewMode) return;
    if (scrollRaf) return;
    scrollRaf = window.requestAnimationFrame(() => {
      scrollRaf = 0;
      updatePreviewPageIndicator();
    });
  }, { passive: true });

  document.getElementById('preview-container')?.addEventListener('click', (e) => {
    if (!previewMode) return;
    const pg = (e.target as Element)?.closest?.('.page') as HTMLElement | null;
    if (pg) togglePreviewFit(pg);
  });
}