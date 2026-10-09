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
}

const ALIGN_VALUES: TextAlign[] = ['left', 'center', 'right', 'justify'];

function validAlign(v: unknown): v is TextAlign {
  return typeof v === 'string' && (ALIGN_VALUES as string[]).includes(v);
}

export const DEFAULT_SETTINGS: UserSettings = {
  fontFamily: '맑은 고딕',
  fontSize: 16,
  uiFontFamily: '맑은 고딕',
  charShape: { bold: false, italic: false, underline: false, strike: false },
  paraShape: { align: 'justify', indent: 0 },
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
  return base;
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
      };
    }
  } catch {
    /* 저장소 접근 실패 시 파일 설정 */
  }
  return { ...base };
}

export function loadSettings(): UserSettings {
  return mergedSettings();
}

export function saveSettings(patch: Partial<UserSettings>): UserSettings {
  const next: UserSettings = {
    ...loadSettings(),
    ...patch,
    charShape: { ...loadSettings().charShape, ...(patch.charShape ?? {}) },
    paraShape: { ...loadSettings().paraShape, ...(patch.paraShape ?? {}) },
  };
  if (next.fontFamily.length === 0) next.fontFamily = DEFAULT_SETTINGS.fontFamily;
  if (!(next.fontSize > 0)) next.fontSize = DEFAULT_SETTINGS.fontSize;
  if (!next.uiFontFamily || next.uiFontFamily.length === 0) next.uiFontFamily = DEFAULT_SETTINGS.uiFontFamily;
  next.charShape = validCharShape(next.charShape);
  next.paraShape = validParaShape(next.paraShape);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* 저장 실패 무시 */
  }
  return next;
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
