export interface TextRun {
  text: string;
  bold?: boolean;
}

export interface ParagraphNode {
  type: 'paragraph';
  children: TextRun[];
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
}

// 문서 모델은 단락 또는 표의 배열입니다.
export type DocumentItem = ParagraphNode | TableNode;
export type DocumentModel = DocumentItem[];

export interface FontMetrics {
  [char: string]: number;
}

export type WorkerMessage =
  | { type: 'INIT_METRICS'; payload: FontMetrics }
  | { type: 'INIT_DOC'; payload: DocumentModel }
  | { type: 'EDIT_INSERT'; payload: { paragraphIndex: number; charIndex: number; text: string } }
  | { type: 'EDIT_SPLIT'; payload: { paragraphIndex: number; charIndex: number } };