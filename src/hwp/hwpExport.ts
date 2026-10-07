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

export async function saveCurrentDocumentHwp(worker: Worker, filename = 'document.hwp'): Promise<void> {
  const status = document.getElementById('hwp-status') as HTMLSpanElement | null;
  try {
    if (status) status.textContent = 'HWP 생성 중...';
    const model = await requestDocSnapshot(worker);
    const bytes = new HwpWriter(model).write();
    const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/x-hwp' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
    if (status) status.textContent = `HWP 저장 완료: ${filename}`;
  } catch (err) {
    if (status) status.textContent = `HWP 저장 실패: ${(err as Error).message}`;
    throw err;
  }
}

