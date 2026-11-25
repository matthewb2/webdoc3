export type {
  DocumentItem,
  DocumentModel,
  ParagraphNode,
  ShapeKind,
  ShapeNode,
  ShapePlacement,
  TableBorderStyle,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextAlign,
  TextRun,
} from './core/documentModel';

import type { DocumentModel, TableBorderStyle, TextAlign } from './core/documentModel';

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
  | { type: 'INIT_SETTINGS'; payload: { charShape: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string }; lineSpacing?: number; pageMargins?: { top: number; right: number; bottom: number; left: number } } }
  | { type: 'SET_PAGE_MARGINS'; payload: { top: number; right: number; bottom: number; left: number } }
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
  | { type: 'EDIT_TABLE_COL_WIDTH'; payload: { tableDocIdx: number; colIndex: number; width: number; colWidths?: number[] } }
  | { type: 'EDIT_INSERT_TABLE'; payload: { paragraphIndex: number; charIndex: number; rows: number; cols: number } }
  | { type: 'EDIT_INSERT_SHAPE'; payload: { paragraphIndex: number; charIndex: number; shape: 'rect' | 'ellipse' | 'line' | 'arrow' } }
  | { type: 'EDIT_SHAPE_PLACEMENT'; payload: { docIdx: number; placement: 'default' | 'front' | 'back' } }
  | { type: 'EDIT_TABLE_BORDER'; payload: { tableDocIdx: number; borderStyle: TableBorderStyle } }
  | { type: 'EDIT_COLOR'; payload: { paragraphIndices: number[]; color?: string; backgroundColor?: string } }
  | { type: 'EDIT_FONT_RANGE'; payload: { paragraphIndex: number; fromCharIndex: number; endCharIndex: number; fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean } }
  | { type: 'EDIT_COLOR_RANGE'; payload: { paragraphIndex: number; fromCharIndex: number; endCharIndex: number; color?: string; backgroundColor?: string } }
  | { type: 'EDIT_FIND'; payload: { query: string; from: { docIdx: number; charIndex: number; isInsideTable: boolean; rowIndex: number; cellIndex: number } | null; direction: 'forward' | 'backward' } }
  | { type: 'EDIT_REPLACE'; payload: { query: string; replacement: string; from: { docIdx: number; charIndex: number; isInsideTable: boolean; rowIndex: number; cellIndex: number } | null } }
  | { type: 'EDIT_REPLACE_ALL'; payload: { query: string; replacement: string } }
  | { type: 'EDIT_APPLY_STYLE'; payload: { paragraphIndices: number[]; align?: TextAlign; lineSpacing?: number; fontFamily?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string } }
  | { type: 'EDIT_INDENT'; payload: { paragraphIndices: number[]; leftIndent?: number; textIndent?: number; rightIndent?: number; tableCell?: { tableIdx: number; row: number; col: number; cellPara?: number } } };