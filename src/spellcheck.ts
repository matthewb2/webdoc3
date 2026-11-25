export interface SpellParagraphInput { id: string; text: string }
export interface SpellErrorItem { start: number; end: number; org: string; suggestions: string[] }
export interface SpellParagraphResult { id: string; errors: SpellErrorItem[] }

interface ParaEntry {
  id: string;
  el: HTMLParagraphElement;
  text: string;
  nodes: Array<{ node: Text; start: number; end: number }>;
}

let lastResults: SpellParagraphResult[] = [];

function buildParaEntry(el: HTMLParagraphElement, id: string): ParaEntry {
  const nodes: ParaEntry['nodes'] = [];
  let text = '';
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const tn = n as Text;
    const data = tn.data ?? '';
    const start = text.length;
    text += data;
    nodes.push({ node: tn, start, end: text.length });
  }
  return { id, el, text, nodes };
}

function collectParagraphs(): ParaEntry[] {
  const root = document.getElementById('editor-container');
  if (!root) return [];
  const paras = Array.from(root.querySelectorAll('.page p')) as HTMLParagraphElement[];
  const entries: ParaEntry[] = [];
  for (const p of paras) {
    const pIdx = p.dataset.pIdx;
    const tableIdx = p.dataset.tableIdx;
    let id = '';
    if (pIdx !== undefined) {
      id = `p:${pIdx}`;
    } else if (tableIdx !== undefined) {
      id = `tc:${tableIdx}:${p.dataset.cellR ?? '0'}:${p.dataset.cellC ?? '0'}:${p.dataset.cellPara ?? '0'}`;
    } else {
      continue;
    }
    entries.push(buildParaEntry(p, id));
  }
  return entries;
}

function rangeForOffsets(entry: ParaEntry, start: number, end: number): Range | null {
  if (start < 0 || end <= start || end > entry.text.length) return null;
  let startNode: Text | null = null;
  let startOff = 0;
  let endNode: Text | null = null;
  let endOff = 0;
  for (const n of entry.nodes) {
    if (!startNode && start >= n.start && start < n.end) {
      startNode = n.node;
      startOff = start - n.start;
    }
    if (end > n.start && end <= n.end) {
      endNode = n.node;
      endOff = end - n.start;
      break;
    }
  }
  if (!startNode || !endNode) return null;
  try {
    const r = document.createRange();
    r.setStart(startNode, startOff);
    r.setEnd(endNode, endOff);
    return r;
  } catch {
    return null;
  }
}

export function clearSpellcheckHighlights(): void {
  const anyCSS = CSS as any;
  if (anyCSS?.highlights) {
    anyCSS.highlights.delete('spell-errors');
  }
}

export function getLastSpellcheckResults(): SpellParagraphResult[] {
  return lastResults;
}

export async function runSpellcheck(): Promise<SpellParagraphResult[]> {
  const api = (window as any).electronAPI;
  if (!api?.checkParagraphs) {
    console.warn('[spellcheck] electronAPI.checkParagraphs not available');
    return [];
  }

  clearSpellcheckHighlights();
  const entries = collectParagraphs();
  if (entries.length === 0) return [];

  const inputs: SpellParagraphInput[] = entries.map((e) => ({ id: e.id, text: e.text }));
  let results: SpellParagraphResult[];
  try {
    results = await api.checkParagraphs(inputs, { maxSuggestions: 5, minWordLength: 2 });
  } catch (err) {
    console.error('[spellcheck] failed', err);
    return [];
  }

  lastResults = Array.isArray(results) ? results : [];
  const byId = new Map(entries.map((e) => [e.id, e]));
  const ranges: Range[] = [];

  for (const res of lastResults) {
    const entry = byId.get(res.id);
    if (!entry || !Array.isArray(res.errors)) continue;
    for (const err of res.errors) {
      const r = rangeForOffsets(entry, err.start, err.end);
      if (r) ranges.push(r);
    }
  }

  const anyCSS = CSS as any;
  if (anyCSS?.highlights && typeof (window as any).Highlight === 'function') {
    const hl = new (window as any).Highlight(...ranges);
    anyCSS.highlights.set('spell-errors', hl);
  }

  return lastResults;
}


let listenersInstalled = false;
export function initSpellcheckListeners(): void {
  if (listenersInstalled || typeof document === 'undefined') return;
  listenersInstalled = true;
  document.addEventListener('input', () => {
    const anyCSS = CSS as any;
    if (anyCSS?.highlights?.has?.('spell-errors')) anyCSS.highlights.delete('spell-errors');
  }, true);
}
