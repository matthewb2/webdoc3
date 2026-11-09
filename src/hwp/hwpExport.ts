// src/hwp/hwpExport.ts - 문서 모델(DocumentModel) → HWP 저장·다운로드
import type { DocumentModel } from '../types';
import { HwpWriter } from './hwpWriter';

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

export async function buildHwpBlob(worker: Worker): Promise<Blob> {
  const model = await requestDocSnapshot(worker);
  const bytes = new HwpWriter(model).write();
  return new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/x-hwp' });
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

export async function saveCurrentDocumentHwp(
  worker: Worker,
  filename = 'document.hwp',
  opts?: { saveAs?: boolean; handle?: FileSystemFileHandle | null },
): Promise<{ filename: string; handle: FileSystemFileHandle | null }> {
  const status = document.getElementById('hwp-status') as HTMLSpanElement | null;
  const saveAs = !!opts?.saveAs;
  try {
    if (status) status.textContent = saveAs ? '다른 이름으로 저장...' : 'HWP 생성 중...';
    const blob = await buildHwpBlob(worker);

    let handle = opts?.handle ?? null;
    if (saveAs) {
      if (typeof window.showSaveFilePicker === 'function') {
        handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'Hanword Document', accept: { 'application/x-hwp': ['.hwp'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        const outName = handle.name || filename;
        if (status) status.textContent = `HWP 저장 완료: ${outName}`;
        return { filename: outName, handle };
      }
      downloadBlob(blob, filename);
      if (status) status.textContent = `HWP 저장 완료: ${filename}`;
      return { filename, handle: null };
    }

    if (handle) {
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      const outName = handle.name || filename;
      if (status) status.textContent = `HWP 저장 완료: ${outName}`;
      return { filename: outName, handle };
    }

    downloadBlob(blob, filename);
    if (status) status.textContent = `HWP 저장 완료: ${filename}`;
    return { filename, handle: null };
  } catch (err) {
    if ((err as any)?.name === 'AbortError') {
      if (status) status.textContent = '저장이 취소되었습니다.';
      return { filename, handle: opts?.handle ?? null };
    }
    if (status) status.textContent = `HWP 저장 실패: ${(err as Error).message}`;
    throw err;
  }
}
