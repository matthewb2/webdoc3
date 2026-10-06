// src/odt/odtParser.ts - ODT(content.xml) → DocumentModel
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
  justify: 'justify',
  justifyLastLine: 'justify',
};

interface ParaProps {
  align?: 'left' | 'center' | 'right' | 'justify';
  indent?: number;
}

interface TextProps {
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
  parent?: string;
  para: ParaProps;
  text: TextProps;
}

function els(parent: Element, local: string): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < parent.childNodes.length; i++) {
    const n = parent.childNodes[i];
    if (n.nodeType === 1 && (n as Element).localName === local) out.push(n as Element);
  }
  return out;
}

function attr(el: Element, local: string): string | null {
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    if (a.localName === local) return a.value;
  }
  return null;
}

function parseSizePt(value: string | null): number | undefined {
  if (!value) return undefined;
  const m = value.match(/^([\d.]+)\s*pt$/i);
  if (m) return Math.round(parseFloat(m[1]) * PT_TO_PX * 100) / 100;
  const n = parseFloat(value);
  if (!isNaN(n)) return Math.round(n * PT_TO_PX * 100) / 100;
  return undefined;
}

function parseTextProps(el: Element | null): TextProps {
  const props: TextProps = {};
  if (!el) return props;
  if (attr(el, 'font-weight') === 'bold') props.bold = true;
  if (attr(el, 'font-style') === 'italic') props.italic = true;
  const ul = attr(el, 'text-underline-style');
  if (ul && ul !== 'none') props.underline = true;
  const strike = attr(el, 'text-line-through-type') || attr(el, 'text-line-through-style');
  if (strike && strike !== 'none') props.strike = true;
  const size = parseSizePt(attr(el, 'font-size'));
  if (size !== undefined) props.fontSize = size;
  const color = attr(el, 'color');
  if (color && /^#[0-9a-fA-F]{6}$/.test(color)) props.color = color;
  const bg = attr(el, 'background-color');
  if (bg && /^#[0-9a-fA-F]{6}$/.test(bg)) props.backgroundColor = bg;
  const family = attr(el, 'font-name') || attr(el, 'font-family');
  if (family) props.fontFamily = family;
  return props;
}

function parseParaProps(el: Element | null): ParaProps {
  const props: ParaProps = {};
  if (!el) return props;
  const align = ALIGN_MAP[attr(el, 'text-align') ?? ''];
  if (align) props.align = align;
  const textIndent = parseSizePt(attr(el, 'text-indent'));
  if (textIndent) props.indent = textIndent;
  else {
    const marginLeft = parseSizePt(attr(el, 'margin-left'));
    if (marginLeft) props.indent = marginLeft;
  }
  return props;
}

function collectStyles(doc: Document | null, containerLocal: string): Map<string, StyleDef> {
  const map = new Map<string, StyleDef>();
  if (!doc) return map;
  const roots: Element[] = [];
  const walk = (node: Element) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType !== 1) continue;
      const el = child as Element;
      if (el.localName === containerLocal) roots.push(el);
      else walk(el);
    }
  };
  walk(doc.documentElement);
  roots.forEach((root) => {
    els(root, 'style').forEach((st) => {
      const name = attr(st, 'name');
      if (!name) return;
      const def: StyleDef = { para: {}, text: {} };
      const parent = attr(st, 'parent-style-name');
      if (parent) def.parent = parent;
      els(st, 'paragraph-properties').forEach((pp) => {
        Object.assign(def.para, parseParaProps(pp));
      });
      els(st, 'text-properties').forEach((tp) => {
        Object.assign(def.text, parseTextProps(tp));
      });
      map.set(name, def);
    });
  });
  return map;
}

interface Ctx {
  auto: Map<string, StyleDef>;
  named: Map<string, StyleDef>;
}

function resolveParaProps(ctx: Ctx, styleName: string | null): ParaProps {
  const out: ParaProps = {};
  const seen = new Set<string>();
  const chain: StyleDef[] = [];
  let cur = styleName;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const def = ctx.auto.get(cur) ?? ctx.named.get(cur);
    if (!def) break;
    chain.unshift(def);
    cur = def.parent ?? null;
  }
  chain.forEach((def) => Object.assign(out, def.para));
  return out;
}

function resolveTextProps(ctx: Ctx, styleName: string | null, base: TextProps = {}): TextProps {
  const out: TextProps = { ...base };
  const seen = new Set<string>();
  const chain: StyleDef[] = [];
  let cur = styleName;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const def = ctx.auto.get(cur) ?? ctx.named.get(cur);
    if (!def) break;
    chain.unshift(def);
    cur = def.parent ?? null;
  }
  chain.forEach((def) => Object.assign(out, def.text));
  return out;
}

function runFromProps(props: TextProps, text: string): TextRun {
  const run: TextRun = { text };
  if (props.bold) run.bold = true;
  if (props.italic) run.italic = true;
  if (props.underline) run.underline = true;
  if (props.strike) run.strike = true;
  if (props.fontSize !== undefined) run.fontSize = props.fontSize;
  if (props.color) run.color = props.color;
  if (props.fontFamily) run.fontFamily = props.fontFamily;
  if (props.backgroundColor) run.backgroundColor = props.backgroundColor;
  return run;
}

function sameProps(a: TextRun, b: TextRun): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.fontSize === b.fontSize &&
    a.color === b.color &&
    a.fontFamily === b.fontFamily &&
    a.backgroundColor === b.backgroundColor
  );
}

function parseParaLike(
  p: Element,
  ctx: Ctx,
  baseProps: TextProps,
  paraAlign?: 'left' | 'center' | 'right' | 'justify',
  paraIndent?: number,
): ParagraphNode {
  const runs: TextRun[] = [];
  const pushText = (props: TextProps, text: string) => {
    if (text.length === 0) return;
    const candidate = runFromProps(props, text);
    const last = runs[runs.length - 1];
    if (last && sameProps(last, candidate)) last.text += text;
    else runs.push(candidate);
  };
  const walkInline = (node: Element, inherited: TextProps) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType === 3) {
        pushText(inherited, child.textContent ?? '');
        continue;
      }
      if (child.nodeType !== 1) continue;
      const el = child as Element;
      const local = el.localName;
      if (local === 'span') {
        walkInline(el, resolveTextProps(ctx, attr(el, 'style-name'), inherited));
      } else if (local === 's') {
        const count = parseInt(attr(el, 'c') ?? '1', 10);
        pushText(inherited, ' '.repeat(isNaN(count) || count < 1 ? 1 : count));
      } else if (local === 'tab') {
        pushText(inherited, '\t');
      } else if (local === 'line-break') {
        pushText(inherited, ' ');
      } else if (local === 'a' || local === 'bookmark' || local === 'bookmark-start' || local === 'bookmark-end') {
        walkInline(el, inherited);
      }
      // page-number·annotation 등은 건너뜀
    }
  };
  walkInline(p, baseProps);
  const node: ParagraphNode = { type: 'paragraph', children: runs.length > 0 ? runs : [{ text: '' }] };
  if (paraAlign) node.align = paraAlign;
  if (paraIndent) node.indent = paraIndent;
  return node;
}

function parsePara(p: Element, ctx: Ctx): ParagraphNode {
  const styleName = attr(p, 'style-name');
  const paraProps = resolveParaProps(ctx, styleName);
  const baseProps = resolveTextProps(ctx, styleName);
  return parseParaLike(p, ctx, baseProps, paraProps.align, paraProps.indent);
}

function parseCellParas(cell: Element, ctx: Ctx): TextRun[] {
  const children: TextRun[] = [];
  // 중첩 표는 평탄화 (셀 문단만 수집)
  const paras: Element[] = [];
  const collect = (node: Element) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType !== 1) continue;
      const el = child as Element;
      if (el.localName === 'p' || el.localName === 'h') paras.push(el);
      else collect(el);
    }
  };
  collect(cell);
  paras.forEach((p) => {
    children.push(...parsePara(p, ctx).children);
  });
  return children;
}

function parseTable(table: Element, ctx: Ctx): TableNode {
  const rows: TableRowNode[] = [];
  els(table, 'table-row').forEach((tr) => {
    const cells: TableCellNode[] = [];
    els(tr, 'table-cell').forEach((tc) => {
      const repeated = parseInt(attr(tc, 'number-columns-repeated') ?? '1', 10);
      const count = isNaN(repeated) || repeated < 1 ? 1 : repeated;
      const children = parseCellParas(tc, ctx);
      for (let i = 0; i < count; i++) {
        cells.push({ type: 'table-cell', children: i === 0 ? children : [] });
      }
    });
    // covered-table-cell은 건너뜀 (병합 셀로 취급)
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

function topTextElements(contentDoc: Document): Element[] {
  const bodies = contentDoc.getElementsByTagName('office:body');
  const body = bodies.length > 0 ? bodies[0] : contentDoc.documentElement;
  for (let i = 0; i < body.childNodes.length; i++) {
    const n = body.childNodes[i];
    if (n.nodeType === 1 && (n as Element).localName === 'text') {
      const out: Element[] = [];
      for (let k = 0; k < n.childNodes.length; k++) {
        const c = n.childNodes[k];
        if (c.nodeType === 1) out.push(c as Element);
      }
      return out;
    }
  }
  return [];
}

export function parseOdtToDocumentModel(data: Uint8Array): DocumentModel {
  const zip = new JSZip(data);
  const contentFile = zip.file('content.xml');
  if (!contentFile) throw new Error('content.xml 없음');
  const contentDoc = parseXml(contentFile.asText(), 'content.xml');
  const stylesFile = zip.file('styles.xml');
  const ctx: Ctx = {
    auto: collectStyles(contentDoc, 'automatic-styles'),
    named: collectStyles(stylesFile ? parseXml(stylesFile.asText(), 'styles.xml') : null, 'styles'),
  };

  const model: DocumentModel = [];
  // 목록 항목: 불릿 근사 (첫 문단 앞에 • )
  const pushListItem = (el: Element) => {
    let first = true;
    els(el, 'p').forEach((p) => {
      const node = parsePara(p, ctx);
      if (first) {
        first = false;
        node.children.unshift({ text: '• ' });
      }
      model.push(node);
    });
    els(el, 'h').forEach((p) => model.push(parsePara(p, ctx)));
    els(el, 'list').forEach((sub) => pushList(sub));
    els(el, 'list-item').forEach((item) => pushListItem(item));
  };
  const pushList = (list: Element) => {
    els(list, 'list-item').forEach((item) => pushListItem(item));
  };

  topTextElements(contentDoc).forEach((el) => {
    const local = el.localName;
    if (local === 'p' || local === 'h') model.push(parsePara(el, ctx));
    else if (local === 'table') model.push(parseTable(el, ctx));
    else if (local === 'list') pushList(el);
  });
  return model;
}
