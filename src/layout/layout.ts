// src/layout/layout.ts - 레이아웃 엔진 진입점 
import type { DocumentModel } from '../types';
import { runLayoutEngineAsync as scheduleLayoutEngineAsync } from './layoutScheduler';
import { hasFontMetrics } from './lineBreaker';

export type { PageModel } from './pagePaginator';
export { setDefaultLineSpacing } from './pagePaginator';
export { setFontMetrics, setBreaks, clearBreaks } from './lineBreaker';

console.log('[layout] boot, engine bytes:', runLayoutEngineAsync.toString().length);

export function runLayoutEngineAsync(
  documentState: DocumentModel,
  post: (message: any) => void,
  token: { cancelled: boolean },
): void {
  if (!hasFontMetrics()) return;
  scheduleLayoutEngineAsync(documentState, post, token);
}