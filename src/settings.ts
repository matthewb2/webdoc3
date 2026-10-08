// src/settings.ts - 사용자 설정 (public/settings.json + localStorage 영속)
export interface UserSettings {
  /** 본문 기본 글꼴 */
  fontFamily: string;
  /** 본문 기본 글자 크기(px) */
  fontSize: number;
  /** 시스템(툴바·상태바) 글꼴 */
  uiFontFamily: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  fontFamily: '맑은 고딕',
  fontSize: 16,
  uiFontFamily: '맑은 고딕',
};

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
      const next: UserSettings = { ...DEFAULT_SETTINGS };
      if (typeof parsed.fontFamily === 'string' && parsed.fontFamily.length > 0) {
        next.fontFamily = parsed.fontFamily;
      }
      if (typeof parsed.fontSize === 'number' && parsed.fontSize > 0) {
        next.fontSize = parsed.fontSize;
      }
      if (typeof parsed.uiFontFamily === 'string' && parsed.uiFontFamily.length > 0) {
        next.uiFontFamily = parsed.uiFontFamily;
      }
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
  const next: UserSettings = { ...loadSettings(), ...patch };
  if (next.fontFamily.length === 0) next.fontFamily = DEFAULT_SETTINGS.fontFamily;
  if (!(next.fontSize > 0)) next.fontSize = DEFAULT_SETTINGS.fontSize;
  if (!next.uiFontFamily || next.uiFontFamily.length === 0) next.uiFontFamily = DEFAULT_SETTINGS.uiFontFamily;
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
