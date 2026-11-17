import type { DocumentModel, FontMetrics } from '../types';
import { collectProbeItems, computeBreaks } from '../probe';
import { parseHwpToDocumentModel } from '../fmt/hwp/hwpParser';
import { parseHwpxToDocumentModel } from '../fmt/hwpx/hwpxParser';
import { parseDocxToDocumentModel } from '../fmt/docx/docxParser';
import { parseOdtToDocumentModel } from '../fmt/odt/odtParser';
import { createDocEngine, type DocEngine, type DocEngineOptions } from './docEngine';
import { buildMockDocument } from './mockDocument';

export type BreaksComputer = (model: DocumentModel) => Promise<Record<string, number[]>>;

export interface EditorCoreOptions {
  engine?: DocEngineOptions;
  /** 모델 로드 시 기본 브레이크 계산기. 미지정 시 브라우저 probe 기반 computeBreaks 사용 */
  defaultBreaksComputer?: BreaksComputer;
}

export interface EditorCore {
  engine: DocEngine;
  postMessage(message: any): void;
  initSettings(payload: { charShape?: any; lineSpacing?: number; pageMargins?: any }): void;
  initMetrics(metrics: FontMetrics): void;
  loadModel(model: DocumentModel, computeBreaksFn?: BreaksComputer): Promise<void>;
  loadFromBytes(bytes: Uint8Array, filename: string, computeBreaksFn?: BreaksComputer): Promise<DocumentModel>;
  newBlankDocument(computeBreaksFn?: BreaksComputer): Promise<DocumentModel>;
  getMockDocument(): DocumentModel;
}

const browserBreaks: BreaksComputer = async (model) => computeBreaks(collectProbeItems(model));

export function parseDocumentBytes(bytes: Uint8Array, filename: string): Promise<DocumentModel> | DocumentModel {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.hwpx')) return parseHwpxToDocumentModel(bytes);
  if (lower.endsWith('.hwp')) return parseHwpToDocumentModel(bytes);
  if (lower.endsWith('.docx')) return parseDocxToDocumentModel(bytes);
  return parseOdtToDocumentModel(bytes);
}

export function createEditorCore(options: EditorCoreOptions = {}): EditorCore {
  const engine = createDocEngine(options.engine);
  const defaultBreaks = options.defaultBreaksComputer ?? browserBreaks;

  const loadModel = async (model: DocumentModel, computeBreaksFn: BreaksComputer = defaultBreaks) => {
    const breaks = await computeBreaksFn(model);
    engine.postMessage({ type: 'BREAKS', payload: breaks });
    engine.postMessage({ type: 'INIT_DOC', payload: model });
  };

  return {
    engine,
    postMessage: (message) => engine.postMessage(message),
    initSettings: (payload) => engine.postMessage({ type: 'INIT_SETTINGS', payload }),
    initMetrics: (metrics) => engine.postMessage({ type: 'INIT_METRICS', payload: metrics }),
    loadModel,
    async loadFromBytes(bytes, filename, computeBreaksFn = defaultBreaks) {
      const model = await parseDocumentBytes(bytes, filename);
      await loadModel(model, computeBreaksFn);
      return model;
    },
    async newBlankDocument(computeBreaksFn = defaultBreaks) {
      const model: DocumentModel = [{ type: 'paragraph', children: [{ text: '' }] }];
      await loadModel(model, computeBreaksFn);
      return model;
    },
    getMockDocument: () => buildMockDocument(),
  };
}

/**
 * Node/헤드리스 환경용 코어 팩토리.
 * - 레이아웃(페이지 렌더 결과 생성)을 비활성화하고 동기 스케줄러를 사용
 * - 브레이크 계산은 기본적으로 빈 맵(필요 시 주입)
 * 문서 모델 조작/스냅샷(GET_DOC -> DOC_SNAPSHOT) 등 엔진 상태 연산에 적합
 */
export function createHeadlessEditorCore(options: Omit<EditorCoreOptions, 'defaultBreaksComputer' | 'engine'> & {
  engine?: DocEngineOptions;
  defaultBreaksComputer?: BreaksComputer;
} = {}): EditorCore {
  return createEditorCore({
    defaultBreaksComputer: options.defaultBreaksComputer ?? (async () => ({})),
    engine: {
      schedule: (cb) => { cb(); return 0; },
      cancelSchedule: () => {},
      runLayout: () => {},
      ...options.engine,
    },
  });
}

export { buildMockDocument, buildTableTest } from './mockDocument';
export { createDocEngine, type DocEngine, type DocEngineOptions } from './docEngine';
