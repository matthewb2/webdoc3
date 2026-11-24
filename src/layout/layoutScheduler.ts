// src/layout/layoutScheduler.ts
import type { DocumentModel } from '../types';
import { createLayoutState, finalizePages, layoutDocumentItem } from './pagePaginator';

const LAYOUT_CHUNK_ITEMS = 50;
const LAYOUT_CHUNK_BUDGET_MS = 12;

export function runLayoutEngineAsync(
  documentState: DocumentModel,
  post: (message: any) => void,
  token: { cancelled: boolean },
): void {
  const totalItems = documentState.length;
  const state = createLayoutState();
  let itemIndex = 0;
  let lastStreamCount = 0;
  let lastStreamTime = 0;

  function processChunk(): void {
    if (token.cancelled) return;

    const startTime = performance.now();
    let processed = 0;

    while (
      itemIndex < documentState.length &&
      processed < LAYOUT_CHUNK_ITEMS &&
      performance.now() - startTime < LAYOUT_CHUNK_BUDGET_MS
    ) {
      layoutDocumentItem(state, documentState[itemIndex], itemIndex);
      itemIndex += 1;
      processed += 1;
    }

    if (itemIndex < documentState.length) {
      post({ type: 'LAYOUT_PROGRESS', payload: { done: itemIndex, total: totalItems } });

      const now = performance.now();
      if (state.pages.length > lastStreamCount && now - lastStreamTime > 120) {
        lastStreamTime = now;
        const freshPages = state.pages.slice(lastStreamCount);
        lastStreamCount = state.pages.length;
        post({ type: 'RENDER_STREAM', payload: { pages: freshPages, done: itemIndex, total: totalItems } });
      }

      setTimeout(processChunk, 0);
    } else {
      const finalPages = finalizePages(state);
      post({ type: 'RENDER_READY', payload: finalPages });
    }
  }

  processChunk();
}