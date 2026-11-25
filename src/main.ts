import './css/main.css';
import './css/ribbon.css';
import './css/preview.css';
import './css/ruler.css';
import type { CursorState, FontMetrics } from './types';
import type { PageModel } from './layout/layout';
import { defaultFontFamily, defaultUiFontFamily, initSettings, loadSettings } from './settings';
import { setPageMargins } from './layout/layoutConstants';
import { collectProbeItems, computeBreaks } from './probe';
import { appendStreamPages, getCachedPages, initRenderer, renderVirtualPages, updateVisiblePages } from './renderHtml';
import { activateRibbonTab, clearPendingSelection, initAlignCombo, initColorControls, initColumnCombo, initFindReplace, initFontCombos, initFileOpen, initLineSpacingCombo, initNewDocument, initPageMargins, initRecentFiles, initRibbonTabs, initSave, initSaveAs, initSelectionListener, initShapeInsert, initTableInsert, initTableProperties, initViewOptions, initViewportScrollListener, initWorkerListener, initZoomControls, refreshFontFamilyList, refreshZoomLayout, setAwaitingRender, setCurrentFileName, syncAlignCombo, syncColorControls, syncColumnCombo, syncFontCombos, syncLineSpacingCombo, syncTablePropertiesRibbon } from './initUI';
import { initSpellcheckListeners } from './spellcheck';
import { syncStyleButtons,  initStyleButtons, initParagraphStyles } from './handlers/styleButtonsHandler';
import { initEditorListeners, isComposingActive, hasPendingInputState } from './handlers/index';
import { initTableSelectionHandler, paintCellSelection } from './handlers/tableSelection';
import { initAiChat } from './chat';
import { initPreviewMode } from './preview';
import { initRulerHandler } from './handlers/rulerHandler';
import { createAppUI } from './ui';
import { createEditorCore, parseDocumentBytes } from './core/documentCore';
import { applyFavicon, hideStartupSpinner, showStartupSpinner } from './startup';
import { createCursorState, restoreCursorPosition, saveCursorPosition } from './cursorManager';
import { initFontRegistry, resolveModelFonts } from './utils/fontRegistry';

// Shell(UI) bootstrap
createAppUI();
applyFavicon();

// Core(document) session
const core = createEditorCore();
const worker = core.engine as unknown as Worker;

const containerEl = document.getElementById('editor-container') as HTMLDivElement;
const savedCursor: CursorState = createCursorState();

showStartupSpinner(containerEl);

// 브라우저 환경 전용: 폰트 메트릭 측정 (shell responsibility)
function generateFontMetrics(fontStyle: string): FontMetrics {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return {};

  ctx.font = fontStyle;
  const metrics: FontMetrics = {};

  const ascii = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
  for (let i = 0; i < ascii.length; i++) {
    metrics[ascii[i]] = ctx.measureText(ascii[i]).width;
  }

  const defaultKoreanWidth = ctx.measureText('가').width;
  metrics['default_ko'] = defaultKoreanWidth;
  return metrics;
}

async function initWordProcessor() {
  await initSettings();
  await initFontRegistry();
  refreshFontFamilyList();
  const settings = loadSettings();
  setPageMargins(settings.pageMargins);
  const docFont = defaultFontFamily();
  const docFontStack = /바탕|batang/i.test(docFont) ? '"Batang", "바탕"' : `"${docFont}", "Batang"`;
  document.documentElement.style.setProperty('--doc-font', docFontStack);
  const uiFont = defaultUiFontFamily();
  const uiFontStack = /맑은\s*고딕|malgun/i.test(uiFont) ? '"Malgun Gothic", "맑은 고딕"' : `"${uiFont}", "Malgun Gothic"`;
  document.documentElement.style.setProperty('--ui-font', uiFontStack);

  core.initSettings({
    charShape: settings.charShape,
    lineSpacing: settings.paraShape.lineSpacing,
    pageMargins: settings.pageMargins,
  });
  core.initMetrics(generateFontMetrics(`16px ${docFontStack}, Arial`));

  const computeBreaksForModel = async (model: any) => computeBreaks(collectProbeItems(model));

  const openNew = new URLSearchParams(window.location.search).get('new') === '1';
  if (openNew) {
    await core.newBlankDocument(computeBreaksForModel);
    setCurrentFileName('제목 없음.odt');
    return;
  }

  const defaultDocName = 'cellmerge.hwpx';
  const defaultDocUrl = encodeURI(`./${defaultDocName}`);
  try {
    const res = await fetch(defaultDocUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const model = await parseDocumentBytes(bytes, defaultDocName);
    resolveModelFonts(model);
    await core.loadModel(model, computeBreaksForModel);
    setCurrentFileName(defaultDocName);
  } catch (err: any) {
    console.warn(`기본 문서 로드 실패, 더미 표시: ${err?.message ?? String(err)}`);
    const mockModel = core.getMockDocument();
    await core.loadModel(mockModel, computeBreaksForModel);
  }
}

const viewportEl = document.querySelector('.editor-viewport') as HTMLDivElement | null;
if (viewportEl) {
  initRulerHandler(worker);
  viewportEl.addEventListener('mousedown', (e: MouseEvent) => {
    const target = e.target as Element | null;
    if (target && !target.closest('.page')) {
      activateRibbonTab('file');
    }
  });
} else {
  document.addEventListener('DOMContentLoaded', () => initRulerHandler(worker), { once: true });
}

initRenderer(containerEl);
initWordProcessor();
initRibbonTabs();
initPageMargins(worker);
initRecentFiles(worker, containerEl);
initViewOptions();
initFindReplace(worker, savedCursor, containerEl);
initNewDocument(containerEl, worker, savedCursor);
initFileOpen(worker, containerEl);

let pendingPages: PageModel[] | null = null;
function logFontDebug() {}

function updateCursorPage() {
  const el = document.getElementById('cursor-page');
  if (!el) return;
  const total = getCachedPages().length;
  el.textContent = savedCursor.pageNumber > 0 ? `${savedCursor.pageNumber} / ${total}` : `- / ${total}`;
}

function applyReadyPages(pages: PageModel[]) {
  hideStartupSpinner(containerEl);

  const viewport = document.querySelector('.editor-viewport') as HTMLDivElement | null;
  const prevTop = viewport ? viewport.scrollTop : 0;
  renderVirtualPages(pages, true);
  refreshZoomLayout(containerEl);
  if (viewport) viewport.scrollTop = prevTop;

  try {
    const p0 = (pages?.[0] || []).find((it: any) => it?.type === 'paragraph' && (it?._docIdx ?? 0) === 0) as any;
    const modelText = p0 ? (p0.children || []).map((r: any) => r?.text || '').join('') : null;
    const domP = containerEl.querySelector('p[data-p-idx="0"]') as HTMLElement | null;
    const domText = domP ? (domP.textContent || '').replace(/\u200B/g, '') : null;
    console.log('[ime-debug][applyReadyPages]', { modelText, domText, composing: isComposingActive(), hasPending: hasPendingInputState(), savedChar: savedCursor.charIndex });
  } catch {}

  if (!hasPendingInputState()) {
    restoreCursorPosition(containerEl, savedCursor);
    syncFontCombos();
    syncColumnCombo();
    syncAlignCombo();
    syncColorControls();
    syncStyleButtons();
    syncLineSpacingCombo();
    updateCursorPage();
    paintCellSelection(containerEl);
    syncTablePropertiesRibbon(containerEl);
  } else {
    paintCellSelection(containerEl);
  }
  requestAnimationFrame(() => logFontDebug());
}

function flushPendingRender() {
  if (pendingPages) {
    const stashed = pendingPages;
    pendingPages = null;
    applyReadyPages(stashed);
  }
}

initWorkerListener(worker, (pages) => {
  try {
    const p0 = (pages?.[0] || []).find((it: any) => it?.type === 'paragraph' && (it?._docIdx ?? 0) === 0) as any;
    const modelText = p0 ? (p0.children || []).map((r: any) => r?.text || '').join('') : null;
    console.log('[ime-debug][RENDER_READY]', { modelText, composing: isComposingActive(), hasPending: hasPendingInputState(), pendingStash: !!pendingPages });
  } catch {}
  if (!hasPendingInputState()) setAwaitingRender(false);
  if (isComposingActive()) {
    pendingPages = pages;
    return;
  }
  applyReadyPages(pages);
}, (pages) => {
  if (isComposingActive()) return;
  appendStreamPages(pages);
});

initViewportScrollListener(() => { updateVisiblePages(); paintCellSelection(containerEl); });
initSelectionListener(() => {
  clearPendingSelection();
  if (!hasPendingInputState()) saveCursorPosition(containerEl, savedCursor);
  const selection = window.getSelection();
  const node = selection?.anchorNode || null;
  const el = node ? (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null)) : null;
  if (el?.closest('#editor-container') && el.closest('p, td')) {
    activateRibbonTab('format');
  }
  syncFontCombos();
  syncColumnCombo();
  syncAlignCombo();
  syncColorControls();
  syncStyleButtons();
  syncLineSpacingCombo();
  syncTablePropertiesRibbon(containerEl);
  updateCursorPage();
});

initEditorListeners(containerEl, worker, savedCursor, () => saveCursorPosition(containerEl, savedCursor), flushPendingRender, () => { pendingPages = null; });
initSpellcheckListeners();
initFontCombos(containerEl, worker, savedCursor);
initColumnCombo(containerEl, worker, savedCursor);
initAlignCombo(containerEl, worker, savedCursor);
initLineSpacingCombo(containerEl, worker, savedCursor);
initColorControls(containerEl, worker, savedCursor);
initStyleButtons(containerEl, worker, savedCursor);
initParagraphStyles(containerEl, worker, savedCursor);
initTableInsert(containerEl, worker, savedCursor);
initShapeInsert(worker, savedCursor);
initTableSelectionHandler(containerEl, worker);
initTableProperties(containerEl, worker);
initZoomControls(containerEl);
initSave(worker);
initSaveAs(worker);
initAiChat({
  engine: core.engine,
  applyModel: async (model) => {
    await core.loadModel(model, async (m) => computeBreaks(collectProbeItems(m)));
  },
});
initPreviewMode();
