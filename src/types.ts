export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface ParagraphNode {
  type: 'paragraph';
  children: TextRun[];
  columns?: number;
  align?: TextAlign;
  /** 왼쪽(첫 줄) 들여쓰기(px). 양수=들여쓰기, 음수=내어쓰기, 기본값 0 */
  indent?: number;
  /** 줄간격(퍼센트). 기본값 160 */
  lineSpacing?: number;
  /** 문단 위 간격(px). HWP 문단 모양의 marginTop을 변환한 값 */
  spaceBefore?: number;
  /** 문단 아래 간격(px). HWP 문단 모양의 marginBottom을 변환한 값 */
  spaceAfter?: number;
  _docIdx?: number;
  _charOffset?: number;
  lineHeight?: number;
}

// 👈 표(Table) 구조를 위한 인터페이스 정의
export interface TableCellNode {
  type: 'table-cell';
  children: TextRun[]; // 셀 내부 텍스트
  align?: TextAlign;
  rowSpan?: number;
  colSpan?: number;
  /** 다른 셀에 가려진 병합 자리 표시자 (렌더/측정 제외) */
  merged?: boolean;
}

export interface TableRowNode {
  type: 'table-row';
  cells: TableCellNode[];
  /** 모델 행 인덱스 (분할 조각 추적용) */
  _rowIdx?: number;
  /** 사용자 지정 행 높이(px). 지정 시 레이아웃/렌더링의 최소 높이로 사용 */
  height?: number;
}

export type TableBorderStyle = 'default' | 'none' | 'no-vertical';

export interface TableNode {
  type: 'table';
  rows: TableRowNode[];
  _docIdx?: number;
  _continued?: boolean;
  _continues?: boolean;
  colWidths?: number[];
  backgroundColor?: string;
  background?: string;
  borderStyle?: TableBorderStyle;
}

// 문서 모델은 단락 또는 표의 배열입니다.
export type DocumentItem = ParagraphNode | TableNode;
export type DocumentModel = DocumentItem[];

export interface CursorState {
  docIdx: number;
  charIndex: number;
  charOffset: number;
  isInsideTable: boolean;
  rowIndex: number;
  cellIndex: number;
  pageNumber: number;
}

export interface FontMetrics {
  [char: string]: number;
}

export type BreakMap = Record<string, number[]>;

export type WorkerMessage =
  | { type: 'INIT_METRICS'; payload: FontMetrics }
  | { type: 'BREAKS'; payload: BreakMap }
  | { type: 'INIT_DOC'; payload: DocumentModel }
  | { type: 'INIT_SETTINGS'; payload: { charShape: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string }; lineSpacing?: number } }
  | { type: 'EDIT_LINE_SPACING'; payload: { paragraphIndices: number[]; lineSpacing: number } }
  | { type: 'EDIT_INSERT'; payload: { paragraphIndex: number; charIndex: number; text: string } }
  | { type: 'EDIT_DELETE'; payload: { paragraphIndex: number; charIndex: number } }
  | { type: 'EDIT_SPLIT'; payload: { paragraphIndex: number; charIndex: number } }
  | { type: 'GET_DOC' }
  | { type: 'EDIT_FONT'; payload: { paragraphIndex: number; fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean } }
  | { type: 'EDIT_COLUMNS'; payload: { paragraphIndices: number[]; columns: number } }
  | { type: 'EDIT_DELETE_FWD'; payload: { paragraphIndex: number; charIndex: number } }
  | { type: 'EDIT_ALIGN'; payload: { paragraphIndices: number[]; align: TextAlign } }
  | { type: 'EDIT_TABLE_ALIGN'; payload: { tableDocIdx: number; rows: number[]; cols: number[]; align: TextAlign } }
  | { type: 'EDIT_TABLE_MERGE'; payload: { tableDocIdx: number; r0: number; r1: number; c0: number; c1: number } }
  | { type: 'EDIT_TABLE_ROW_HEIGHT'; payload: { tableDocIdx: number; rowIndex: number; height: number } }
  | { type: 'EDIT_TABLE_COL_WIDTH'; payload: { tableDocIdx: number; colIndex: number; width: number } }
  | { type: 'EDIT_INSERT_TABLE'; payload: { paragraphIndex: number; charIndex: number; rows: number; cols: number } }
  | { type: 'EDIT_TABLE_BORDER'; payload: { tableDocIdx: number; borderStyle: TableBorderStyle } }
  | { type: 'EDIT_COLOR'; payload: { paragraphIndices: number[]; color?: string; backgroundColor?: string } }
  | { type: 'EDIT_FONT_RANGE'; payload: { paragraphIndex: number; fromCharIndex: number; endCharIndex: number; fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean } }
  | { type: 'EDIT_COLOR_RANGE'; payload: { paragraphIndex: number; fromCharIndex: number; endCharIndex: number; color?: string; backgroundColor?: string } };