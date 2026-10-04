// src/odtExport.ts - 문서 모델(DocumentModel) → ODT 저장 (codexa/odt.js 벤더 번들 사용)
import type { DocumentItem, DocumentModel, TableNode, TextRun } from '../types';

const PX_TO_CM = 2.54 / 96;
const PX_TO_PT = 72 / 96;

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cm = (px: number) => `${Math.round(px * PX_TO_CM * 1000) / 1000}cm`;
const pt = (px: number) => `${Math.round(px * PX_TO_PT * 100) / 100}pt`;

function toHexColor(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (m) {
    const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `#${h(+m[1])}${h(+m[2])}${h(+m[3])}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  return undefined;
}

// 연속 공백(2개 이상)은 ODT text:s 로 보존 (앞 1칸 + 나머지)
function odtText(text: string): string {
  const t = text.replace(/\t/g, '    ');
  return esc(t).replace(/ {2,}/g, (m) => ` <text:s text:c="${m.length - 1}"></text:s>`);
}

function runStyleKey(run: TextRun): string {
  return [run.bold ? 1 : 0, run.italic ? 1 : 0, run.underline ? 1 : 0, run.strike ? 1 : 0, run.fontSize ?? '', run.color ?? '', run.fontFamily ?? ''].join('|');
}

function textStyleProps(run: TextRun): string {
  const props: string[] = [];
  if (run.bold) props.push('fo:font-weight="bold"');
  if (run.italic) props.push('fo:font-style="italic"');
  if (run.underline) props.push('style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"');
  if (run.strike) props.push('style:text-line-through-type="single"');
  if (run.fontSize) props.push(`fo:font-size="${pt(run.fontSize)}"`);
  const color = toHexColor(run.color);
  if (color) props.push(`fo:color="${color}"`);
  if (run.fontFamily) props.push(`style:font-name="${esc(run.fontFamily)}"`);
  return props.join(' ');
}

export function buildOdtHtml(model: DocumentModel): string {
  const pStyles = new Map<string, string>();
  const tStyles = new Map<string, string>();
  const colStyles = new Map<string, string>();
  const fontFaces = new Set<string>();
  let pSeq = 0;
  let tSeq = 0;
  let colSeq = 0;

  const paraStyle = (align: string | undefined): string => {
    const key = align ?? '';
    let name = pStyles.get(key);
    if (!name) {
      name = `P${pSeq++}`;
      const props = align && align !== 'left' ? `<style:paragraph-properties fo:text-align="${align}"/>` : '';
      pStyles.set(key, name);
      pStyles.set(`__def__${name}`, props);
    }
    return name;
  };

  const textStyle = (run: TextRun): string => {
    const key = runStyleKey(run);
    let name = tStyles.get(key);
    if (!name) {
      name = `T${tSeq++}`;
      const props = textStyleProps(run);
      tStyles.set(key, name);
      tStyles.set(`__def__${name}`, props);
      if (run.fontFamily) fontFaces.add(run.fontFamily);
    }
    return name;
  };

  const colStyle = (widthPx: number): string => {
    const key = `${Math.round(widthPx * 100) / 100}`;
    let name = colStyles.get(key);
    if (!name) {
      name = `CW${colSeq++}`;
      colStyles.set(key, name);
      colStyles.set(`__def__${name}`, cm(widthPx));
    }
    return name;
  };

  const CELL_STYLE = 'C0';
  const renderRuns = (runs: TextRun[]): string => {
    if (runs.length === 0) return '';
    return runs.map((run) => {
      if (!run.text) return '';
      return `<span class="${textStyle(run)}">${odtText(run.text)}</span>`;
    }).join('');
  };

  const renderPara = (children: TextRun[], align: string | undefined): string => {
    const body = renderRuns(children);
    if (!body) return `<p class="${paraStyle(align)}"></p>`;
    return `<p class="${paraStyle(align)}">${body}</p>`;
  };

  const bodyParts: string[] = [];
  let hasContent = false;
  model.forEach((item: DocumentItem) => {
    if (item.type === 'paragraph') {
      hasContent = true;
      bodyParts.push(renderPara(item.children || [], (item as any).align));
    } else if (item.type === 'table') {
      const table = item as TableNode;
      if (table.rows.length === 0) return;
      hasContent = true;
      const maxCols = Math.max(...table.rows.map((r) => r.cells.length));
      const colW = 599 / maxCols;
      const cols = Array.from({ length: maxCols }, () => `<col class="${colStyle(colW)}"></col>`).join('');
      const trs = table.rows.map((row) => {
        const cells = row.cells.map((cell) => `<td class="${CELL_STYLE}"><p class="${paraStyle(undefined)}">${renderRuns(cell.children || [])}</p></td>`);
        for (let i = row.cells.length; i < maxCols; i++) {
          cells.push(`<td class="${CELL_STYLE}"><p class="${paraStyle(undefined)}"></p></td>`);
        }
        return `<tr>${cells.join('')}</tr>`;
      }).join('');
      bodyParts.push(`<table>${cols}${trs}</table>`);
    }
  });
  if (!hasContent) {
    bodyParts.push(`<p class="${paraStyle(undefined)}"></p>`);
  }

  const styleDefs: string[] = [];
  pStyles.forEach((name, key) => {
    if (key.startsWith('__def__')) return;
    const props = pStyles.get(`__def__${name}`) ?? '';
    styleDefs.push(props
      ? `<style:style style:name="${name}" style:family="paragraph">${props}</style:style>`
      : `<style:style style:name="${name}" style:family="paragraph"/>`);
  });
  tStyles.forEach((name, key) => {
    if (key.startsWith('__def__')) return;
    const props = tStyles.get(`__def__${name}`) ?? '';
    styleDefs.push(props
      ? `<style:style style:name="${name}" style:family="text">${props}</style:style>`
      : `<style:style style:name="${name}" style:family="text"/>`);
  });
  colStyles.forEach((name, key) => {
    if (key.startsWith('__def__')) return;
    const width = colStyles.get(`__def__${name}`) ?? '';
    styleDefs.push(`<style:style style:name="${name}" style:family="table-column"><style:table-column-properties style:column-width="${width}"/></style:style>`);
  });
  // 셀 공통 스타일: 테두리 + 패딩 (에디터 렌더와 동일 규격)
  styleDefs.push(`<style:style style:name="${CELL_STYLE}" style:family="table-cell"><style:table-cell-properties fo:padding="0.185cm 0.212cm 0.185cm 0.212cm" fo:border="0.5pt solid #b0b4b8"/></style:style>`);
  const faces = Array.from(fontFaces).map((f) => `<style:font-face style:name="${esc(f)}" svg:font-family="${esc(f)}"/>`).join('');

  return `<html xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:fo:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg:1.0"><head><style data-type="fonts">/*${faces}*/</style><style>/*${styleDefs.join('')}*/</style></head><body _child_attrs="" _children_before="" _children_after="">${bodyParts.join('')}</body></html>`;
}

function requestDocSnapshot(worker: Worker): Promise<DocumentModel> {
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'DOC_SNAPSHOT') {
        worker.removeEventListener('message', handler);
        resolve(event.data.payload as DocumentModel);
      }
    };
    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'GET_DOC' });
  });
}

export async function saveCurrentDocument(worker: Worker, filename = 'document.odt'): Promise<void> {
  const status = document.getElementById('hwp-status') as HTMLSpanElement | null;
  try {
    if (status) status.textContent = 'ODT 생성 중...';
    const model = await requestDocSnapshot(worker);
    const html = buildOdtHtml(model);
    const tplBuf = await (await fetch('/odt/empty.odt')).arrayBuffer();
    const doc = new ODTDocument(tplBuf);
    doc.setHTMLUnsafe(html);
    const out = doc.getODT({ type: 'uint8array', compression: 'DEFLATE' }) as Uint8Array;
    const blob = new Blob([out.slice().buffer as ArrayBuffer], { type: 'application/vnd.oasis.opendocument.text' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
    if (status) status.textContent = `ODT 저장 완료: ${filename}`;
  } catch (err) {
    if (status) status.textContent = `ODT 저장 실패: ${(err as Error).message}`;
    throw err;
  }
}
