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
  /** 들여쓰기 (px) - legacy: left/text indent fallback */
  indent?: number;
  /** 문단 왼쪽 들여쓰기(margin-left, px) */
  leftIndent?: number;
  /** 첫 줄 들여쓰기(text-indent, px, 음수=내어쓰기) */
  textIndent?: number;
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
  children: TextRun[]; // 셀 내용 텍스트
  align?: TextAlign;
  leftIndent?: number;
  textIndent?: number;
  rowSpan?: number;
  colSpan?: number;
  /** 다른 셀에 병합된 자리 표시(렌더/측정 제외) */
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

export type ShapeKind = 'rect' | 'ellipse' | 'line' | 'arrow';
export type ShapePlacement = 'default' | 'front' | 'back';

export interface ShapeNode {
  type: 'shape';
  shape: ShapeKind;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  /** 본문과의 배치: 기본(본문 흐름), 글 앞에 배치, 글 뒤에 배치 */
  placement?: ShapePlacement;
  _docIdx?: number;
}

// 문서 모델은 단락, 표, 도형의 배열입니다.
export type DocumentItem = ParagraphNode | TableNode | ShapeNode;
export type DocumentModel = DocumentItem[];