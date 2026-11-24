import type { DocumentModel } from '../types';

﻿let systemFonts: string[] = [];
let systemFontsSet: Set<string> = new Set();
let loaded = false;

export async function getSystemFonts(): Promise<string[]> {
  // 1) Local Font Access API (Chromium / Electron)
  const w = window as any;
  if (typeof w.queryLocalFonts === 'function') {
    try {
      const fonts: Array<{ family: string }> = await w.queryLocalFonts();
      const families = [...new Set(fonts.map((f) => String(f.family || '').trim()).filter(Boolean))];
      if (families.length > 0) return families;
    } catch { /* permission denied or unsupported */ }
  }
  // 2) Electron IPC fallback
  const api = w.electronAPI;
  if (api && typeof api.getSystemFonts === 'function') {
    try {
      const families: string[] = await api.getSystemFonts();
      if (Array.isArray(families) && families.length > 0) {
        return [...new Set(families.map((s) => String(s || '').trim()).filter(Boolean))];
      }
    } catch { /* ignore */ }
  }
  return [];
}

export async function initFontRegistry(): Promise<string[]> {
  if (loaded) return systemFonts;
  loaded = true;
  systemFonts = await getSystemFonts();
  systemFontsSet = new Set(systemFonts.map((f) => normalize(f)));
  console.log('[font-registry] system fonts loaded:', systemFonts.length);
  return systemFonts;
}

export function getInstalledFonts(): string[] {
  return systemFonts;
}

export function isFontInstalled(name: string): boolean {
  if (!name) return false;
  const n = normalize(name);
  if (systemFontsSet.has(n)) return true;
  // try without spaces
  if (systemFontsSet.has(n.replace(/\s+/g, ''))) return true;
  return false;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/['"]/g, '');
}

function findInstalled(candidates: string[]): string | null {
  for (const c of candidates) {
    if (isFontInstalled(c)) return c;
    // also try to find by partial match in system fonts
    const cn = normalize(c);
    const found = systemFonts.find((f) => normalize(f) === cn);
    if (found) return found;
  }
  return null;
}

/** 문서 글꼴이 시스템에 없을 때 유사한 설치 글꼴로 대체 */
export function resolveMissingFont(name: string): string {
  const n = (name || '').trim();
  if (!n) return n;
  if (systemFonts.length === 0) return n; // registry not loaded, keep original
  if (isFontInstalled(n)) return n;

  const lower = n.toLowerCase();
  // 바탕/명조 계열
  if (lower.includes('바탕') || lower.includes('batang') || lower.includes('명조') || lower.includes('myeongjo')) {
    return findInstalled(['바탕', 'Batang', '함초롬바탕', 'NanumMyeongjo', 'Noto Serif KR', 'Times New Roman']) || n;
  }
  // 돋움/고딕 계열
  if (lower.includes('돋움') || lower.includes('dotum') || lower.includes('고딕') || lower.includes('gothic') || lower.includes('gulim') || lower.includes('굴림')) {
    return findInstalled(['맑은 고딕', 'Malgun Gothic', '함초롬돋움', 'NanumGothic', 'Noto Sans KR', 'Arial']) || n;
  }
  // 궁서
  if (lower.includes('궁서') || lower.includes('gungsuh')) {
    return findInstalled(['궁서', 'Gungsuh', 'Batang', '바탕', 'serif']) || n;
  }
  // 굴림
  if (lower.includes('굴림') || lower.includes('gulim')) {
    return findInstalled(['굴림', 'Gulim', 'Malgun Gothic', '맑은 고딕', 'sans-serif']) || n;
  }
  return n;
}

/** 시스템에 없으면 유사 글꼴로 대체한 fontFamily를 반환 */
export function normalizeFontForSystem(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const resolved = resolveMissingFont(name);
  return resolved;
}

export function resolveModelFonts(model: DocumentModel): void {
  if (systemFonts.length === 0) return;
  const walkRuns = (runs: any[] | undefined) => {
    if (!Array.isArray(runs)) return;
    for (const r of runs) {
      if (r && typeof r.fontFamily === 'string' && r.fontFamily) {
        const resolved = resolveMissingFont(r.fontFamily);
        if (resolved !== r.fontFamily) {
          console.log('[font-registry] fallback', r.fontFamily, '->', resolved);
          r.fontFamily = resolved;
        }
      }
    }
  };
  for (const item of model) {
    if (!item) continue;
    if (item.type === 'paragraph') {
      walkRuns((item as any).children);
    } else if (item.type === 'table') {
      for (const row of (item as any).rows || []) {
        for (const cell of row.cells || []) {
          walkRuns(cell.children);
        }
      }
    }
  }
}
