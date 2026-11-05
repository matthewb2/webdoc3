// src/preview.ts - 읽기 전용 미리보기 모드 (쪽맞춤 포함)
import { getCachedPages, updateVisiblePages } from './render';


import { getZoomLevel } from './listener';

let previewMode = false;

function setVisible(selector: string, visible: boolean, display: string): void {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return;
  el.style.display = visible ? display : 'none';
}

// 읽기 전용 미리보기: 전체 페이지 마운트 후 복제 렌더 (편집 DOM은 그대로 유지)
function enterPreview(): void {
  if (previewMode) return;
  const total = getCachedPages().length;
  if (total === 0) return;
  previewMode = true;
  const all: number[] = [];
  for (let i = 0; i < total; i++) all.push(i);
  updateVisiblePages(all);
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  if (pv) {
    pv.innerHTML = '';
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
  setVisible('.preview-viewport', true, 'block');
}

let previewFit: number | null = null;

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
  if (el) el.textContent = previewFit !== null ? '미리보기 (쪽맞춤, 읽기 전용)' : '미리보기 (읽기 전용)';
}

// 쪽맞춤: 지정한 페이지 높이를 뷰포트 높이에 맞춤 (토글)
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
  previewFit = null;
  const pv = document.getElementById('preview-container') as HTMLDivElement | null;
  if (pv) {
    pv.innerHTML = '';
    pv.style.transform = '';
    pv.style.height = '';
  }
  setVisible('.toolbar', true, 'flex');
  setVisible('.editor-viewport', true, 'block');
  setVisible('.statusbar', true, 'flex');
  setVisible('.preview-toolbar', false, 'flex');
  setVisible('.preview-viewport', false, 'block');
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
  document.getElementById('btn-preview-fit')?.addEventListener('click', () => {
    if (previewMode) togglePreviewFit();
  });
  document.getElementById('preview-container')?.addEventListener('click', (e) => {
    if (!previewMode) return;
    const pg = (e.target as Element)?.closest?.('.page') as HTMLElement | null;
    if (pg) togglePreviewFit(pg);
  });
}
