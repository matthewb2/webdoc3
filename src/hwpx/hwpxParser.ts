// src/hwpx/hwpxParser.ts - HWPX(Contents/*.xml) → DocumentModel (ODT 파서 구조 참고)
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
// HWPX/HWPUNIT: 100 = 1pt (일반적인 charPr height/paraPr 단위)
const HWPUNIT_TO_PT = 1 / 100;

const ALIGN_MAP: Record<string, 'left' | 'center' | 'right' | 'justify'> = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
  JUSTIFY: 'justify',
  DISTRIBUTE: 'justify',
  DISTRIBUTE_SPACE: 'justify',
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify',
};

interface ParaProps {
  align?: 'left' | 'center' | 'right' | 'justify';
  /** @deprecated use leftIndent/textIndent */
  indent?: number;
  leftIndent?: number;
  textIndent?: number;
  lineSpacing?: number;
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

interface ParaPrDef extends ParaProps {
  // header의 paraPr 정의
}

interface CharPrDef extends TextProps {
  // header의 charPr 정의
}

interface Ctx {
  paraPrs: Map<string, ParaPrDef>;
  charPrs: Map<string, CharPrDef>;
  fontFaces: Map<string, string>; // id -> face name (대표: hangul/latin)
}

function els(parent: Element, local: string): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < parent.childNodes.length; i++) {
    const n = parent.childNodes[i];
    if (n.nodeType === 1 && (n as Element).localName === local) out.push(n as Element);
  }
  return out;
}

function allDesc(parent: Element, local: string): Element[] {
  const out: Element[] = [];
  const walk = (node: Element) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const c = node.childNodes[i];
      if (c.nodeType !== 1) continue;
      const el = c as Element;
      if (el.localName === local) out.push(el);
      walk(el);
    }
  };
  walk(parent);
  return out;
}

function firstDesc(parent: Element, local: string): Element | null {
  for (let i = 0; i < parent.childNodes.length; i++) {
    const c = parent.childNodes[i];
    if (c.nodeType !== 1) continue;
    const el = c as Element;
    if (el.localName === local) return el;
    const found = firstDesc(el, local);
    if (found) return found;
  }
  return null;
}

function attr(el: Element, local: string): string | null {
  // localName 우선, 없으면 전체 이름(접두사 포함 가능성)도 확인
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    if (a.localName === local) return a.value;
  }
  return el.getAttribute(local);
}

function parseHwpUnitToPx(value: string | null | undefined): number | undefined {
  if (value == null) return undefined;
  const n = parseFloat(String(value));
  if (!Number.isFinite(n)) return undefined;
  // HWPUNIT -> pt -> px
  const px = n * HWPUNIT_TO_PT * PT_TO_PX;
  return Math.round(px * 100) / 100;
}

function parseColorValue(raw: string | null): string | undefined {
  if (!raw) return undefined;
  let s = raw.trim();
  if (!s || s === 'NONE' || s === 'none') return undefined;
  if (s.startsWith('#')) s = s.slice(1);
  // #RRGGBB or RRGGBB
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toUpperCase()}`;
  // AARRGGBB or #AARRGGBB
  if (/^[0-9a-fA-F]{8}$/.test(s)) return `#${s.slice(-6).toUpperCase()}`;
  // decimal (BGR/ARGB 등 가능) - 보수적으로 24bit 하위 RGB로 해석 시도
  if (/^\d+$/.test(s)) {
    const v = parseInt(s, 10);
    if (Number.isFinite(v)) {
      const rgb = v & 0xffffff;
      const hex = rgb.toString(16).padStart(6, '0').toUpperCase();
      return `#${hex}`;
    }
  }
  return undefined;
}

function parseFontSize(height: string | null): number | undefined {
  // charPr height: 100 = 1pt
  if (height == null) return undefined;
  const n = parseFloat(height);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const px = n * HWPUNIT_TO_PT * PT_TO_PX;
  return Math.round(px * 100) / 100;
}

function normalizeFontFamily(face: string | undefined): string | undefined {
  if (!face) return undefined;
  const name = face.trim();
  if (!name) return undefined;
  // 휴먼명조 계열은 기본 글꼴(바탕)로 대체
  if (/휴먼명조/i.test(name)) return '바탕';
  return name;
}

function collectHeader(ctx: Ctx, headerDoc: Document | null) {
  if (!headerDoc) return;
  const root = headerDoc.documentElement;

  // fontFaces: font id/name 매핑 (lang별; hangul 우선)
  const fontFaceEls = allDesc(root, 'fontface').concat(allDesc(root, 'fontFace'));
  fontFaceEls.forEach((ff) => {
    const lang = (attr(ff, 'lang') || '').toUpperCase();
    els(ff, 'font').forEach((f) => {
      const id = attr(f, 'id');
      const face = attr(f, 'face') || attr(f, 'name') || attr(ff, 'fontName');
      if (!id || !face) return;
      const key = id;
      if (!ctx.fontFaces.has(key)) ctx.fontFaces.set(key, face);
      // hangul/latin 명시 키도 저장
      if (lang) ctx.fontFaces.set(`${lang}:${id}`, face);
    });
    // exporter 형태: <hh:fontFace id="0" lang="hangul" name="..."/>
    const id = attr(ff, 'id');
    const name = attr(ff, 'name') || attr(ff, 'fontName');
    const lang2 = (attr(ff, 'lang') || '').toUpperCase();
    if (id && name) {
      const normalized = normalizeFontFamily(name) || name;
      if (!ctx.fontFaces.has(id)) ctx.fontFaces.set(id, normalized);
      if (lang2) ctx.fontFaces.set(`${lang2}:${id}`, normalized);
    }
  });

  // charPr 정의
  const charPrEls = allDesc(root, 'charPr');
  charPrEls.forEach((cp) => {
    const id = attr(cp, 'id');
    if (!id) return;
    const props: CharPrDef = {};
    const h = attr(cp, 'height');
    const fs = parseFontSize(h);
    if (fs !== undefined) props.fontSize = fs;

    // fontRef (hangul 우선)
    const fontRef = firstDesc(cp, 'fontRef');
    if (fontRef) {
      const fid = attr(fontRef, 'hangul') || attr(fontRef, 'HANGUL') || attr(fontRef, 'latin') || attr(fontRef, 'LATIN') || attr(fontRef, 'ko') || attr(fontRef, 'en');
      if (fid != null) {
        const face = ctx.fontFaces.get(`HANGUL:${fid}`) || ctx.fontFaces.get(`LATIN:${fid}`) || ctx.fontFaces.get(fid);
        const normalized = normalizeFontFamily(face);
        if (normalized) props.fontFamily = normalized;
      }
    } else {
      const fid = attr(cp, 'fontRef');
      if (fid != null) {
        const face = ctx.fontFaces.get(fid);
        const normalized = normalizeFontFamily(face);
        if (normalized) props.fontFamily = normalized;
      }
    }

    // bold/italic: <hh:fontStyle bold="true" italic="true"/> 또는 속성/자식
    const fontStyle = firstDesc(cp, 'fontStyle');
    const bold = (fontStyle ? attr(fontStyle, 'bold') : null) ?? attr(cp, 'bold');
    const italic = (fontStyle ? attr(fontStyle, 'italic') : null) ?? attr(cp, 'italic');
    if (bold === 'true' || bold === '1') props.bold = true;
    if (italic === 'true' || italic === '1') props.italic = true;

    // underline/strike: 다양한 표현 대응
    const underline = firstDesc(cp, 'underline');
    if (underline) {
      const type = (attr(underline, 'type') || attr(underline, 'shape') || '').toUpperCase();
      if (type && type !== 'NONE' && type !== '0' && type !== 'FALSE') props.underline = true;
      if (attr(underline, 'type') == null && attr(underline, 'shape') == null) props.underline = true; // 존재만으로 표시하는 경우
    }
    const strike = firstDesc(cp, 'strikeout') || firstDesc(cp, 'strike');
    if (strike) {
      const shape = (attr(strike, 'shape') || attr(strike, 'type') || '').toUpperCase();
      if (shape && shape !== 'NONE' && shape !== '0' && shape !== 'FALSE') props.strike = true;
      if (attr(strike, 'shape') == null && attr(strike, 'type') == null) props.strike = true;
    }

    // color
    const colorEl = firstDesc(cp, 'color');
    if (colorEl) {
      const c = parseColorValue(attr(colorEl, 'value') || attr(colorEl, 'text') || attr(colorEl, 'fontColor'));
      if (c) props.color = c;
      const bg = parseColorValue(attr(colorEl, 'background') || attr(colorEl, 'shade') || attr(colorEl, 'fillColor'));
      if (bg) props.backgroundColor = bg;
    } else {
      const c = parseColorValue(attr(cp, 'textColor') || attr(cp, 'color'));
      if (c) props.color = c;
    }

    // shade/fill 배경
    const shade = firstDesc(cp, 'shadeColor') || firstDesc(cp, 'fillColor');
    if (shade) {
      const bg = parseColorValue(attr(shade, 'value') || attr(shade, 'face') || attr(shade, 'background'));
      if (bg) props.backgroundColor = bg;
    }

    ctx.charPrs.set(id, props);
  });

  // paraPr 정의
  const paraPrEls = allDesc(root, 'paraPr');
  paraPrEls.forEach((pp) => {
    const id = attr(pp, 'id');
    if (!id) return;
    const props: ParaPrDef = {};

    // align: attr 또는 자식 <hp:align horizontal="..."/>
    let alignRaw = attr(pp, 'align');
    const alignEl = firstDesc(pp, 'align');
    if (!alignRaw && alignEl) alignRaw = attr(alignEl, 'horizontal') || attr(alignEl, 'value');
    const align = alignRaw ? ALIGN_MAP[alignRaw] : undefined;
    if (align) props.align = align;

    // margin/indent: <hp:margin intent left right .../> (HWPUNIT)
    const margin = firstDesc(pp, 'margin');
    if (margin) {
      const intent = parseHwpUnitToPx(attr(margin, 'intent'));
      const left = parseHwpUnitToPx(attr(margin, 'left'));
      if (left !== undefined) props.leftIndent = left;
      if (intent !== undefined) props.textIndent = intent;
      if (props.textIndent !== undefined) props.indent = props.textIndent;
      else if (props.leftIndent !== undefined) props.indent = props.leftIndent;
    } else {
      const intent = parseHwpUnitToPx(attr(pp, 'indent') || attr(pp, 'textIndent'));
      const left = parseHwpUnitToPx(attr(pp, 'marginLeft') || attr(pp, 'leftIndent'));
      if (left !== undefined) props.leftIndent = left;
      if (intent !== undefined) props.textIndent = intent;
      if (props.textIndent !== undefined) props.indent = props.textIndent;
      else if (props.leftIndent !== undefined) props.indent = props.leftIndent;
    }

    // lineSpacing: exporter는 percent-like 숫자, Hancom은 <hp:lineSpacing type value unit/>
    const lsEl = firstDesc(pp, 'lineSpacing');
    let ls: number | undefined;
    if (lsEl) {
      const type = (attr(lsEl, 'type') || '').toUpperCase();
      const val = parseFloat(attr(lsEl, 'value') || attr(lsEl, 'val') || '');
      if (Number.isFinite(val)) {
        if (type === 'PERCENT' || type === 'PROPORTIONAL' || type === '') {
          // value가 160 또는 16000(%) 등일 수 있음
          ls = val > 500 ? Math.round(val / 100) : Math.round(val);
        } else if (type === 'FIXED' || type === 'AT_LEAST' || type === 'BETWEENLINES') {
          // 고정값(hwpunit/pt 유사) -> 대략 퍼센트로 환산(10pt 기준)
          const px = val * HWPUNIT_TO_PT * PT_TO_PX;
          ls = Math.max(50, Math.min(500, Math.round((px / 16) * 100)));
        }
      }
    } else {
      const raw = attr(pp, 'lineSpacing');
      const n = raw != null ? parseFloat(raw) : NaN;
      if (Number.isFinite(n)) ls = Math.round(n);
    }
    if (ls !== undefined && Number.isFinite(ls)) props.lineSpacing = Math.max(50, Math.min(500, ls));

    ctx.paraPrs.set(id, props);
  });
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

function pushText(runs: TextRun[], props: TextProps, text: string) {
  if (text.length === 0) return;
  const candidate = runFromProps(props, text);
  const last = runs[runs.length - 1];
  if (last && sameProps(last, candidate)) last.text += text;
  else runs.push(candidate);
}

function parseRun(runEl: Element, ctx: Ctx, inherited: TextProps, runs: TextRun[]) {
  const charPrId = attr(runEl, 'charPrIDRef');
  const base: TextProps = charPrId ? { ...inherited, ...(ctx.charPrs.get(charPrId) || {}) } : { ...inherited };
  // 첫 몇 번만 상세 로그 (과다 출력 방지)
  if ((parseRun as any)._dbgCount == null) (parseRun as any)._dbgCount = 0;
  if ((parseRun as any)._dbgCount < 5) {
    (parseRun as any)._dbgCount++;
    console.log('[hwpx] run charPrIDRef=', charPrId, 'resolved=', base, 'children=', Array.from(runEl.childNodes).filter((n: any) => n.nodeType === 1).map((n: any) => n.localName));
  }

  const walk = (node: Node, props: TextProps) => {
    if (node.nodeType === 3) {
      pushText(runs, props, node.textContent ?? '');
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const local = el.localName;

    if (local === 't') {
      // <hp:t> 내부 텍스트 (자식 텍스트 노드)
      for (let i = 0; i < el.childNodes.length; i++) walk(el.childNodes[i], props);
      return;
    }
    if (local === 'lineBreak') {
      pushText(runs, props, ' ');
      return;
    }
    if (local === 'tab') {
      pushText(runs, props, '\t');
      return;
    }
    if (local === 'tbl' || local === 'secPr' || local === 'ctrl' || local === 'footNote' || local === 'endNote' || local === 'pic' || local === 'container' || local === 'equation' || local === 'ole' || local === 'compose') {
      // 문단 내부의 표/컨트롤은 별도 처리 대상(여기서는 텍스트 수집만 생략)
      // 단, hp:tbl이 run 안에 오는 경우 상위에서 처리할 수 있도록 무시
      return;
    }
    // 기타 컨테이너(run 내부 래퍼 등)는 재귀
    for (let i = 0; i < el.childNodes.length; i++) walk(el.childNodes[i], props);
  };

  for (let i = 0; i < runEl.childNodes.length; i++) walk(runEl.childNodes[i], base);
}

function parseParagraph(pEl: Element, ctx: Ctx): ParagraphNode {
  const paraPrId = attr(pEl, 'paraPrIDRef') || attr(pEl, 'paraPrRef');
  const paraProps = paraPrId ? (ctx.paraPrs.get(paraPrId) || {}) : {};
  const runs: TextRun[] = [];

  // hp:run 순회 (직접 자식 및 중첩 컨테이너 내 run 모두 수집하되 순서 보존)
  const collectRuns = (node: Element) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const c = node.childNodes[i];
      if (c.nodeType !== 1) continue;
      const el = c as Element;
      const local = el.localName;
      if (local === 'run') {
        parseRun(el, ctx, {}, runs);
      } else if (local === 'ctrl' || local === 'switch' || local === 'container' || local === 'subList') {
        // 컨테이너 내부의 run도 텍스트로 수집 (표 제외)
        collectRuns(el);
      } else if (local === 'tbl') {
        // 문단 내부 표는 상위에서 처리
      } else {
        // 기타 자식에서 run 탐색
        // (linesegarray 등은 무시)
        if (local !== 'linesegarray' && local !== 'lineSegArray') collectRuns(el);
      }
    }
  };
  collectRuns(pEl);

  const node: ParagraphNode = { type: 'paragraph', children: runs.length > 0 ? runs : [{ text: '' }] };
  if (paraProps.align) node.align = paraProps.align;
  if (paraProps.leftIndent !== undefined) node.leftIndent = paraProps.leftIndent;
  if (paraProps.textIndent !== undefined) node.textIndent = paraProps.textIndent;
  if (paraProps.indent !== undefined) node.indent = paraProps.indent;
  if (paraProps.lineSpacing !== undefined) node.lineSpacing = paraProps.lineSpacing;
  return node;
}

function parseCellParas(cell: Element, ctx: Ctx): TextRun[] {
  const children: TextRun[] = [];
  const subList = firstDesc(cell, 'subList') || cell;
  const paras: Element[] = [];
  const collect = (node: Element) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const c = node.childNodes[i];
      if (c.nodeType !== 1) continue;
      const el = c as Element;
      if (el.localName === 'p') paras.push(el);
      else collect(el);
    }
  };
  collect(subList);
  paras.forEach((p) => {
    const runs = parseParagraph(p, ctx).children;
    children.push(...runs);
  });
  return children.length > 0 ? children : [{ text: '' }];
}

function parseTable(tbl: Element, ctx: Ctx): TableNode {
  const rows: TableRowNode[] = [];
  const occupied: boolean[][] = [];

  const trEls = els(tbl, 'tr');
  trEls.forEach((tr, ri) => {
    const cells: TableCellNode[] = [];
    if (!occupied[ri]) occupied[ri] = [];
    let col = 0;
    const cellEls = els(tr, 'tc');

    cellEls.forEach((tc) => {
      while (occupied[ri][col]) {
        cells.push({ type: 'table-cell', children: [], merged: true });
        col += 1;
      }
      // span: <hp:cellSpan colSpan="n" rowSpan="n"/> 또는 tc 속성
      let colSpan = 1;
      let rowSpan = 1;
      const cellSpan = firstDesc(tc, 'cellSpan');
      if (cellSpan) {
        colSpan = parseInt(attr(cellSpan, 'colSpan') || '1', 10) || 1;
        rowSpan = parseInt(attr(cellSpan, 'rowSpan') || '1', 10) || 1;
      } else {
        colSpan = parseInt(attr(tc, 'colSpan') || '1', 10) || 1;
        rowSpan = parseInt(attr(tc, 'rowSpan') || '1', 10) || 1;
      }
      if (colSpan < 1) colSpan = 1;
      if (rowSpan < 1) rowSpan = 1;

      const children = parseCellParas(tc, ctx);
      const node: TableCellNode = { type: 'table-cell', children };
      if (colSpan > 1) node.colSpan = colSpan;
      if (rowSpan > 1) {
        node.rowSpan = rowSpan;
        for (let rr = ri + 1; rr < ri + rowSpan; rr++) {
          if (!occupied[rr]) occupied[rr] = [];
          for (let cc = col; cc < col + colSpan; cc++) occupied[rr][cc] = true;
        }
      }
      cells.push(node);
      col += colSpan;
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

function sectionBodyElements(sectionDoc: Document): Element[] {
  // <hs:sec><hs:subList>...</hs:subList></hs:sec> 또는 유사 구조
  const root = sectionDoc.documentElement;
  let container: Element | null = null;
  // sec 직속/하위의 subList
  const subLists = allDesc(root, 'subList');
  if (subLists.length > 0) container = subLists[0];
  else container = root;

  const out: Element[] = [];
  const pushFrom = (el: Element) => {
    for (let i = 0; i < el.childNodes.length; i++) {
      const c = el.childNodes[i];
      if (c.nodeType !== 1) continue;
      out.push(c as Element);
    }
  };
  pushFrom(container);
  return out;
}

function resolveSectionPaths(zip: JSZip): string[] {
  // content.hpf (OPF)에서 spine/manifest 기반 섹션 순서 추출, 실패 시 Contents/section*.xml 스캔
  const paths: string[] = [];
  const hpfMatches = (zip as any).file(/content\.hpf$/i);
  const hpf = (Array.isArray(hpfMatches) ? hpfMatches[0] : hpfMatches) || zip.file('Contents/content.hpf');
  console.log('[hwpx] content.hpf:', hpf ? ((hpf as any).name || 'found') : 'NOT FOUND');
  if (hpf) {
    try {
      const doc = parseXml(hpf.asText(), 'content.hpf');
      const root = doc.documentElement;
      const manifest = new Map<string, { href: string; mediaType: string }>(); // id -> {href, mediaType}
      allDesc(root, 'item').forEach((it) => {
        const id = attr(it, 'id');
        const href = attr(it, 'href');
        if (id && href) manifest.set(id, { href, mediaType: (attr(it, 'media-type') || '').toLowerCase() });
      });
      console.log('[hwpx] manifest items:', Array.from(manifest.entries()));
      const spineRefs = allDesc(root, 'itemref');
      console.log('[hwpx] spine itemrefs:', spineRefs.map((ir) => attr(ir, 'idref')));
      spineRefs.forEach((ir) => {
        const idref = attr(ir, 'idref');
        if (!idref) return;
        const meta = manifest.get(idref);
        if (!meta) return;
        const { href, mediaType } = meta;
        // header 등 비본문 항목 제외, section 본문만 포함
        const isSection =
          /section/i.test(idref) ||
          /section/i.test(href) ||
          mediaType.includes('section') ||
          mediaType.includes('xml+section');
        const isHeader = /header/i.test(idref) || /header/i.test(href) || mediaType.includes('header');
        if (!isSection || isHeader) {
          console.log('[hwpx] skip spine item (not section):', idref, href, mediaType);
          return;
        }
        // href는 content.hpf 기준 상대경로(보통 Contents/)
        const p = href.startsWith('Contents/') ? href : `Contents/${href}`;
        if (!paths.includes(p)) paths.push(p);
      });
    } catch (e) {
      console.warn('[hwpx] content.hpf parse failed', e);
      /* fallthrough */
    }
  }
  if (paths.length === 0) {
    // fallback: section XML 파일명 정렬
    (zip as any).forEach((relPath: string, file: any) => {
      if (file.dir) return;
      if (/^Contents\/section\d+\.xml$/i.test(relPath) || /section\d+\.xml$/i.test(relPath)) {
        if (!paths.includes(relPath)) paths.push(relPath);
      }
    });
    paths.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
  return paths;
}

function processBodyElement(el: Element, ctx: Ctx, model: DocumentModel) {
  const local = el.localName;
  if (local === 'p') {
    model.push(parseParagraph(el, ctx));
    // 문단(run) 안에 포함된 표도 추출
    const tbls = allDesc(el, 'tbl');
    tbls.forEach((t) => model.push(parseTable(t, ctx)));
  } else if (local === 'tbl') {
    model.push(parseTable(el, ctx));
  } else if (local === 'subList' || local === 'sec' || local === 'container' || local === 'switch') {
    // 컨테이너는 내부 요소를 재귀 처리
    for (let i = 0; i < el.childNodes.length; i++) {
      const c = el.childNodes[i];
      if (c.nodeType === 1) processBodyElement(c as Element, ctx, model);
    }
  } else {
    // 기타: 하위에서 p/tbl 탐색
    const children = els(el, 'p').concat(els(el, 'tbl'));
    if (children.length > 0) {
      for (let i = 0; i < el.childNodes.length; i++) {
        const c = el.childNodes[i];
        if (c.nodeType === 1) processBodyElement(c as Element, ctx, model);
      }
    }
  }
}

export function parseHwpxToDocumentModel(data: Uint8Array): DocumentModel {
  console.log('[hwpx] parse start, bytes=', data?.length ?? 0);
  const zip = new JSZip(data);

  // ZIP 내 파일 목록 디버그
  try {
    const names = Object.keys((zip as any).files || {});
    console.log('[hwpx] zip entries:', names);
  } catch (e) {
    console.warn('[hwpx] zip entry listing failed', e);
  }

  const ctx: Ctx = {
    paraPrs: new Map(),
    charPrs: new Map(),
    fontFaces: new Map(),
  };

  // header.xml (스타일/글꼴 정의)
  const headerMatches = (zip as any).file(/header\.xml$/i);
  const headerFile = (Array.isArray(headerMatches) ? headerMatches[0] : headerMatches) || zip.file('Contents/header.xml');
  console.log('[hwpx] header file:', headerFile ? ((headerFile as any).name || 'found') : 'NOT FOUND', 'matches=', Array.isArray(headerMatches) ? headerMatches.map((f: any) => (f as any)?.name) : (headerMatches as any)?.name);
  if (headerFile) {
    try {
      const headerXml = headerFile.asText();
      console.log('[hwpx] header.xml length=', headerXml.length, 'preview=', headerXml.slice(0, 300));
      collectHeader(ctx, parseXml(headerXml, 'header.xml'));
      console.log('[hwpx] header parsed: charPrs=', ctx.charPrs.size, 'paraPrs=', ctx.paraPrs.size, 'fontFaces=', ctx.fontFaces.size);
      console.log('[hwpx] charPr ids=', Array.from(ctx.charPrs.keys()).slice(0, 20));
      console.log('[hwpx] paraPr ids=', Array.from(ctx.paraPrs.keys()).slice(0, 20));
    } catch (e) {
      console.error('[hwpx] header parse failed', e);
      /* 헤더 파싱 실패 시 기본값으로 진행 */
    }
  }

  const sectionPaths = resolveSectionPaths(zip);
  console.log('[hwpx] resolved section paths:', sectionPaths);
  const model: DocumentModel = [];

  if (sectionPaths.length === 0) {
    console.error('[hwpx] no section paths found');
    throw new Error('HWPX 섹션(section*.xml)을 찾을 수 없습니다.');
  }

  sectionPaths.forEach((path) => {
    const f = zip.file(path) || zip.file(path.replace(/^Contents\//, ''));
    console.log('[hwpx] section file:', path, '->', f ? ((f as any).name || 'ok') : 'NOT FOUND');
    if (!f) return;
    let doc: Document;
    try {
      const xml = f.asText();
      console.log('[hwpx] section xml length=', xml.length, 'preview=', xml.slice(0, 300));
      doc = parseXml(xml, path);
    } catch (e) {
      console.error('[hwpx] section parse failed:', path, e);
      return;
    }
    const elems = sectionBodyElements(doc);
    console.log('[hwpx] section body elements:', path, 'count=', elems.length, 'names=', elems.map((e) => e.localName));
    // 구조 디버그: 상위 요소의 자식 구성 요약
    elems.slice(0, 3).forEach((el, i) => {
      const childNames = Array.from(el.childNodes).filter((n: any) => n.nodeType === 1).map((n: any) => (n as Element).localName);
      const textLen = (el.textContent || '').trim().length;
      console.log(`[hwpx] body[${i}] <${el.localName}> children=`, childNames.slice(0, 30), 'textLen=', textLen);
      // p인 경우 run/중첩 구조 상세
      if (el.localName === 'p') {
        const runs = allDesc(el, 'run').length;
        const tbls = allDesc(el, 'tbl').length;
        const ps = allDesc(el, 'p').length;
        console.log(`[hwpx] body[${i}] p stats: runs=${runs} nestedTbl=${tbls} nestedP=${ps}`);
      }
    });
    let paraCount = 0;
    let tableCount = 0;
    elems.forEach((el) => {
      const before = model.length;
      processBodyElement(el, ctx, model);
      const added = model.length - before;
      if (el.localName === 'p') paraCount += added;
      else if (el.localName === 'tbl') tableCount += added;
    });
    console.log('[hwpx] section processed:', path, 'parasAdded~=', paraCount, 'tablesAdded~=', tableCount, 'modelTotal=', model.length);
  });

  console.log('[hwpx] parse done, model items=', model.length, 'types=', model.map((m) => m.type));
  if (model.length > 0) {
    console.log('[hwpx] first item sample=', JSON.stringify(model[0]).slice(0, 500));
  }
  return model;
}
