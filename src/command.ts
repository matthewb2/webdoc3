import aboutLogoUrl from './assets/logo.png';
import { setAiChatOpen } from './aiChat';
import { zoomEditorIn, zoomEditorOut, zoomEditorReset } from './initUI';

let openRecentFileByNameFn: ((name: string) => void | Promise<void>) | null = null;

export function setRecentFileOpener(fn: (name: string) => void | Promise<void>) {
  openRecentFileByNameFn = fn;
}

export function activateRibbonTab(tab: string) {
  document.querySelectorAll<HTMLElement>('.ribbon-panel[data-tab]').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
}

function showAboutDialog() {
  const existing = document.getElementById('about-dialog-overlay');
  if (existing) {
    existing.remove();
  }
  const overlay = document.createElement('div');
  overlay.id = 'about-dialog-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.35)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.2);padding:24px 28px;min-width:320px;max-width:420px;text-align:center;font-family:var(--ui-font,sans-serif);">
      <img src="${aboutLogoUrl}" alt="DOC3 로고" style="width:72px;height:72px;object-fit:contain;margin-bottom:12px;" />
      <div style="font-size:20px;font-weight:700;color:#1b4f9c;margin-bottom:10px;">DOC3</div>
      <div style="font-size:13px;color:#333;margin-bottom:4px;">버전: 0.2.1</div>
      <div style="font-size:13px;color:#333;margin-bottom:16px;">제공자: MK-SOLUTION</div>
      <button id="about-dialog-close" type="button" style="height:32px;padding:0 16px;border:1px solid #ccd3da;border-radius:6px;background:#f7f9fa;cursor:pointer;">닫기</button>
    </div>
  `;
  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('#about-dialog-close')?.addEventListener('click', close);
  document.body.appendChild(overlay);
}

function setRibbonCollapsed(collapsed: boolean) {
  const toolbar = document.querySelector('.toolbar') as HTMLElement | null;
  const btn = document.getElementById('btn-toggle-ribbon') as HTMLButtonElement | null;
  if (!toolbar) return;
  toolbar.classList.toggle('ribbon-collapsed', collapsed);
  document.documentElement.style.setProperty('--ribbon-height', collapsed ? '20px' : '85px');
  if (btn) {
    btn.innerHTML = collapsed ? '<i class="bi bi-chevron-down"></i>' : '<i class="bi bi-chevron-up"></i>';
    btn.title = collapsed ? '리본 메뉴 표시' : '리본 메뉴 숨기기';
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
  const api = (window as any).electronAPI;
  if (api && typeof api.setRibbonCollapsed === 'function') {
    api.setRibbonCollapsed(collapsed);
  }
  window.dispatchEvent(new CustomEvent('ribbon-visibility-change', { detail: { collapsed } }));
}

export function handleMenuCommand(command: string) {
  if (command.startsWith('tab:')) {
    activateRibbonTab(command.slice(4));
    return;
  }
  if (command.startsWith('file:openRecent:')) {
    const name = decodeURIComponent(command.slice('file:openRecent:'.length));
    activateRibbonTab('file');
    void openRecentFileByNameFn?.(name);
    return;
  }

  const category = command.split(':')[0];
  if (['file', 'edit', 'view', 'input', 'format', 'page'].includes(category)) {
    activateRibbonTab(category);
  }

  switch (command) {
    case 'file:new':
      (document.getElementById('btn-new-file') as HTMLButtonElement | null)?.click();
      return;
    case 'file:open':
      (document.getElementById('btn-open-file') as HTMLButtonElement | null)?.click();
      return;
    case 'file:save':
      (document.getElementById('btn-save') as HTMLButtonElement | null)?.click();
      return;
    case 'file:saveAs':
      (document.getElementById('btn-save-as') as HTMLButtonElement | null)?.click();
      return;
    case 'edit:find': {
      const input = document.getElementById('find-text-input') as HTMLInputElement | null;
      input?.focus();
      input?.select();
      return;
    }
    case 'view:preview':
      (document.getElementById('btn-preview') as HTMLButtonElement | null)?.click();
      return;
    case 'view:zoomIn':
      zoomEditorIn();
      return;
    case 'view:zoomOut':
      zoomEditorOut();
      return;
    case 'view:zoomReset':
      zoomEditorReset();
      return;
    case 'view:toggleParaMarks': {
      const cb = document.getElementById('show-para-marks-checkbox') as HTMLInputElement | null;
      if (cb) {
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
    case 'view:showRibbon':
      setRibbonCollapsed(false);
      return;
    case 'view:hideRibbon':
      setRibbonCollapsed(true);
      return;
    case 'view:showAiChat':
      setAiChatOpen(true);
      return;
    case 'view:hideAiChat':
      setAiChatOpen(false);
      return;
    case 'input:insertTable':
      (document.getElementById('btn-insert-table') as HTMLButtonElement | null)?.click();
      return;
    case 'input:insertRect':
      (document.getElementById('btn-insert-shape-rect') as HTMLButtonElement | null)?.click();
      return;
    case 'input:insertEllipse':
      (document.getElementById('btn-insert-shape-ellipse') as HTMLButtonElement | null)?.click();
      return;
    case 'input:insertLine':
      (document.getElementById('btn-insert-shape-line') as HTMLButtonElement | null)?.click();
      return;
    case 'input:insertArrow':
      (document.getElementById('btn-insert-shape-arrow') as HTMLButtonElement | null)?.click();
      return;
    case 'format:styleBody':
      (document.getElementById('btn-style-body') as HTMLButtonElement | null)?.click();
      return;
    case 'format:styleTitle':
      (document.getElementById('btn-style-title') as HTMLButtonElement | null)?.click();
      return;
    case 'format:bold':
      (document.getElementById('btn-style-bold') as HTMLButtonElement | null)?.click();
      return;
    case 'format:italic':
      (document.getElementById('btn-style-italic') as HTMLButtonElement | null)?.click();
      return;
    case 'format:underline':
      (document.getElementById('btn-style-underline') as HTMLButtonElement | null)?.click();
      return;
    case 'page:applyMargins':
      (document.getElementById('btn-apply-margins') as HTMLButtonElement | null)?.click();
      return;
    case 'help:about':
      showAboutDialog();
      return;
  }
}

export function initRibbonTabs() {
  document.querySelectorAll<HTMLElement>('.ribbon-tab[data-tab-target]').forEach((el) => {
    el.addEventListener('click', () => {
      const tab = el.dataset.tabTarget;
      if (tab) activateRibbonTab(tab);
    });
  });

  const toggleBtn = document.getElementById('btn-toggle-ribbon') as HTMLButtonElement | null;
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const toolbar = document.querySelector('.toolbar') as HTMLElement | null;
      const collapsed = !(toolbar?.classList.contains('ribbon-collapsed'));
      setRibbonCollapsed(collapsed);
    });
  }

  document.getElementById('btn-about')?.addEventListener('click', () => {
    showAboutDialog();
  });

  document.addEventListener('keydown', (e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      const isElectron = !!(window as any).electronAPI;
      const key = e.key.toLowerCase();
      if (key === 'f') {
        // Electron 기본 메뉴의 니모닉(Alt+F) 동작을 우선 허용
        if (!isElectron) {
          e.preventDefault();
          activateRibbonTab('file');
        }
        return;
      }
      if (key === 's') {
        e.preventDefault();
        (document.getElementById('btn-save') as HTMLButtonElement | null)?.click();
        return;
      }
    }
  });

  const api = (window as any).electronAPI;
  if (api && typeof api.onMenuCommand === 'function') {
    api.onMenuCommand((command: string) => handleMenuCommand(command));
  }
}
