// src/preview.ts - 읽기 전용 미리보기 모드 (쪽맞춤/맞쪽보기 포함)
import { getCachedPages, updateVisiblePages } from './render';
import { getZoomLevel } from './listener';

let previewMode = false;
let twoPagesMode = false;
let previewFit: number | null = null;

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

// 읽기 전용 미리보기: 전체 페이지 마운트 후 복제 렌더 (편집 DOM은 그대로 유지)
function enterPreview(): void {
  if (previewMode) return;
  const total = getCachedPages().length;
  if (total === 0) return;
  previewMode = true;
  twoPagesMode = false;
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
    previewFit = null;
    updatePreviewFitLabel();
    applyPreviewTransform();
  }
  setVisible('.toolbar', false, 'flex');
  setVisible('.editor-viewport', false, 'block');
  setVisible('.statusbar', false, 'flex');
  setVisible('.preview-toolbar', true, 'flex');
  setVisible('.preview-viewport', true, 'flex');
}

function applyPreviewTransform(): void {
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  if (!pv) return;
  const z = previewFit ?? getZoomLevel();
  pv.style.transform = `scale(${z})`;
  pv.style.transformOrigin = 'top center';
  pv.style.height = '';
  pv.style.height = `${Math.ceil(pv.scrollHeight * z)}px`;
}

function updatePreviewFitLabel(): void {
  const el = document.getElementById('preview-mode-label');
  if (el) {
    if (twoPagesMode) {
      el.textContent = '미리보기 (맞쪽보기, 읽기 전용)';
    } else {
      el.textContent = previewFit !== null ? '미리보기 (쪽맞춤, 읽기 전용)' : '미리보기 (읽기 전용)';
    }
  }
  updateFitButtonState();
}

// 쪽맞춤: 지정한 페이지 높이를 뷰포트 높이에 맞춤 (토글)
function togglePreviewFit(pageEl?: HTMLElement): void {
  const viewport = document.querySelector('.preview-viewport') as HTMLDivElement | null;
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  if (!viewport || !pv) return;

  // 맞쪽보기 모드가 켜져 있다면 해제하여 한 페이지만 표시
  if (twoPagesMode) {
    previewFit = null; // 쪽맞춤 해제
    twoPagesMode = false;
    pv.classList.remove('two-pages-mode');
    const btnTwo = document.getElementById('btn-preview-two-pages') || document.getElementById('btn-preview-two');
    btnTwo?.classList.remove('active');
  }

  if (previewFit !== null) {
    previewFit = null;
    updatePreviewFitLabel();
    applyPreviewTransform();
    return;
  }

  // 지정된 페이지가 없으면 현재 뷰포트에 보이는 첫 번째 페이지 선택
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

  const oldZ = previewFit ?? getZoomLevel();
  const pvRect = pv.getBoundingClientRect();
  const pgRect = targetPage.getBoundingClientRect();
  const layoutOffset = (pgRect.top - pvRect.top) / oldZ;

  // 뷰포트 여백(위아래 패딩 약 40px) 고려한 실제 페이지 높이 기반 비율 계산
  const pageHeight = targetPage.offsetHeight || 900;
  const availableHeight = viewport.clientHeight - 40;
  const scale = availableHeight > 0 ? availableHeight / pageHeight : 1;

  previewFit = Math.round(scale * 1000) / 1000;
  updatePreviewFitLabel();
  applyPreviewTransform();
  viewport.scrollTop = 20 + layoutOffset * previewFit;
}

// 맞쪽보기: 두 페이지씩 나란히 배치 토글 (페이지 세로 크기를 뷰포트 높이에 맞춤)
function toggleTwoPagesMode(): void {
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  const viewport = document.querySelector('.preview-viewport') as HTMLDivElement | null;
  const btnTwo = document.getElementById('btn-preview-two-pages') || document.getElementById('btn-preview-two');
  if (!pv || !viewport) return;

  twoPagesMode = !twoPagesMode;
  if (twoPagesMode) {
    pv.classList.add('two-pages-mode');
    btnTwo?.classList.add('active');

    // 뷰포트 높이에 맞춰 페이지 세로 비율(scale) 계산
    const firstPage = pv.querySelector('.page') as HTMLElement | null;
    const pageHeight = firstPage?.offsetHeight || 900;
    const availableHeight = viewport.clientHeight - 40;
    const scale = availableHeight > 0 ? availableHeight / pageHeight : 1;
    previewFit = Math.round(scale * 1000) / 1000;
  } else {
    pv.classList.remove('two-pages-mode');
    btnTwo?.classList.remove('active');
    previewFit = null;
  }

  updatePreviewFitLabel();
  applyPreviewTransform();
}

function exitPreview(): void {
  if (!previewMode) return;
  // 미리보기에서 보고 있던 페이지를 편집기에서 이어서 표시
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
  if (pageNumber) {
    let target = document.querySelector(
      `#editor-container .page[data-page-number="${pageNumber}"]`,
    ) as HTMLElement | null;
    if (!target) {
      // 가상화로 마운트 해제된 경우 대상 페이지만 마운트
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

  document.getElementById('preview-container')?.addEventListener('click', (e) => {
    if (!previewMode) return;
    const pg = (e.target as Element)?.closest?.('.page') as HTMLElement | null;
    if (pg) togglePreviewFit(pg);
  });
}
