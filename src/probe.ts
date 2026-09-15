// src/probe.ts - 브라우저 실측 줄바꿈 (숨김 probe로 런별 분절점을 재서 워커에 전달)
import type { BreakMap, DocumentModel, TextRun } from './types';

// 워커(doc.worker.ts)의 기하 상수와 동일해야 함
const EDITOR_W = 600;
const TABLE_GRID_W = 599;
const CELL_PAD = 16;
const CELL_BD = 1;

export interface ProbeItem {
  key: string;
  runs: TextRun[];
  width: number;
}

// 워커의 breakKeyForRuns와 동일해야 함 (연산 순서 포함)
export function breakKeyForRuns(runs: TextRun[], width: number): string {
  return `${width}\u0001${runs.map((r) => `${r.text}\u0001${r.fontSize ?? 16}\u0001${r.bold ? 1 : 0}\u0001${r.fontFamily ?? ''}`).join('\u0002')}`;
}

export function collectProbeItems(model: DocumentModel): ProbeItem[] {
  const items: ProbeItem[] = [];
  const seen = new Set<string>();
  const add = (runs: TextRun[], width: number) => {
    if (!runs.length || !runs.some((r) => r.text)) return;
    const key = breakKeyForRuns(runs, width);
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ key, runs, width });
  };
  model.forEach((item) => {
    if (item.type === 'paragraph') {
      add(item.children || [], EDITOR_W);
    } else {
      item.rows.forEach((row) => {
        const cw = TABLE_GRID_W / row.cells.length - CELL_PAD - CELL_BD;
        row.cells.forEach((cell) => add(cell.children || [], cw));
      });
    }
  });
  return items;
}

// 글자별 span을 한 번에 깔고 offsetTop으로 줄을 구분 (레이아웃 1회)
export async function computeBreaks(items: ProbeItem[], onProgress?: (done: number, total: number) => void): Promise<BreakMap> {
  const out: BreakMap = {};
  if (items.length === 0) return out;
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;top:0;left:0;';
  document.body.appendChild(host);
  const CHUNK = 200;
  try {
    for (let s = 0; s < items.length; s += CHUNK) {
      const slice = items.slice(s, s + CHUNK);
      const blocks: HTMLDivElement[] = [];
      slice.forEach((it) => {
        const div = document.createElement('div');
        div.style.cssText = `position:relative;width:${it.width}px;font:16px Arial;word-break:break-all;line-height:26px;letter-spacing:normal;`;
        it.runs.forEach((run) => {
          const fs = run.fontSize ?? 16;
          for (const ch of run.text) {
            const sp = document.createElement('span');
            if (fs !== 16) sp.style.fontSize = `${fs}px`;
            if (run.bold) sp.style.fontWeight = 'bold';
            if (run.fontFamily) sp.style.fontFamily = run.fontFamily;
            sp.textContent = ch;
            div.appendChild(sp);
          }
        });
        host.appendChild(div);
        blocks.push(div);
      });
      slice.forEach((it, bi) => {
        const kids = Array.from(blocks[bi].children) as HTMLSpanElement[];
        const counts: number[] = [];
        let lastTop = -1;
        let n = 0;
        kids.forEach((sp) => {
          const top = sp.offsetTop;
          if (lastTop < 0 || Math.abs(top - lastTop) > 2) {
            if (lastTop >= 0) counts.push(n);
            n = 0;
            lastTop = top;
          }
          n++;
        });
        counts.push(n);
        out[it.key] = counts;
      });
      host.replaceChildren();
      onProgress?.(Math.min(s + CHUNK, items.length), items.length);
      await new Promise((r) => setTimeout(r, 0));
    }
  } finally {
    host.remove();
  }
  return out;
}
