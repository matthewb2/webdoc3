import { parseHwpToDocumentModel } from '../fmt/hwp/hwpParser';
import { parseDocxToDocumentModel } from '../fmt/docx/docxParser';
import { parseOdtToDocumentModel } from '../fmt/odt/odtParser';
import { parseHwpxToDocumentModel } from '../fmt/hwpx/hwpxParser';
import { resolveModelFonts } from '../utils/fontRegistry';
import { collectProbeItems, computeBreaks } from '../probe';
import { clearCellSelection } from './tableSelection';
import {
  addRecentFileEntry,
  setCurrentFileHandle,
  setCurrentFileName,
  setCurrentFilePath,
  syncRecentFilesMenu,
} from '../initUI';

async function loadDocumentFile(
  file: File,
  handle: FileSystemFileHandle | null,
  worker: Worker,
  containerEl: HTMLDivElement,
  filePath?: string | null,
) {
  const hwpStatus = document.getElementById('hwp-status') as HTMLSpanElement | null;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const kind =
    ext === 'hwpx'
      ? 'hwpx'
      : ext === 'hwp'
        ? 'hwp'
        : ext === 'docx'
          ? 'docx'
          : ext === 'odt'
            ? 'odt'
            : 'unknown';
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const model =
      kind === 'hwpx'
        ? parseHwpxToDocumentModel(bytes)
        : kind === 'hwp'
          ? parseHwpToDocumentModel(bytes)
          : kind === 'docx'
            ? parseDocxToDocumentModel(bytes)
            : parseOdtToDocumentModel(bytes);
    resolveModelFonts(model);
    worker.postMessage({ type: 'BREAKS', payload: await computeBreaks(collectProbeItems(model)) });
    worker.postMessage({ type: 'INIT_DOC', payload: model });
    containerEl.style.display = '';
    setCurrentFileHandle(handle);
    setCurrentFileName(file.name);
    const resolvedPath = filePath || (file as any).path || null;
    setCurrentFilePath(resolvedPath);
    await addRecentFileEntry(file.name, resolvedPath);
    void syncRecentFilesMenu();
    clearCellSelection(containerEl);
    if (hwpStatus) hwpStatus.textContent = `파싱 완료: ${file.name} (${model.length}개 항목)`;
  } catch (err) {
    console.error('[open] parse/load failed', err);
    if ((err as any)?.name === 'AbortError') return;
    if (hwpStatus) hwpStatus.textContent = `파싱 실패: ${(err as Error).message}`;
  }
}

export function initFileOpen(worker: Worker, containerEl: HTMLDivElement) {
  const openFileButton = document.getElementById('btn-open-file') as HTMLButtonElement;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const editorViewport = document.querySelector('.editor-viewport') as HTMLDivElement;

  openFileButton.addEventListener('click', async () => {
    if (typeof window.showOpenFilePicker === 'function') {
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: '문서',
              accept: {
                'application/x-hwp': ['.hwp'],
                'application/hwp+zip': ['.hwpx'],
                'application/vnd.hancom.hwpx': ['.hwpx'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.oasis.opendocument.text': ['.odt'],
              },
            },
          ],
        });
        if (handle) {
          const file = await handle.getFile();
          await loadDocumentFile(file, handle, worker, containerEl);
        }
        return;
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
      }
    }
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) void loadDocumentFile(file, null, worker, containerEl);
    fileInput.value = '';
  });

  let dragDepth = 0;
  editorViewport.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragDepth += 1;
    editorViewport.classList.add('is-dragging');
  });
  editorViewport.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  });
  editorViewport.addEventListener('dragleave', () => {
    dragDepth -= 1;
    if (dragDepth <= 0) {
      dragDepth = 0;
      editorViewport.classList.remove('is-dragging');
    }
  });
  editorViewport.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDepth = 0;
    editorViewport.classList.remove('is-dragging');
    const files = Array.from(e.dataTransfer?.files ?? []);
    const file = files.find((f) => /\.(hwp|hwpx|docx|odt)$/i.test(f.name));
    if (file) void loadDocumentFile(file, null, worker, containerEl);
  });
}