// src/hwpx/hwpxExport.ts - 문서 모델(DocumentModel) → HWPX(XML) 저장
import JSZip from 'jszip';
import type { DocumentItem, DocumentModel, TableNode, TextRun } from '../types';
import { TEMPLATE_HEADER_XML } from './hwpxTemplate';

const esc = (t: string) =>
  (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SECTION_NS =
  'xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" ' +
  'xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" ' +
  'xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph" ' +
  'xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" ' +
  'xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core" ' +
  'xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" ' +
  'xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history" ' +
  'xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page" ' +
  'xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf" ' +
  'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
  'xmlns:opf="http://www.idpf.org/2007/opf/" ' +
  'xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart" ' +
  'xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar" ' +
  'xmlns:epub="http://www.idpf.org/2007/ops" ' +
  'xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0"';

// secPr block copied from a known-good HWPX (HWP2016) for a valid first paragraph.
const FIRST_SECPR = `<hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" tabStopVal="4000" tabStopUnit="HWPUNIT" outlineShapeIDRef="1" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0"><hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/><hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/><hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/><hp:lineNumberShape restartType="0" countBy="0" distance="0" startNumber="0"/><hp:pagePr landscape="WIDELY" width="59528" height="84188" gutterType="LEFT_ONLY"><hp:margin header="4252" footer="4252" gutter="0" left="8504" right="8504" top="5668" bottom="4252"/></hp:pagePr><hp:footNotePr><hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/><hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/><hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/><hp:numbering type="CONTINUOUS" newNum="1"/><hp:placement place="EACH_COLUMN" beneathText="0"/></hp:footNotePr><hp:endNotePr><hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/><hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/><hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/><hp:numbering type="CONTINUOUS" newNum="1"/><hp:placement place="END_OF_DOCUMENT" beneathText="0"/></hp:endNotePr><hp:pageBorderFill type="BOTH" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER"><hp:offset left="1417" right="1417" top="1417" bottom="1417"/></hp:pageBorderFill><hp:pageBorderFill type="EVEN" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER"><hp:offset left="1417" right="1417" top="1417" bottom="1417"/></hp:pageBorderFill><hp:pageBorderFill type="ODD" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER"><hp:offset left="1417" right="1417" top="1417" bottom="1417"/></hp:pageBorderFill></hp:secPr><hp:ctrl><hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="1" sameSz="1" sameGap="0"/></hp:ctrl>`;

function paragraphText(item: { children?: TextRun[] } | null | undefined): string {
  return (item?.children || []).map((r) => r?.text || '').join('');
}

function makeParagraphXml(text: string, isFirst: boolean, vertpos: number): string {
  const id = isFirst ? '2873897412' : '0';
  const prefix = isFirst ? FIRST_SECPR : '';
  const lineseg = `<hp:linesegarray><hp:lineseg textpos="0" vertpos="${vertpos}" vertsize="1000" textheight="1000" baseline="850" spacing="600" horzpos="0" horzsize="42520" flags="393216"/></hp:linesegarray>`;
  return `<hp:p id="${id}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0">${prefix}<hp:t>${esc(text)}</hp:t></hp:run>${lineseg}</hp:p>`;
}

function modelToParagraphTexts(model: DocumentModel): string[] {
  const out: string[] = [];
  (model || []).forEach((item: DocumentItem) => {
    if (item.type === 'paragraph') {
      out.push(paragraphText(item));
    } else if (item.type === 'table') {
      const table = item as TableNode;
      (table.rows || []).forEach((row) => {
        (row.cells || []).forEach((cell) => {
          if ((cell as any).merged) return;
          out.push(paragraphText(cell as any));
        });
      });
    }
  });
  if (out.length === 0) out.push('');
  return out;
}

export function buildSectionXml(model: DocumentModel): string {
  const texts = modelToParagraphTexts(model);
  console.log('[hwpx-save] section paragraphs=', texts.length);
  let vert = 0;
  const paras = texts.map((t, i) => {
    const xml = makeParagraphXml(t, i === 0, vert);
    vert += 1600;
    return xml;
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><hs:sec ${SECTION_NS}>${paras.join('')}</hs:sec>`;
}

function buildContentHpf(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><opf:package xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph" xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core" xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history" xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf/" xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart" xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0" version="" unique-identifier="" id=""><opf:metadata><opf:title></opf:title><opf:language>ko</opf:language></opf:metadata><opf:manifest><opf:item id="header" href="Contents/header.xml" media-type="application/xml"/><opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/><opf:item id="settings" href="settings.xml" media-type="application/xml"/></opf:manifest><opf:spine><opf:itemref idref="header"/><opf:itemref idref="section0" linear="yes"/></opf:spine></opf:package>`;
}

function buildContainerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf"><ocf:rootfiles><ocf:rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/></ocf:rootfiles></ocf:container>`;
}

function buildVersionXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><hv:HCFVersion xmlns:hv="http://www.hancom.co.kr/hwpml/2011/version" tagetApplication="WORDPROCESSOR" major="5" minor="0" micro="5" buildNumber="0" os="1" xmlVersion="1.4" application="Hancom Office Hangul" appVersion="9, 6, 1, 10418 WIN32LEWindows_Unknown_Version"/>`;
}

function buildSettingsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><ha:HWPApplicationSetting xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0"><ha:CaretPosition listIDRef="0" paraIDRef="0" pos="0"/></ha:HWPApplicationSetting>`;
}

function buildManifestXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"/>`;
}

function requestDocSnapshot(worker: Worker): Promise<DocumentModel> {
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'DOC_SNAPSHOT') {
        worker.removeEventListener('message', handler);
        console.log('[hwpx-save] DOC_SNAPSHOT received, items=', Array.isArray(event.data.payload) ? event.data.payload.length : 'n/a');
        resolve(event.data.payload as DocumentModel);
      }
    };
    worker.addEventListener('message', handler);
    console.log('[hwpx-save] requesting DOC_SNAPSHOT');
    worker.postMessage({ type: 'GET_DOC' });
  });
}

export async function buildHwpxBlob(worker: Worker): Promise<Blob> {
  console.log('[hwpx-save] buildHwpxBlob start');
  const model = await requestDocSnapshot(worker);
  console.log('[hwpx-save] model types=', (model || []).map((m) => m.type));
  try {
    console.log('[hwpx-save] model sample=', JSON.stringify((model || []).slice(0, 3)).slice(0, 1200));
  } catch (e) {
    console.warn('[hwpx-save] model sample stringify failed', e);
  }

  const headerXml = TEMPLATE_HEADER_XML;
  const sectionXml = buildSectionXml(model);
  const versionXml = buildVersionXml();
  const settingsXml = buildSettingsXml();
  const containerXml = buildContainerXml();
  const contentHpf = buildContentHpf();
  const manifestXml = buildManifestXml();

  console.log('[hwpx-save] header.xml length=', headerXml.length, 'preview=', headerXml.slice(0, 300));
  console.log('[hwpx-save] section.xml length=', sectionXml.length, 'preview=', sectionXml.slice(0, 1200));
  console.log('[hwpx-save] version.xml length=', versionXml.length, 'preview=', versionXml);
  console.log('[hwpx-save] settings.xml length=', settingsXml.length, 'preview=', settingsXml);
  console.log('[hwpx-save] container.xml length=', containerXml.length, 'preview=', containerXml);
  console.log('[hwpx-save] content.hpf length=', contentHpf.length, 'preview=', contentHpf);
  console.log('[hwpx-save] META-INF/manifest.xml length=', manifestXml.length, 'preview=', manifestXml);

  const zip: any = new (JSZip as any)();
  // mimetype must be first and stored uncompressed for OCF-based packages
  zip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });
  zip.file('version.xml', versionXml);
  zip.file('META-INF/container.xml', containerXml);
  zip.file('META-INF/manifest.xml', manifestXml);
  zip.file('Contents/content.hpf', contentHpf);
  zip.file('Contents/header.xml', headerXml);
  zip.file('Contents/section0.xml', sectionXml);
  zip.file('settings.xml', settingsXml);

  try {
    const files = Object.keys((zip as any).files || {});
    console.log('[hwpx-save] zip entries=', files);
    files.forEach((name) => {
      const f = (zip as any).files[name];
      console.log('[hwpx-save] zip entry meta:', name, { dir: !!f?.dir, options: f?.options });
    });
  } catch (e) {
    console.warn('[hwpx-save] zip entry inspect failed', e);
  }

  const outBuffer = zip.generate({ type: 'uint8array', compression: 'DEFLATE' }) as Uint8Array;
  console.log('[hwpx-save] outBuffer bytes=', outBuffer?.length ?? 0);
  try {
    const head = Array.from(outBuffer.slice(0, 16)).map((b) => b.toString(16).padStart(2, '0')).join(' ');
    const ascii = String.fromCharCode(...Array.from(outBuffer.slice(0, 32)));
    console.log('[hwpx-save] out head hex=', head, 'ascii=', JSON.stringify(ascii));
  } catch (e) {
    console.warn('[hwpx-save] out head inspect failed', e);
  }

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
  console.log('[hwpx-save] saveCurrentHwpxDocument called', { filename, saveAs, hasHandle: !!opts?.handle });
  try {
    if (status) status.textContent = saveAs ? '다른 이름으로 저장...' : 'HWPX 생성 중...';
    const blob = await buildHwpxBlob(worker);
    console.log('[hwpx-save] blob ready', { size: blob.size, type: blob.type, filename });

    let handle = opts?.handle ?? null;
    if (saveAs) {
      if (typeof window.showSaveFilePicker === 'function') {
        console.log('[hwpx-save] using showSaveFilePicker');
        handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'HWPX Document', accept: { 'application/vnd.hancom.hwpx': ['.hwpx'], 'application/hwp+zip': ['.hwpx'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        const outName = handle.name || filename;
        console.log('[hwpx-save] saved via file handle', { outName });
        if (status) status.textContent = `HWPX 저장 완료: ${outName}`;
        return { filename: outName, handle };
      }
      console.log('[hwpx-save] saveAs fallback download');
      downloadBlob(blob, filename);
      if (status) status.textContent = `HWPX 저장 완료: ${filename}`;
      return { filename, handle: null };
    }

    if (handle) {
      console.log('[hwpx-save] overwriting existing handle');
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      const outName = handle.name || filename;
      console.log('[hwpx-save] overwrite complete', { outName });
      if (status) status.textContent = `HWPX 저장 완료: ${outName}`;
      return { filename: outName, handle };
    }

    console.log('[hwpx-save] download fallback (no handle)');
    downloadBlob(blob, filename);
    if (status) status.textContent = `HWPX 저장 완료: ${filename}`;
    return { filename, handle: null };
  } catch (err) {
    console.error('[hwpx-save] save failed', err);
    if ((err as any)?.name === 'AbortError') {
      if (status) status.textContent = '저장이 취소되었습니다.';
      return { filename, handle: opts?.handle ?? null };
    }
    if (status) status.textContent = `HWPX 저장 실패: ${(err as Error).message}`;
    throw err;
  }
}

// Keep a simple XML builder export for debugging/compat
export function buildHwpxXml(model: DocumentModel): { headerXml: string; sectionXml: string } {
  return { headerXml: TEMPLATE_HEADER_XML, sectionXml: buildSectionXml(model) };
}
