// src/hwpx/hwpxExport.ts - 문서 모델(DocumentModel) → HWPX 저장
import JSZip from 'jszip';
import type { DocumentItem, DocumentModel, TableNode, TextRun } from '../types';

const PX_TO_PT = 72 / 96;
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pt = (px: number) => Math.round(px * PX_TO_PT * 100); // HWPX 단위: 1pt = 100

function toHexColor(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (m) {
    const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `${h(+m[1])}${h(+m[2])}${h(+m[3])}`.toUpperCase();
  }
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color.replace('#', '').toUpperCase();
  return undefined;
}

export function buildHwpxXml(model: DocumentModel): { headerXml: string; sectionXml: string } {
  const charPrs: string[] = [];
  const paraPrs: string[] = [];
  let charSeq = 0;
  let paraSeq = 0;

  const getCharPr = (run: Partial<TextRun>): number => {
    const height = run.fontSize ? pt(run.fontSize) : 1000; // 기본 10pt (1000)
    const color = toHexColor(run.color) || '000000';

    const id = charSeq++;
    charPrs.push(`<hh:charPr id="${id}" height="${height}" fontRef="0" spacing="0" ratio="100">
      <hh:fontStyle${run.bold ? ' bold="true"' : ''}${run.italic ? ' italic="true"' : ''}/>
      <hh:color value="${color}"/>
    </hh:charPr>`);
    return id;
  };

  const getParaPr = (align?: string, lineSpacing?: number): number => {
    const hwpAlign = align === 'center' ? 'CENTER' : align === 'right' ? 'RIGHT' : align === 'justify' ? 'JUSTIFY' : 'LEFT';
    const spacing = lineSpacing ? Math.round(lineSpacing) : 130;
    const id = paraSeq++;
    paraPrs.push(`<hh:paraPr id="${id}" align="${hwpAlign}" lineSpacing="${spacing}"/>`);
    return id;
  };

  // 기본 스타일 확보(인덱스 0)
  getCharPr({});
  getParaPr('left', 130);

  const paragraphsXml: string[] = [];

  model.forEach((item: DocumentItem) => {
    if (item.type === 'paragraph') {
      const pId = getParaPr((item as any).align, (item as any).lineSpacing);
      const runs = item.children && item.children.length > 0 ? item.children : [{ text: '' }];

      const runsXml = runs.map((run: TextRun) => {
        const cId = getCharPr(run);
        return `<hp:run charPrIDRef="${cId}"><hp:t>${esc(run.text || '')}</hp:t></hp:run>`;
      }).join('');

      paragraphsXml.push(`<hp:p id="0" paraPrIDRef="${pId}" styleIDRef="0">${runsXml}</hp:p>`);
    } else if (item.type === 'table') {
      const table = item as TableNode;
      if (table.rows.length === 0) return;

      const trsXml = table.rows.map((row) => {
        const cellsXml = row.cells.map((cell) => {
          if (cell.merged) return '';
          const textContent = cell.children ? cell.children.map((r) => r.text || '').join('') : '';
          return `<hp:tc><hp:subList><hp:p><hp:run><hp:t>${esc(textContent)}</hp:t></hp:run></hp:p></hp:subList></hp:tc>`;
        }).join('');
        return `<hp:tr>${cellsXml}</hp:tr>`;
      }).join('');

      paragraphsXml.push(`<hp:tbl rowCnt="${table.rows.length}" colCnt="${table.rows[0].cells.length}">${trsXml}</hp:tbl>`);
    }
  });

  const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:header xmlns:hh="http://www.hancom.co.kr/schema/2011/hwp_header" version="1.0">
  <hh:fontFaces itemCnt="1">
    <hh:fontFace id="0" lang="hangul" name="함초롬바탕"/>
  </hh:fontFaces>
  <hh:styles itemCnt="1">
    <hh:style id="0" name="Normal" type="para" engName="Normal" nextStyleId="0"/>
  </hh:styles>
  <hh:charProperties itemCnt="${charPrs.length}">
    ${charPrs.join('\n')}
  </hh:charProperties>
  <hh:paraProperties itemCnt="${paraPrs.length}">
    ${paraPrs.join('\n')}
  </hh:paraProperties>
</hh:header>`;

  const sectionXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hs:sec xmlns:hs="http://www.hancom.co.kr/schema/2011/hwp_section" xmlns:hp="http://www.hancom.co.kr/schema/2011/hwp_paragraph">
  <hs:subList id="0">
    ${paragraphsXml.join('\n')}
  </hs:subList>
</hs:sec>`;

  return { headerXml, sectionXml };
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

export async function buildHwpxBlob(worker: Worker): Promise<Blob> {
  const model = await requestDocSnapshot(worker);
  const { headerXml, sectionXml } = buildHwpxXml(model);

  const zip: any = new (JSZip as any)();
  zip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/>
  </rootfiles>
</container>`);

  zip.file('Contents/content.hpf', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<opf:package xmlns:opf="http://www.idpf.org/2007/opf" version="1.0" unique-identifier="bookid">
  <opf:manifest>
    <opf:item id="header" href="header.xml" media-type="application/hwpml-header+xml"/>
    <opf:item id="section0" href="section0.xml" media-type="application/hwpml-section+xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="section0" linear="yes"/>
  </opf:spine>
</opf:package>`);

  zip.file('Contents/header.xml', headerXml);
  zip.file('Contents/section0.xml', sectionXml);

  const outBuffer = zip.generate({ type: 'uint8array', compression: 'DEFLATE' }) as Uint8Array;
  return new Blob([outBuffer.buffer as ArrayBuffer], { type: 'application/vnd.hancom.hwpx' });
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
}

export async function saveCurrentHwpxDocument(
  worker: Worker,
  filename = 'document.hwpx',
  opts?: { saveAs?: boolean; handle?: FileSystemFileHandle | null },
): Promise<{ filename: string; handle: FileSystemFileHandle | null }> {
  const status = document.getElementById('hwp-status') as HTMLSpanElement | null;
  const saveAs = !!opts?.saveAs;
  try {
    if (status) status.textContent = saveAs ? '다른 이름으로 저장...' : 'HWPX 생성 중...';
    const blob = await buildHwpxBlob(worker);

    let handle = opts?.handle ?? null;
    if (saveAs) {
      if (typeof window.showSaveFilePicker === 'function') {
        handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'HWPX Document', accept: { 'application/vnd.hancom.hwpx': ['.hwpx'], 'application/hwp+zip': ['.hwpx'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        const outName = handle.name || filename;
        if (status) status.textContent = `HWPX 저장 완료: ${outName}`;
        return { filename: outName, handle };
      }
      downloadBlob(blob, filename);
      if (status) status.textContent = `HWPX 저장 완료: ${filename}`;
      return { filename, handle: null };
    }

    if (handle) {
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      const outName = handle.name || filename;
      if (status) status.textContent = `HWPX 저장 완료: ${outName}`;
      return { filename: outName, handle };
    }

    downloadBlob(blob, filename);
    if (status) status.textContent = `HWPX 저장 완료: ${filename}`;
    return { filename, handle: null };
  } catch (err) {
    if ((err as any)?.name === 'AbortError') {
      if (status) status.textContent = '저장이 취소되었습니다.';
      return { filename, handle: opts?.handle ?? null };
    }
    if (status) status.textContent = `HWPX 저장 실패: ${(err as Error).message}`;
    throw err;
  }
}
