export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface ParagraphNode {
  type: 'paragraph';
  children: TextRun[];
  align?: TextAlign;
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
}

export interface FontMetrics {
  [char: string]: number;
}

export type WorkerMessage =
  | { type: 'INIT_METRICS'; payload: FontMetrics }
  | { type: 'INIT_DOC'; payload: DocumentModel }
  | { type: 'EDIT_INSERT'; payload: { paragraphIndex: number; charIndex: number; text: string } }
  | { type: 'EDIT_DELETE'; payload: { paragraphIndex: number; charIndex: number } }
  | { type: 'EDIT_SPLIT'; payload: { paragraphIndex: number; charIndex: number } };