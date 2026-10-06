// src/docx/docxParser.ts - DOCX(word/document.xml) → DocumentModel
import JSZip from 'jszip';
import type {
  DocumentModel,
  ParagraphNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextRun,
} from '../types';

const PT_TO_PX = 4 / 3;

const ALIGN_MAP: Record<string, 'left' | 'center' | 'right' | 'justify'> = {
  left: 'left',
  center: 'center',
  right: 'right',
  both: 'justify',
  distribute: 'justify',
  distributeSpace: 'justify',
};

const HIGHLIGHT_MAP: Record<string, string> = {
  yellow: '#FFFF00',
  green: '#00FF00',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  blue: '#0000FF',
  red: '#FF0000',
  darkBlue: '#000080',
  darkCyan: '#008080',
  darkGreen: '#008000',
  darkMagenta: '#800080',
  darkRed: '#800000',
  darkYellow: '#808000',
  darkGray: '#808080',
  lightGray: '#C0C0C0',
  black: '#000000',
};

interface RunStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  backgroundColor?: string;
}

interface StyleDef {
  rPr: Partial<RunStyle>;
  pAlign?: 'left' | 'center' | 'right' | 'justify';
  basedOn?: string;
}

function els(parent: Element, local: string): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < parent.childNodes.length; i++) {
    const n = parent.childNodes[i];
    if (n.nodeType === 1 && (n as Element).localName === local) out.push(n as Element);
  }
  return out;
}

function first(parent: Element, local: string): Element | null {
  const found = els(parent, local);
  return found.length > 0 ? found[0] : null;
}

function attr(el: Element, local: string): string | null {
  // w:val 형태 (네임스페이스 무관하게 localName으로 탐색)
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    if (a.localName === local) return a.value;
  }
  return null;
}

function onOff(el: Element | null): boolean {
  if (!el) return false;
  const v = attr(el, 'val');
  return v === null || !/^(false|0|off|none)$/i.test(v);
}

function parseRunPr(rPr: Element | null, base: Partial<RunStyle> = {}): Partial<RunStyle> {
  const style: Partial<RunStyle> = { ...base };
  if (!rPr) return style;
  if (onOff(first(rPr, 'b'))) style.bold = true;
  if (onOff(first(rPr, 'i'))) style.italic = true;
  // w:u 단독 존재 = 밑줄, val=none이면 없음
  const uEl = first(rPr, 'u');
  if (uEl && attr(uEl, 'val') !== 'none') style.underline = true;
  if (first(rPr, 'strike') || first(rPr, 'dstrike')) style.strike = true;
  const sz = first(rPr, 'sz');
  if (sz) {
    const v = parseFloat(attr(sz, 'val') ?? '');
    if (!isNaN(v)) style.fontSize = Math.round(((v / 2) * PT_TO_PX) * 100) / 100;
  }
  const color = first(rPr, 'color');
  if (color) {
    const v = attr(color, 'val') ?? '';
    if (/^[0-9a-fA-F]{6}$/.test(v)) style.color = `#${v}`;
  }
  const fonts = first(rPr, 'rFonts');
  if (fonts) {
    const name = attr(fonts, 'ascii') || attr(fonts, 'hAnsi');
    if (name) style.fontFamily = name;
  }
  const highlight = first(rPr, 'highlight');
  if (highlight) {
    const mapped = HIGHLIGHT_MAP[attr(highlight, 'val') ?? ''];
    if (mapped) style.backgroundColor = mapped;
  }
  const shd = first(rPr, 'shd');
  if (shd) {
    const fill = attr(shd, 'fill') ?? '';
    if (/^[0-9a-fA-F]{6}$/.test(fill)) style.backgroundColor = `#${fill}`;
  }
  return style;
}

function parseStyles(stylesDoc: Document | null): { defaults: Partial<RunStyle>; styles: Map<string, StyleDef> } {
  const defaults: Partial<RunStyle> = {};
  const styles = new Map<string, StyleDef>();
  if (!stylesDoc) return { defaults, styles };
  const root = stylesDoc.documentElement;
  const docDefaults = first(root, 'docDefaults');
  if (docDefaults) {
    const rPrDefault = first(docDefaults, 'rPrDefault');
    if (rPrDefault) Object.assign(defaults, parseRunPr(first(rPrDefault, 'rPr')));
  }
  els(root, 'style').forEach((st) => {
    const id = attr(st, 'styleId');
    if (!id) return;
    const def: StyleDef = { rPr: {} };
    const basedOn = first(st, 'basedOn');
    if (basedOn && attr(basedOn, 'val')) def.basedOn = attr(basedOn, 'val') as string;
    const pPr = first(st, 'pPr');
    if (pPr) {
      const jc = first(pPr, 'jc');
      if (jc) {
        const mapped = ALIGN_MAP[attr(jc, 'val') ?? ''];
        if (mapped) def.pAlign = mapped;
      }
    }
    const rPr = first(st, 'rPr');
    if (rPr) def.rPr = parseRunPr(rPr);
    styles.set(id, def);
  });
  return { defaults, styles };
}

function resolveRunStyle(
  styles: Map<string, StyleDef>,
  defaults: Partial<RunStyle>,
  styleId: string | null,
  direct: Element | null,
): Partial<RunStyle> {
  const chain: StyleDef[] = [];
  const seen = new Set<string>();
  let cur = styleId;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const def = styles.get(cur);
    if (!def) break;
    chain.unshift(def);
    cur = def.basedOn ?? null;
  }
  let merged: Partial<RunStyle> = { ...defaults };
  chain.forEach((def) => {
    merged = { ...merged, ...def.rPr };
  });
  merged = { ...merged, ...parseRunPr(direct, {}) };
  return merged;
}

function resolveParaAlign(
  styles: Map<string, StyleDef>,
  styleId: string | null,
  pPr: Element | null,
): 'left' | 'center' | 'right' | 'justify' | undefined {
  if (pPr) {
    const jc = first(pPr, 'jc');
    if (jc) {
      const mapped = ALIGN_MAP[attr(jc, 'val') ?? ''];
      if (mapped) return mapped;
    }
  }
  const seen = new Set<string>();
  let cur = styleId;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const def = styles.get(cur);
    if (!def) break;
    if (def.pAlign) return def.pAlign;
    cur = def.basedOn ?? null;
  }
  return undefined;
}

// w:ind (dxa = 1/20pt): firstLine 우선, 없으면 left
function resolveParaIndent(pPr: Element | null): number | undefined {
  if (!pPr) return undefined;
  const ind = first(pPr, 'ind');
  if (!ind) return undefined;
  const dxa = (local: string): number | null => {
    const v = parseFloat(attr(ind, local) ?? '');
    return isNaN(v) ? null : v;
  };
  const firstLine = dxa('firstLine');
  if (firstLine !== null) return Math.round((firstLine / 15) * 100) / 100;
  const hanging = dxa('hanging');
  if (hanging !== null) return -Math.round((hanging / 15) * 100) / 100;
  const left = dxa('left');
  if (left !== null && left !== 0) return Math.round((left / 15) * 100) / 100;
  return undefined;
}

interface Ctx {
  styles: Map<string, StyleDef>;
  defaults: Partial<RunStyle>;
}

function runFromStyle(style: Partial<RunStyle>, text: string): TextRun {
  const run: TextRun = { text };
  if (style.bold) run.bold = true;
  if (style.italic) run.italic = true;
  if (style.underline) run.underline = true;
  if (style.strike) run.strike = true;
  if (style.fontSize !== undefined) run.fontSize = style.fontSize;
  if (style.color) run.color = style.color;
  if (style.fontFamily) run.fontFamily = style.fontFamily;
  if (style.backgroundColor) run.backgroundColor = style.backgroundColor;
  return run;
}

function parseParagraph(p: Element, ctx: Ctx): ParagraphNode {
  const pPr = first(p, 'pPr');
  let styleId: string | null = null;
  if (pPr) {
    const pStyle = first(pPr, 'pStyle');
    if (pStyle) styleId = attr(pStyle, 'val');
  }
  const align = resolveParaAlign(ctx.styles, styleId, pPr);
  const runs: TextRun[] = [];
  // 번호 매기기 문단 앞 불릿 (근사)
  if (pPr && first(pPr, 'numPr')) runs.push({ text: '• ' });

  const pushText = (style: Partial<RunStyle>, text: string) => {
    if (text.length === 0) return;
    const last = runs[runs.length - 1];
    const candidate = runFromStyle(style, text);
    if (
      last &&
      last.bold === candidate.bold &&
      last.italic === candidate.italic &&
      last.underline === candidate.underline &&
      last.strike === candidate.strike &&
      last.fontSize === candidate.fontSize &&
      last.color === candidate.color &&
      last.fontFamily === candidate.fontFamily &&
      last.backgroundColor === candidate.backgroundColor
    ) {
      last.text += text;
    } else {
      runs.push(candidate);
    }
  };

  const walkRuns = (node: Element) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType !== 1) continue;
      const el = child as Element;
      const local = el.localName;
      if (local === 'r') {
        const style = resolveRunStyle(ctx.styles, ctx.defaults, styleId, first(el, 'rPr'));
        let text = '';
        for (let k = 0; k < el.childNodes.length; k++) {
          const rc = el.childNodes[k];
          if (rc.nodeType !== 1) continue;
          const re = rc as Element;
          if (re.localName === 't') text += re.textContent ?? '';
          else if (re.localName === 'tab') text += '\t';
          else if (re.localName === 'br') text += ' ';
        }
        pushText(style, text);
      } else if (local === 'hyperlink' || local === 'sdtContent' || local === 'sdt') {
        walkRuns(el);
      }
      // instrText(필드 코드)·drawing·pict 등은 건너뜀
    }
  };
  walkRuns(p);

  const node: ParagraphNode = { type: 'paragraph', children: runs.length > 0 ? runs : [{ text: '' }] };
  if (align) node.align = align;
  const indent = resolveParaIndent(pPr);
  if (indent) node.indent = indent;
  return node;
}

function parseTable(tbl: Element, ctx: Ctx): TableNode {
  const rows: TableRowNode[] = [];
  els(tbl, 'tr').forEach((tr) => {
    const cells: TableCellNode[] = [];
    els(tr, 'tc').forEach((tc) => {
      const children: TextRun[] = [];
      els(tc, 'p').forEach((p) => {
        children.push(...parseParagraph(p, ctx).children);
      });
      cells.push({ type: 'table-cell', children });
    });
    rows.push({ type: 'table-row', cells });
  });
  return { type: 'table', rows };
}

function parseXml(text: string, label: string): Document {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error(`${label} XML 파싱 실패`);
  }
  return doc;
}

export function parseDocxToDocumentModel(data: Uint8Array): DocumentModel {
  const zip = new JSZip(data);
  const docFile = zip.file('word/document.xml');
  if (!docFile) throw new Error('word/document.xml 없음');
  const doc = parseXml(docFile.asText(), 'document.xml');
  const stylesFile = zip.file('word/styles.xml');
  const ctx: Ctx = parseStyles(stylesFile ? parseXml(stylesFile.asText(), 'styles.xml') : null);

  const model: DocumentModel = [];
  const body = doc.getElementsByTagName('w:body')[0] || doc.getElementsByTagName('body')[0];
  const root = body ?? doc.documentElement;
  const walkTop = (node: Element) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType !== 1) continue;
      const el = child as Element;
      if (el.localName === 'p') model.push(parseParagraph(el, ctx));
      else if (el.localName === 'tbl') model.push(parseTable(el, ctx));
      else if (el.localName === 'sdt') {
        const content = first(el, 'sdtContent');
        if (content) walkTop(content);
      }
    }
  };
  walkTop(root);
  return model;
}
