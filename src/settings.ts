// src/settings.ts - 사용자 설정 (public/settings.json + localStorage 영속)
import type { TextAlign } from './types';

export interface CharShapeSetting {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  color?: string;
}

export interface ParaShapeSetting {
  align: TextAlign;
  indent: number;
  lineSpacing: number;
}

export interface PageMarginsSetting {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface UserSettings {
  /** 본문 기본 글꼴 */
  fontFamily: string;
  /** 본문 기본 글자 크기(px) */
  fontSize: number;
  /** 시스템(툴바·상태바) 글꼴 */
  uiFontFamily: string;
  /** 새 글자의 기본 모양 */
  charShape: CharShapeSetting;
  /** 기본 문단 모양 (align이 기본 정렬) */
  paraShape: ParaShapeSetting;
  /** 페이지 여백(px, 96dpi) */
  pageMargins: PageMarginsSetting;
  /** 최근 사용한 파일(파일명, 최신순) */
  recentFiles: string[];
  /** 문단부호 표시 */
  showParaMarks: boolean;
}

const ALIGN_VALUES: TextAlign[] = ['left', 'center', 'right', 'justify'];

function validAlign(v: unknown): v is TextAlign {
  return typeof v === 'string' && (ALIGN_VALUES as string[]).includes(v);
}

export const DEFAULT_SETTINGS: UserSettings = {
  fontFamily: '바탕',
  fontSize: 16,
  uiFontFamily: '맑은 고딕',
  charShape: { bold: false, italic: false, underline: false, strike: false },
  paraShape: { align: 'justify', indent: 0, lineSpacing: 160 },
  pageMargins: { top: 85, right: 85, bottom: 85, left: 85 },
  recentFiles: [],
  showParaMarks: true,
};

function validCharShape(v: unknown): CharShapeSetting {
  const base: CharShapeSetting = { ...DEFAULT_SETTINGS.charShape };
  if (typeof v !== 'object' || v === null) return base;
  const o = v as Record<string, unknown>;
  (['bold', 'italic', 'underline', 'strike'] as const).forEach((k) => {
    if (typeof o[k] === 'boolean') base[k] = o[k] as boolean;
  });
  if (typeof o['color'] === 'string' && (o['color'] as string).length > 0) {
    base.color = o['color'] as string;
  }
  return base;
}

function validParaShape(v: unknown): ParaShapeSetting {
  const base: ParaShapeSetting = { ...DEFAULT_SETTINGS.paraShape };
  if (typeof v !== 'object' || v === null) return base;
  const o = v as Record<string, unknown>;
  if (validAlign(o['align'])) base.align = o['align'];
  if (typeof o['indent'] === 'number' && isFinite(o['indent'])) base.indent = o['indent'];
  if (typeof o['lineSpacing'] === 'number' && isFinite(o['lineSpacing']) && (o['lineSpacing'] as number) > 0) {
    base.lineSpacing = o['lineSpacing'] as number;
  }
  return base;
}

function validPageMargins(v: unknown): PageMarginsSetting {
  const base: PageMarginsSetting = { ...DEFAULT_SETTINGS.pageMargins };
  if (typeof v !== 'object' || v === null) return base;
  const o = v as Record<string, unknown>;
  (['top', 'right', 'bottom', 'left'] as const).forEach((k) => {
    const n = o[k];
    if (typeof n === 'number' && isFinite(n)) base[k] = Math.max(0, Math.min(300, n));
  });
  return base;
}

function validRecentFiles(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    if (typeof item === 'string' && item.length > 0) out.push(item);
    if (out.length >= 10) break;
  }
  return out;
}

const STORAGE_KEY = 'webdoc3-settings';
const SETTINGS_URL = `${import.meta.env.BASE_URL}settings.json`;

let fileSettings: UserSettings | null = null;
let fileLoaded = false;

/** public/settings.json 로드 (부팅 시 1회, 실패 시 내장 기본값) */
export async function initSettings(): Promise<UserSettings> {
  if (fileLoaded) return mergedSettings();
  fileLoaded = true;
  try {
    const res = await fetch(SETTINGS_URL);
    if (res.ok) {
      const parsed = (await res.json()) as Partial<UserSettings>;
      const next: UserSettings = {
        ...DEFAULT_SETTINGS,
        charShape: { ...DEFAULT_SETTINGS.charShape },
        paraShape: { ...DEFAULT_SETTINGS.paraShape },
        pageMargins: { ...DEFAULT_SETTINGS.pageMargins },
      };
      if (typeof parsed.fontFamily === 'string' && parsed.fontFamily.length > 0) {
        next.fontFamily = parsed.fontFamily;
      }
      if (typeof parsed.fontSize === 'number' && parsed.fontSize > 0) {
        next.fontSize = parsed.fontSize;
      }
      if (typeof parsed.uiFontFamily === 'string' && parsed.uiFontFamily.length > 0) {
        next.uiFontFamily = parsed.uiFontFamily;
      }
      next.charShape = validCharShape(parsed.charShape);
      next.paraShape = validParaShape(parsed.paraShape);
      next.pageMargins = validPageMargins((parsed as any).pageMargins);
      next.recentFiles = validRecentFiles((parsed as any).recentFiles);
      if (typeof (parsed as any).showParaMarks === 'boolean') next.showParaMarks = (parsed as any).showParaMarks;
      fileSettings = next;
    }
  } catch {
    /* 네트워크 실패 시 내장 기본값 */
  }
  return mergedSettings();
}

function mergedSettings(): UserSettings {
  const base = fileSettings ?? DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserSettings>;
      return {
        fontFamily:
          typeof parsed.fontFamily === 'string' && parsed.fontFamily.length > 0
            ? parsed.fontFamily
            : base.fontFamily,
        fontSize:
          typeof parsed.fontSize === 'number' && parsed.fontSize > 0 ? parsed.fontSize : base.fontSize,
        uiFontFamily:
          typeof parsed.uiFontFamily === 'string' && parsed.uiFontFamily.length > 0
            ? parsed.uiFontFamily
            : base.uiFontFamily,
        charShape: parsed.charShape !== undefined ? validCharShape(parsed.charShape) : { ...base.charShape },
        paraShape: parsed.paraShape !== undefined ? validParaShape(parsed.paraShape) : { ...base.paraShape },
        pageMargins: (parsed as any).pageMargins !== undefined ? validPageMargins((parsed as any).pageMargins) : { ...base.pageMargins },
        recentFiles: (parsed as any).recentFiles !== undefined ? validRecentFiles((parsed as any).recentFiles) : [...(base.recentFiles ?? [])],
        showParaMarks: typeof (parsed as any).showParaMarks === 'boolean' ? (parsed as any).showParaMarks : !!base.showParaMarks,
      };
    }
  } catch {
    /* 저장소 접근 실패 시 파일 설정 */
  }
  return { ...base, charShape: { ...base.charShape }, paraShape: { ...base.paraShape }, pageMargins: { ...base.pageMargins }, recentFiles: [...(base.recentFiles ?? [])], showParaMarks: !!base.showParaMarks };
}

export function loadSettings(): UserSettings {
  return mergedSettings();
}

export function saveSettings(patch: Partial<UserSettings>): UserSettings {
  const cur = loadSettings();
  const next: UserSettings = {
    ...cur,
    ...patch,
    charShape: { ...cur.charShape, ...(patch.charShape ?? {}) },
    paraShape: { ...cur.paraShape, ...(patch.paraShape ?? {}) },
    pageMargins: { ...cur.pageMargins, ...(patch.pageMargins ?? {}) },
    recentFiles: patch.recentFiles !== undefined ? validRecentFiles(patch.recentFiles) : [...cur.recentFiles],
    showParaMarks: typeof patch.showParaMarks === 'boolean' ? patch.showParaMarks : cur.showParaMarks,
  };
  if (next.fontFamily.length === 0) next.fontFamily = DEFAULT_SETTINGS.fontFamily;
  if (!(next.fontSize > 0)) next.fontSize = DEFAULT_SETTINGS.fontSize;
  if (!next.uiFontFamily || next.uiFontFamily.length === 0) next.uiFontFamily = DEFAULT_SETTINGS.uiFontFamily;
  next.charShape = validCharShape(next.charShape);
  next.paraShape = validParaShape(next.paraShape);
  next.pageMargins = validPageMargins(next.pageMargins);
  next.recentFiles = validRecentFiles(next.recentFiles);
  next.showParaMarks = !!next.showParaMarks;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* 저장 실패 무시 */
  }
  return next;
}

export function defaultPageMargins(): PageMarginsSetting {
  return loadSettings().pageMargins;
}

export function defaultFontFamily(): string {
  return loadSettings().fontFamily;
}

export function defaultFontSize(): number {
  return loadSettings().fontSize;
}

export function defaultUiFontFamily(): string {
  return loadSettings().uiFontFamily;
}

export function defaultAlign(): TextAlign {
  return loadSettings().paraShape.align;
}

export function defaultParaShape(): ParaShapeSetting {
  return loadSettings().paraShape;
}

export function defaultCharShape(): CharShapeSetting {
  return loadSettings().charShape;
}

export function defaultIndent(): number {
  return loadSettings().paraShape.indent;
}

export function defaultLineSpacing(): number {
  return loadSettings().paraShape.lineSpacing;
}

export function getRecentFiles(): string[] {
  return [...loadSettings().recentFiles];
}

export function addRecentFile(name: string): string[] {
  if (!name || !/\.(hwp|docx|odt)$/i.test(name)) return getRecentFiles();
  const cur = getRecentFiles().filter((n) => n !== name);
  cur.unshift(name);
  const next = cur.slice(0, 10);
  saveSettings({ recentFiles: next });
  return next;
}
