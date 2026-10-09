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
  _docIdx?: number;
  _charOffset?: number;
  lineHeight?: number;
}

// 👈 표(Table) 구조를 위한 인터페이스 정의
export interface TableCellNode {
  type: 'table-cell';
  children: TextRun[]; // 셀 내부 텍스트
}

export interface TableRowNode {
  type: 'table-row';
  cells: TableCellNode[];
  /** 모델 행 인덱스 (분할 조각 추적용) */
  _rowIdx?: number;
}

export interface TableNode {
  type: 'table';
  rows: TableRowNode[];
  _docIdx?: number;
  _continued?: boolean;
  _continues?: boolean;
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
  | { type: 'INIT_SETTINGS'; payload: { charShape: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string } } }
  | { type: 'EDIT_INSERT'; payload: { paragraphIndex: number; charIndex: number; text: string } }
  | { type: 'EDIT_DELETE'; payload: { paragraphIndex: number; charIndex: number } }
  | { type: 'EDIT_SPLIT'; payload: { paragraphIndex: number; charIndex: number } }
  | { type: 'GET_DOC' }
  | { type: 'EDIT_FONT'; payload: { paragraphIndex: number; fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean } }
  | { type: 'EDIT_COLUMNS'; payload: { paragraphIndices: number[]; columns: number } }
  | { type: 'EDIT_DELETE_FWD'; payload: { paragraphIndex: number; charIndex: number } }
  | { type: 'EDIT_ALIGN'; payload: { paragraphIndices: number[]; align: TextAlign } }
  | { type: 'EDIT_COLOR'; payload: { paragraphIndices: number[]; color?: string; backgroundColor?: string } }
  | { type: 'EDIT_FONT_RANGE'; payload: { paragraphIndex: number; fromCharIndex: number; endCharIndex: number; fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean } }
  | { type: 'EDIT_COLOR_RANGE'; payload: { paragraphIndex: number; fromCharIndex: number; endCharIndex: number; color?: string; backgroundColor?: string } };