import type { DocBlockOutline, ToolCall } from './toolEngine';

export interface AiSettings {
  apiKey: string;
  baseUrl: string; // e.g. https://api.openai.com/v1 or https://generativelanguage.googleapis.com/v1beta
  model: string;   // e.g. gpt-4o-mini or gemini-1.5-flash
}

const SETTINGS_KEY = 'doc3.ai.settings.v1';

function envDefaults(): Partial<AiSettings> {
  const env = (import.meta as any).env || {};
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
  const geminiModel = env.GEMINI_LLM_MODEL || env.VITE_GEMINI_LLM_MODEL || '';
  if (geminiKey) {
    return {
      apiKey: geminiKey,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: geminiModel || 'gemini-1.5-flash',
    };
  }
  return {};
}

export function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const d = envDefaults();
      return {
        apiKey: typeof p.apiKey === 'string' && p.apiKey ? p.apiKey : (d.apiKey || ''),
        baseUrl: typeof p.baseUrl === 'string' && p.baseUrl ? p.baseUrl : (d.baseUrl || 'https://api.openai.com/v1'),
        model: typeof p.model === 'string' && p.model ? p.model : (d.model || 'gpt-4o-mini'),
      };
    }
  } catch {}
  const d = envDefaults();
  return {
    apiKey: d.apiKey || '',
    baseUrl: d.baseUrl || 'https://api.openai.com/v1',
    model: d.model || 'gpt-4o-mini',
  };
}

export function saveAiSettings(s: AiSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export const DOC3_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'patch_paragraph',
      description: '문단 블록의 전체 텍스트를 새 텍스트로 교체합니다.',
      parameters: {
        type: 'object',
        properties: {
          blockId: { type: 'string', description: '대상 문단 블록 ID (예: item_0)' },
          newText: { type: 'string', description: '교체할 전체 텍스트' },
        },
        required: ['blockId', 'newText'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'insert_paragraph',
      description: '지정한 블록 앞/뒤에 새 문단을 삽입합니다.',
      parameters: {
        type: 'object',
        properties: {
          targetId: { type: 'string', description: '기준 블록 ID' },
          newText: { type: 'string', description: '삽입할 문단 텍스트' },
          position: { type: 'string', enum: ['before', 'after'], description: '삽입 위치' },
        },
        required: ['targetId', 'newText'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_block',
      description: '블록을 삭제합니다.',
      parameters: {
        type: 'object',
        properties: {
          blockId: { type: 'string', description: '삭제할 블록 ID' },
        },
        required: ['blockId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_table_cell',
      description: '표 블록의 특정 셀 텍스트를 수정합니다.',
      parameters: {
        type: 'object',
        properties: {
          tableId: { type: 'string', description: '표 블록 ID' },
          rowIndex: { type: 'integer', description: '행 인덱스(0부터)' },
          colIndex: { type: 'integer', description: '열 인덱스(0부터)' },
          newText: { type: 'string', description: '셀 텍스트' },
        },
        required: ['tableId', 'rowIndex', 'colIndex', 'newText'],
      },
    },
  },
];

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentResult {
  replyText: string;
  toolCalls: ToolCall[];
}

function buildSystemPrompt(outline: DocBlockOutline[]): string {
  return `당신은 Doc3 문서 편집 AI 에이전트입니다. 사용자의 요청을 분석해 필요한 경우 제공된 도구(tool)를 호출해 문서를 수정하세요.
현재 문서 블록 개요(Outline):
${JSON.stringify(outline, null, 2)}

규칙:
- blockId/tableId/targetId는 위 outline의 id(item_<index>)를 사용하세요.
- 문서 수정이 필요하면 도구를 호출하세요. 여러 작업이 필요하면 여러 도구를 순서대로 호출할 수 있습니다.
- 도구 실행이 필요 없는 일반 질문/대화에는 텍스트로만 답하세요.
- 한국어로 간결하게 답하세요.`;
}

function isGemini(settings: AiSettings): boolean {
  return /generativelanguage\.googleapis\.com/i.test(settings.baseUrl) || /^gemini/i.test(settings.model || '');
}

function toGeminiTools() {
  return [{
    functionDeclarations: DOC3_TOOLS.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    })),
  }];
}

async function callGeminiAgent(params: {
  settings: AiSettings;
  prompt: string;
  outline: DocBlockOutline[];
  history: ChatMessage[];
}): Promise<AgentResult> {
  const { settings, prompt, outline, history } = params;
  const base = settings.baseUrl.replace(/\/+$/, '');
  const model = encodeURIComponent(settings.model || 'gemini-1.5-flash');
  const url = `${base}/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;

  const contents: any[] = [];
  // Gemini는 system을 systemInstruction으로 분리 가능하지만 호환성을 위해 첫 user에 포함
  const system = buildSystemPrompt(outline);
  const hist = history.slice(-12);
  if (hist.length === 0) {
    contents.push({ role: 'user', parts: [{ text: `${system}\n\n[사용자 요청]\n${prompt}` }] });
  } else {
    contents.push({ role: 'user', parts: [{ text: system }] });
    contents.push({ role: 'model', parts: [{ text: '네, 문서 개요를 확인했습니다. 요청을 처리하겠습니다.' }] });
    for (const m of hist) {
      contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      tools: toGeminiTools(),
      generationConfig: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Gemini API 오류 (${res.status}): ${t.slice(0, 400)}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  let replyText = '';
  const toolCalls: ToolCall[] = [];
  for (const part of parts) {
    if (typeof part?.text === 'string') replyText += (replyText ? '\n' : '') + part.text;
    const fc = part?.functionCall;
    if (fc?.name) {
      const name = fc.name;
      const args = fc.args || {};
      if (name === 'patch_paragraph' || name === 'insert_paragraph' || name === 'delete_block' || name === 'update_table_cell') {
        toolCalls.push({ name, args } as ToolCall);
      }
    }
  }
  return { replyText, toolCalls };
}

export async function callLLMAgent(params: {
  settings: AiSettings;
  prompt: string;
  outline: DocBlockOutline[];
  history: ChatMessage[];
}): Promise<AgentResult> {
  const { settings, prompt, outline, history } = params;
  if (!settings.apiKey) throw new Error('API 키가 설정되지 않았습니다. 채팅창의 설정에서 API 키를 입력하세요.');

  if (isGemini(settings)) {
    return callGeminiAgent({ settings, prompt, outline, history });
  }

  const base = settings.baseUrl.replace(/\/+$/, '');
  const url = `${base}/chat/completions`;
  const messages: any[] = [
    { role: 'system', content: buildSystemPrompt(outline) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: prompt },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      messages,
      tools: DOC3_TOOLS,
      tool_choice: 'auto',
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`LLM API 오류 (${res.status}): ${t.slice(0, 300)}`);
  }

  const data = await res.json();
  const choice = data?.choices?.[0];
  const msg = choice?.message;
  const replyText = typeof msg?.content === 'string' ? msg.content : '';
  const tcs = Array.isArray(msg?.tool_calls) ? msg.tool_calls : [];
  const toolCalls: ToolCall[] = [];
  for (const tc of tcs) {
    const fn = tc?.function || tc;
    const name = fn?.name;
    let args: any = fn?.arguments;
    if (typeof args === 'string') {
      try { args = JSON.parse(args); } catch { args = {}; }
    }
    if (name === 'patch_paragraph' || name === 'insert_paragraph' || name === 'delete_block' || name === 'update_table_cell') {
      toolCalls.push({ name, args } as ToolCall);
    }
  }
  return { replyText, toolCalls };
}
