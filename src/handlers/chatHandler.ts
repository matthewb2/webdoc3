import type { DocumentModel } from '../types';

export interface AiChatDeps {
  engine: { postMessage(msg: any): void; addEventListener(type: 'message', l: (e: MessageEvent<any>) => void): void; removeEventListener(type: 'message', l: (e: MessageEvent<any>) => void): void };
  applyModel: (model: DocumentModel) => Promise<void>;
}

let setAiChatOpenImpl: ((open: boolean) => void) | null = null;

export function registerSetAiChatOpenImpl(fn: (open: boolean) => void) {
  setAiChatOpenImpl = fn;
}

export function setAiChatOpen(open: boolean) {
  if (setAiChatOpenImpl) {
    setAiChatOpenImpl(open);
    return;
  }
  const panel = document.getElementById('ai-chat-panel');
  if (!panel) return;
  panel.classList.toggle('hidden', !open);
  document.body.classList.toggle('ai-chat-open', open);
  const api = (window as any).electronAPI;
  if (api && typeof api.setAiChatVisible === 'function') {
    api.setAiChatVisible(open);
  }
}

export function toggleAiChatOpen() {
  const panel = document.getElementById('ai-chat-panel');
  setAiChatOpen(!!panel?.classList.contains('hidden'));
}

export function appendMessage(role: 'user' | 'assistant', text: string, toolLog?: string) {
  const list = document.getElementById('ai-chat-messages');
  if (!list) return;
  const msg = document.createElement('div');
  msg.className = `ai-chat-msg ${role}`;
  msg.textContent = text;
  if (toolLog) {
    const log = document.createElement('div');
    log.style.marginTop = '6px';
    log.style.fontSize = '11px';
    log.style.color = '#666';
    log.style.borderTop = '1px solid #e3e7eb';
    log.style.paddingTop = '4px';
    log.textContent = toolLog;
    msg.appendChild(log);
  }
  list.appendChild(msg);
  list.scrollTop = list.scrollHeight;
}

export function highlightChangedBlocks(indices: number[]) {
  if (!indices.length) return;
  window.setTimeout(() => {
    indices.forEach((idx) => {
      const els = Array.from(document.querySelectorAll(`[data-p-idx="${idx}"]`)) as HTMLElement[];
      els.forEach((el) => {
        const prev = el.style.transition;
        const prevBg = el.style.backgroundColor;
        el.style.transition = 'background-color 0.2s ease';
        el.style.backgroundColor = '#f0fdf4';
        window.setTimeout(() => {
          el.style.backgroundColor = prevBg || '';
          window.setTimeout(() => { el.style.transition = prev; }, 250);
        }, 1200);
      });
    });
  }, 120);
}

export function requestDocSnapshot(engine: AiChatDeps['engine']): Promise<DocumentModel> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      engine.removeEventListener('message', onMsg);
      reject(new Error('문서 스냅샷 요청 시간 초과'));
    }, 5000);
    const onMsg = (e: MessageEvent<any>) => {
      if (e.data?.type === 'DOC_SNAPSHOT') {
        window.clearTimeout(timeout);
        engine.removeEventListener('message', onMsg);
        resolve((e.data.payload || []) as DocumentModel);
      }
    };
    engine.addEventListener('message', onMsg);
    engine.postMessage({ type: 'GET_DOC' });
  });
}
