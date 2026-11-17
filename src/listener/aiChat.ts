import type { DocumentModel } from '../types';
import { collectProbeItems, computeBreaks } from '../probe';
import { applyToolCall, getDocumentOutline, parseBlockId } from '../core/aiToolEngine';
import { callLLMAgent, loadAiSettings, saveAiSettings, type ChatMessage } from '../core/aiAgentClient';

export interface AiChatDeps {
  engine: { postMessage(msg: any): void; addEventListener(type: 'message', l: (e: MessageEvent<any>) => void): void; removeEventListener(type: 'message', l: (e: MessageEvent<any>) => void): void };
  applyModel: (model: DocumentModel) => Promise<void>;
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
  if (!panel || !input) return;

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
  };
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
