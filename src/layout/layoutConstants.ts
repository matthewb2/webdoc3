// A4 규격(96 DPI) 레이아웃 공용 상수/상태.
// 레이아웃(layout.ts), 줄바꿈 측정(probe.ts), DOM 렌더러(render.ts), ruler는
// 반드시 같은 값/상태를 사용해야 측정과 배치 불일치가 생기지 않는다.

export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;
export const PAGE_GAP = 30;
export const PAGE_PITCH = PAGE_HEIGHT + PAGE_GAP; // 1153

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_PAGE_MARGINS: PageMargins = { top: 85, right: 85, bottom: 85, left: 85 };

export const pageLayout = {
  margins: { ...DEFAULT_PAGE_MARGINS } as PageMargins,
  get contentWidth(): number {
    return Math.max(50, PAGE_WIDTH - this.margins.left - this.margins.right);
  },
  get contentHeight(): number {
    return Math.max(50, PAGE_HEIGHT - this.margins.top - this.margins.bottom);
  },
  get tableGridWidth(): number {
    return Math.max(50, this.contentWidth - 1);
  },
};

export function setPageMargins(m: Partial<PageMargins>) {
  const clamp = (v: unknown, fb: number) => (typeof v === 'number' && isFinite(v) ? Math.max(0, Math.min(300, v)) : fb);
  pageLayout.margins = {
    top: clamp(m.top, pageLayout.margins.top),
    right: clamp(m.right, pageLayout.margins.right),
    bottom: clamp(m.bottom, pageLayout.margins.bottom),
    left: clamp(m.left, pageLayout.margins.left),
  };
}

/** @deprecated uniform padding; use pageLayout.margins */
export const PAGE_PADDING = DEFAULT_PAGE_MARGINS.left;
/** @deprecated use pageLayout.contentWidth */
export const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PADDING * 2; // 624
/** @deprecated use pageLayout.contentHeight */
export const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2; // 953
/** @deprecated use pageLayout.tableGridWidth */
export const TABLE_GRID_WIDTH = CONTENT_WIDTH - 1; // 623
