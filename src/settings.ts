// src/settings.ts - 사용자 설정 (기본값 + localStorage 영속)
export interface UserSettings {
  /** 기본 글꼴 */
  fontFamily: string;
  /** 기본 글자 크기(px) */
  fontSize: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  fontFamily: '맑은 고딕',
  fontSize: 16,
};

const STORAGE_KEY = 'webdoc3-settings';

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserSettings>;
      return {
        fontFamily:
          typeof parsed.fontFamily === 'string' && parsed.fontFamily.length > 0
            ? parsed.fontFamily
            : DEFAULT_SETTINGS.fontFamily,
        fontSize:
          typeof parsed.fontSize === 'number' && parsed.fontSize > 0
            ? parsed.fontSize
            : DEFAULT_SETTINGS.fontSize,
      };
    }
  } catch {
    /* 저장소 접근 실패 시 기본값 */
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(patch: Partial<UserSettings>): UserSettings {
  const next: UserSettings = { ...loadSettings(), ...patch };
  if (next.fontFamily.length === 0) next.fontFamily = DEFAULT_SETTINGS.fontFamily;
  if (!(next.fontSize > 0)) next.fontSize = DEFAULT_SETTINGS.fontSize;
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
