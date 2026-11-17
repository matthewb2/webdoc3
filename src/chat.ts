import type { DocumentModel } from './types';
import { collectProbeItems, computeBreaks } from './probe';
import { applyToolCall, getDocumentOutline, parseBlockId } from './util/toolEngine';
import { callLLMAgent, loadAiSettings, saveAiSettings, type ChatMessage } from './util/agentClient';

export interface AiChatDeps {
  engine: { postMessage(msg: any): void; addEventListener(type: 'message', l: (e: MessageEvent<any>) => void): void; removeEventListener(type: 'message', l: (e: MessageEvent<any>) => void): void };
  applyModel: (model: DocumentModel) => Promise<void>;
}

let setAiChatOpenImpl: ((open: boolean) => void) | null = null;

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

function appendMessage(role: 'user' | 'assistant', text: string, toolLog?: string) {
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

function highlightChangedBlocks(indices: number[]) {
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

function requestDocSnapshot(engine: AiChatDeps['engine']): Promise<DocumentModel> {
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

export function initAiChat(deps?: Partial<AiChatDeps>) {
  const panel = document.getElementById('ai-chat-panel');
  const toggleBtn = document.getElementById('btn-ai-chat-toggle') as HTMLButtonElement | null;
  const closeBtn = document.getElementById('btn-ai-chat-close') as HTMLButtonElement | null;
  const sendBtn = document.getElementById('btn-ai-chat-send') as HTMLButtonElement | null;
  const input = document.getElementById('ai-chat-input') as HTMLTextAreaElement | null;
  const settingsBtn = document.getElementById('btn-ai-chat-settings') as HTMLButtonElement | null;
  const settingsBox = document.getElementById('ai-chat-settings') as HTMLDivElement | null;
  const saveSettingsBtn = document.getElementById('btn-ai-chat-save-settings') as HTMLButtonElement | null;
  const baseUrlInput = document.getElementById('ai-setting-baseurl') as HTMLInputElement | null;
  const modelInput = document.getElementById('ai-setting-model') as HTMLInputElement | null;
  const apiKeyInput = document.getElementById('ai-setting-apikey') as HTMLInputElement | null;
  const resizer = document.getElementById('ai-chat-resizer') as HTMLDivElement | null;
  if (!panel || !input) return;

  const WIDTH_KEY = 'doc3.ai.panelWidth';
  const applyPanelWidth = (w: number, persist = true) => {
    const clamped = Math.max(240, Math.min(Math.floor(window.innerWidth * 0.7), Math.round(w)));
    document.documentElement.style.setProperty('--ai-panel-width', `${clamped}px`);
    if (persist) {
      try { localStorage.setItem(WIDTH_KEY, String(clamped)); } catch {}
    }
  };
  try {
    const savedW = parseInt(localStorage.getItem(WIDTH_KEY) || '', 10);
    if (Number.isFinite(savedW) && savedW > 0) applyPanelWidth(savedW, false);
  } catch {}

  if (resizer) {
    let dragging = false;
    let startX = 0;
    let startW = 0;
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = startX - e.clientX; // drag left => wider
      applyPanelWidth(startW + dx);
      e.preventDefault();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    resizer.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startW = panel.getBoundingClientRect().width;
      resizer.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      e.preventDefault();
    });
  }

  const history: ChatMessage[] = [];

  const engine = deps?.engine;
  const applyModel = deps?.applyModel || (async (model: DocumentModel) => {
    if (!engine) return;
    const breaks = await computeBreaks(collectProbeItems(model));
    engine.postMessage({ type: 'BREAKS', payload: breaks });
    engine.postMessage({ type: 'INIT_DOC', payload: model });
  });

  const setOpen = (open: boolean) => {
    panel.classList.toggle('hidden', !open);
    document.body.classList.toggle('ai-chat-open', open);
    if (toggleBtn) toggleBtn.classList.toggle('active', open);
    const api = (window as any).electronAPI;
    if (api && typeof api.setAiChatVisible === 'function') {
      api.setAiChatVisible(open);
    }
  };
  setAiChatOpenImpl = setOpen;
  setOpen(true);

  const syncSettingsUi = () => {
    const s = loadAiSettings();
    if (baseUrlInput) baseUrlInput.value = s.baseUrl;
    if (modelInput) modelInput.value = s.model;
    if (apiKeyInput) apiKeyInput.value = s.apiKey;
  };
  syncSettingsUi();

  toggleBtn?.addEventListener('click', () => setOpen(panel.classList.contains('hidden')));
  closeBtn?.addEventListener('click', () => setOpen(false));
  settingsBtn?.addEventListener('click', () => {
    if (!settingsBox) return;
    settingsBox.style.display = settingsBox.style.display === 'none' ? 'flex' : 'none';
  });
  saveSettingsBtn?.addEventListener('click', () => {
    saveAiSettings({
      baseUrl: (baseUrlInput?.value || 'https://api.openai.com/v1').trim(),
      model: (modelInput?.value || 'gpt-4o-mini').trim(),
      apiKey: (apiKeyInput?.value || '').trim(),
    });
    appendMessage('assistant', 'AI 설정을 저장했습니다.');
  });

  let busy = false;
  const send = async () => {
    const text = input.value.trim();
    if (!text || busy) return;
    appendMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';

    if (!engine) {
      appendMessage('assistant', '문서 엔진에 연결되지 않아 편집 도구를 실행할 수 없습니다.');
      return;
    }

    busy = true;
    try {
      let model = await requestDocSnapshot(engine);
      const outline = getDocumentOutline(model);
      const settings = loadAiSettings();
      const agent = await callLLMAgent({ settings, prompt: text, outline, history: history.slice(-12) });

      const toolLogs: string[] = [];
      let changed: number[] = [];
      if (agent.toolCalls.length > 0) {
        for (const call of agent.toolCalls) {
          try {
            const res = applyToolCall(model, call);
            model = res.model;
            const id = (call as any).args?.blockId || (call as any).args?.tableId || (call as any).args?.targetId;
            if (id) { try { changed.push(parseBlockId(id)); } catch {} }
            toolLogs.push(`🔧 ${call.name} 실행 완료`);
          } catch (err: any) {
            toolLogs.push(`⚠️ ${call.name} 실패: ${err?.message || String(err)}`);
          }
        }
        await applyModel(model);
        highlightChangedBlocks(changed);
      }

      const reply = agent.replyText || (toolLogs.length ? '요청한 작업을 처리했습니다.' : '응답이 없습니다.');
      appendMessage('assistant', reply, toolLogs.length ? toolLogs.join('\n') : undefined);
      history.push({ role: 'assistant', content: reply });
    } catch (err: any) {
      appendMessage('assistant', `오류: ${err?.message || String(err)}`);
    } finally {
      busy = false;
    }
  };

  sendBtn?.addEventListener('click', () => { void send(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  });
}
