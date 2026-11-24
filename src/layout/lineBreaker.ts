// src/layout/lineBreaker.ts
import type { FontMetrics, TextRun } from '../types';
import { pageLayout } from './layoutConstants';

export function setFontMetrics(metrics: FontMetrics): void {
  fontMetrics = metrics;
}

export function hasFontMetrics(): boolean {
  return Object.keys(fontMetrics).length > 0;
}

export type Glyph = { ch: string; run: TextRun; w?: number };

const BASE_FONT_PX = 16;
const COLUMN_GAP = 20;

let fontMetrics: FontMetrics = {};
const breakCache = new Map<string, number[]>();


export function setBreaks(incoming: Record<string, number[]>): void {
  Object.keys(incoming).forEach((k) => breakCache.set(k, incoming[k]));
  if (breakCache.size > 8000) breakCache.clear();
}

export function clearBreaks(): void {
  breakCache.clear();
}

export function columnWidth(columns: number): number {
  const n = Math.max(1, columns);
  return (pageLayout.contentWidth - COLUMN_GAP * (n - 1)) / n;
}

export function isSameStyle(a: TextRun, b: TextRun): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.fontFamily === b.fontFamily &&
    a.fontSize === b.fontSize &&
    a.color === b.color &&
    a.backgroundColor === b.backgroundColor
  );
}

export function glyphLineToRuns(line: Glyph[]): TextRun[] {
  if (line.length === 0) return [{ text: '' }];

  const runs: TextRun[] = [];
  line.forEach((glyph) => {
    const last = runs[runs.length - 1];
    if (last && isSameStyle(last, glyph.run)) {
      last.text += glyph.ch;
    } else {
      runs.push({ ...glyph.run, text: glyph.ch });
    }
  });
  return runs;
}

export function mergeRuns(runs: TextRun[]): TextRun[] {
  const merged: TextRun[] = [];
  runs.forEach((run) => {
    const last = merged[merged.length - 1];
    if (last && isSameStyle(last, run)) {
      last.text += run.text;
    } else {
      merged.push({ ...run });
    }
  });
  return merged;
}

export function runsFromLines(lines: Glyph[][]): TextRun[] {
  if (lines.length === 0) return [{ text: '' }];
  return mergeRuns(lines.flatMap(glyphLineToRuns));
}

export function lineHeightOfLine(line: Glyph[], spacingPct: number): number {
  let maxFont = 0;
  line.forEach((glyph) => {
    const size = glyph.run.fontSize ?? BASE_FONT_PX;
    if (size > maxFont) maxFont = size;
  });
  if (maxFont <= 0) maxFont = BASE_FONT_PX;
  // 브라우저 CSS line-height와 동일하게 분수 값을 사용 (반올림 누적 오차로 조기 페이지 넘김 방지)
  return Math.max(1, (maxFont * spacingPct) / 100);
}

function breakKeyForRuns(runs: TextRun[], width: number): string {
  // probe.ts의 breakKeyForRuns와 동일해야 함 (구분자·연산 포함)
  return `${width}\u0001${runs
    .map((r) => `${r.text}\u0001${r.fontSize ?? 16}\u0001${r.bold ? 1 : 0}\u0001${r.fontFamily ?? ''}`)
    .join('\u0002')}`;
}

export function buildRunLines(runs: TextRun[], maxWidth: number): Glyph[][] {
  const glyphs: Glyph[] = [];
  runs.forEach((run) => {
    for (const ch of run.text) {
      glyphs.push({ ch, run });
    }
  });
  if (glyphs.length === 0) return [[]];

  const probed = breakCache.get(breakKeyForRuns(runs, maxWidth));
  if (runs.length > 0 && runs[0].text.includes('11번째')) {
    console.log(
      `[breakdbg] cacheSize=${breakCache.size} probed=${JSON.stringify(probed)} greedy=${JSON.stringify(
        wrapGlyphs(glyphs, maxWidth).map((l) => l.length),
      )}`,
    );
  }
  if (probed) return sliceGlyphs(glyphs, probed, maxWidth);
  return wrapGlyphs(glyphs, maxWidth);
}

function sliceGlyphs(glyphs: Glyph[], breaks: number[], maxWidth: number): Glyph[][] {
  const lines: Glyph[][] = [];
  let pos = 0;
  breaks.forEach((count) => {
    if (count <= 0) return;
    lines.push(glyphs.slice(pos, pos + count));
    pos += count;
  });
  if (pos < glyphs.length) {
    wrapGlyphs(glyphs.slice(pos), maxWidth).forEach((line) => lines.push(line));
  }
  if (lines.length === 0) lines.push([]);
  return lines;
}

function wrapGlyphs(glyphs: Glyph[], maxWidth: number): Glyph[][] {
  const lines: Glyph[][] = [];
  let current: Glyph[] = [];
  let currentWidth = 0;

  glyphs.forEach((glyph) => {
    const baseWidth = fontMetrics[glyph.ch] !== undefined ? fontMetrics[glyph.ch] : fontMetrics['default_ko'];
    const charWidth = baseWidth * ((glyph.run.fontSize ?? BASE_FONT_PX) / BASE_FONT_PX);

    if (currentWidth + charWidth > maxWidth && current.length > 0) {
      // 영문 단어 단위 줄바꿈: 줄 안 마지막 공백/하이픈 뒤에서 나눔 (앞에 실제 글자가 있을 때만)
      let breakAt = -1;
      for (let i = current.length - 1; i >= 0; i--) {
        const ch = current[i].ch;
        if (ch === ' ' || ch === '-') {
          let hasContent = false;
          for (let k = 0; k < i; k++) {
            if (current[k].ch !== ' ') {
              hasContent = true;
              break;
            }
          }
          if (hasContent) {
            breakAt = i;
            break;
          }
        }
      }
      if (breakAt >= 0) {
        lines.push(current.slice(0, breakAt + 1));
        current = current.slice(breakAt + 1);
        currentWidth = 0;
        current.forEach((g) => {
          // 줄바꿈 후 첫 글자가 공백이어도 너비를 강제로 0으로 만들지 않고 실제 폰트 폭을 유지
          const bw = fontMetrics[g.ch] !== undefined ? fontMetrics[g.ch] : fontMetrics['default_ko'];
          currentWidth += bw * ((g.run.fontSize ?? BASE_FONT_PX) / BASE_FONT_PX);
        });
      } else {
        lines.push(current);
        current = [];
        currentWidth = 0;
      }
    }

    current.push(glyph);
    currentWidth += charWidth;
  });

  if (current.length > 0) {
    lines.push(current);
  }

  // 줄 끝에 있는 공백만 너비를 제거하여 줄바꿈 정렬 시 우측 여백 충돌 방지
  lines.forEach((line) => {
    for (let i = line.length - 1; i >= 0; i--) {
      if (line[i].ch === ' ') line[i].w = 0;
      else break;
    }
  });

  return lines;
}