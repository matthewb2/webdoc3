// src/dump.ts - /dump.html 엔트리: ?file= 또는 로컬 파일 덤프 렌더링
import { dumpHwp, type HwpDump } from './hwp/hwpDump';

const statusEl = document.getElementById('status') as HTMLDivElement;
const outEl = document.getElementById('out') as HTMLDivElement;
const fileNameEl = document.getElementById('file-name') as HTMLInputElement;
const fileInputEl = document.getElementById('file-input') as HTMLInputElement;

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(dump: HwpDump): void {
  const alignName = ['양쪽', '왼쪽', '오른쪽', '가운데'];
  let html = `<h2>파일: ${esc(dump.fileName)} (${dump.totalBytes}B)</h2>`;
  html += `<div class="meta">시그니처: ${esc(dump.signature)} / 버전: ${dump.version} / 압축: ${dump.compressed ? '예(디플레이트 해제됨)' : '아니오'} / encrypt: ${dump.encryptVersion}</div>`;

  html += '<h2>스트림</h2><table><tr><th>이름</th><th>raw</th><th>해제 후</th></tr>';
  dump.streams.forEach((s) => {
    html += `<tr><td>${esc(s.name)}</td><td>${s.rawSize}</td><td>${s.inflated ? s.inflatedSize : '-'}</td></tr>`;
  });
  html += '</table>';

  html += '<h2>DocInfo ID 매핑</h2><table><tr>';
  Object.keys(dump.idMap).forEach((k) => {
    html += `<th>${esc(k)}</th>`;
  });
  html += '</tr><tr>';
  Object.values(dump.idMap).forEach((v) => {
    html += `<td>${v}</td>`;
  });
  html += '</tr></table>';

  html += `<h2>글꼴 (${dump.fonts.length})</h2><pre>${esc(dump.fonts.join('\n'))}</pre>`;
  html += `<h2>문단모양 정렬 (${dump.paraShapeAligns.length})</h2><pre>${esc(dump.paraShapeAligns.map((a) => `${a}=${alignName[a] ?? '?'}`).join(', '))}</pre>`;
  html += `<div class="meta">글자모양 ${dump.charShapeCount}개 / 스타일 ${dump.styleCount}개</div>`;

  html += `<details><summary>DocInfo 레코드 ${dump.docRecords.length}개</summary><pre>${dump.docRecords.map((r) => `tag=${r.tag} ${r.tagName} lvl=${r.level} size=${r.size}`).join('\n')}</pre></details>`;

  dump.sections.forEach((sec) => {
    html += `<h2>Section${sec.index} - 문단 ${sec.paragraphs.length}개, 표 ${sec.tables.length}개</h2>`;
    html += '<table><tr><th>#</th><th>shapeId</th><th>텍스트</th><th>컨트롤</th></tr>';
    sec.paragraphs.forEach((p) => {
      const ctrl = [...p.ctrls, ...p.extendedControls.map((c) => `ext(${c})`)].join(' ');
      html += `<tr><td>${esc(p.index)}</td><td>${p.shapeId}</td><td>${esc(p.text.slice(0, 120))}${p.text.length > 120 ? '…' : ''}</td><td>${esc(ctrl)}</td></tr>`;
    });
    html += '</table>';
    sec.tables.forEach((t, ti) => {
      html += `<details><summary>표${ti} ${t.rows}×${t.cols}</summary><table><tr><th>셀</th><th>텍스트</th></tr>`;
      t.cells.forEach((c) => {
        const text = c.paragraphs.map((p) => p.text).join(' / ');
        html += `<tr><td>(${c.row},${c.col})</td><td>${esc(text.slice(0, 80))}</td></tr>`;
      });
      html += '</table></details>';
    });
    html += `<details><summary>Section${sec.index} 레코드 ${sec.records.length}개</summary><pre>${sec.records.map((r) => `tag=${r.tag} ${r.tagName} lvl=${r.level} size=${r.size}`).join('\n')}</pre></details>`;
  });

  if (dump.warnings.length > 0) {
    html += `<h2 class="warn">경고 ${dump.warnings.length}개</h2><pre class="warn">${esc(dump.warnings.join('\n'))}</pre>`;
  }

  const allText = dump.sections.map((s) => s.paragraphs.map((p) => p.text).join('\n')).join('\n');
  html += `<h2>전체 텍스트 (비교용 복사)</h2><textarea readonly>${esc(allText)}</textarea>`;
  outEl.innerHTML = html;
}

async function loadPublicFile(): Promise<void> {
  const name = fileNameEl.value.trim() || 'Sample.hwp';
  statusEl.textContent = `${name} 로딩 중...`;
  try {
    const res = await fetch(`/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    render(dumpHwp(name, buf));
    statusEl.textContent = `${name} 덤프 완료 (${buf.length}B)`;
    const url = new URL(location.href);
    url.searchParams.set('file', name);
    history.replaceState(null, '', url.toString());
  } catch (err) {
    statusEl.textContent = `실패: ${(err as Error).message}`;
  }
}

fileInputEl.addEventListener('change', async () => {
  const file = fileInputEl.files?.[0];
  if (!file) return;
  statusEl.textContent = `${file.name} 읽는 중...`;
  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    render(dumpHwp(file.name, buf));
    statusEl.textContent = `${file.name} 덤프 완료 (${buf.length}B)`;
  } catch (err) {
    statusEl.textContent = `실패: ${(err as Error).message}`;
  }
  fileInputEl.value = '';
});

document.getElementById('btn-load')?.addEventListener('click', () => {
  loadPublicFile().catch(() => {});
});

// ?file= 자동 로드
const initial = new URLSearchParams(location.search).get('file');
if (initial) {
  fileNameEl.value = initial;
  loadPublicFile().catch(() => {});
}
