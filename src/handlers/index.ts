import type { CursorState } from '../types';
import { hasPendingInputState, initCompositionHandler, isComposingActive } from './composition';
import { initInputHandler } from './inputHandler';
import { initKeyHandler } from './keyHandler';
import { initPasteHandler } from './pasteHandler';
import { initTableSelectionHandler } from './tableSelection';
import { initTableResizeHandler } from './tableResize';
import { initTableDragHandler } from './tableDrag';

export { hasPendingInputState, isComposingActive };
export { initTableSelectionHandler, initTableResizeHandler, initTableDragHandler };

export function initEditorListeners(
  container: HTMLDivElement,
  worker: Worker,
  cursor: CursorState,
  saveCursorPosition: () => void,
  _onCompositionEnd: () => void,
  _onCompositionEditPosted: () => void,
) {
  void _onCompositionEditPosted;

  // 1. 일반 텍스트 및 IME 핸들러
  initCompositionHandler(container, worker, cursor, _onCompositionEnd);
  initKeyHandler(container);
  initPasteHandler(container, worker, cursor, saveCursorPosition);
  initInputHandler(container, worker, cursor, saveCursorPosition);
}

export function initTableHandlers(container: HTMLDivElement, worker: Worker) {
  initTableSelectionHandler(container, worker);
}
