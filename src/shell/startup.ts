import logoUrl from '../assets/logo.svg';
import { showAppUI } from '../ui';

let isInitialReady = false;

export function applyFavicon(): void {
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = logoUrl;
}

export function showStartupSpinner(containerEl: HTMLDivElement | null): void {
  if (containerEl) {
    containerEl.style.display = 'none';
  }
  if (document.getElementById('startup-spinner-overlay')) return;

  const style = document.createElement('style');
  style.id = 'startup-spinner-style';
  style.textContent = `
    @keyframes doc3-spin {
      to { transform: rotate(360deg); }
    }
    #startup-spinner-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      background: rgba(243, 244, 246, 0.85);
      z-index: 9999;
      pointer-events: all;
    }
    #startup-spinner-overlay .spinner-ring {
      width: 36px;
      height: 36px;
      border: 3px solid #d1d5db;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: doc3-spin 0.75s linear infinite;
    }
    #startup-spinner-overlay .spinner-label {
      font-family: var(--ui-font, sans-serif);
      font-size: 13px;
      color: #4b5563;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'startup-spinner-overlay';
  overlay.innerHTML = `
    <div class="spinner-ring"></div>
    <div class="spinner-label">문서를 불러오는 중입니다...</div>
  `;

  const host = document.querySelector('.editor-viewport') || document.body;
  host.appendChild(overlay);
}

export function hideStartupSpinner(containerEl: HTMLDivElement | null): void {
  if (isInitialReady) return;
  isInitialReady = true;

  if (containerEl) {
    containerEl.style.display = 'inline-flex';
  }
  document.getElementById('startup-spinner-overlay')?.remove();
  document.getElementById('startup-spinner-style')?.remove();
  showAppUI();
}
