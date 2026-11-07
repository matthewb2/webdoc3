// A4 규격(96 DPI) 레이아웃 공통 상수.
// 워커(layout.ts), 줄바꿈 측정(probe.ts), DOM 렌더링(render.ts)이
// 반드시 같은 값을 사용해야 페이지 분할과 실제 렌더링이 일치한다.

export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;
export const PAGE_PADDING = 85;

/** 페이지 안쪽의 실제 본문 영역 (좌우 여백 제외) */
export const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PADDING * 2; // 624

/** 페이지 안쪽의 실제 본문 영역 높이 (상하 여백 제외) */
export const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2; // 953

/** 페이지 사이 간격 (CSS .page margin-bottom) */
export const PAGE_GAP = 30;

/** 가상화/스크롤 계산에 사용하는 페이지 피치 (페이지 높이 + 간격) */
export const PAGE_PITCH = PAGE_HEIGHT + PAGE_GAP; // 1153

/** 표 셀 폭 계산 기준 (페이지 본문 폭에서 표 외곽선 1px 제외) */
export const TABLE_GRID_WIDTH = CONTENT_WIDTH - 1; // 623
