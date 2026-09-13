declare module '@hwp.js/parser' {
  export interface HWPChar {
    type: number;
    value: number | string;
  }

  export interface ShapePointer {
    pos: number;
    shapeIndex: number;
  }

  export interface Paragraph {
    content: HWPChar[];
    controls: Array<{ id: number }>;
    shapeIndex: number;
    shapeBuffer: ShapePointer[];
    getShapeEndPos(index: number): number;
  }

  export interface TableColumnOption {
    column: number;
    row: number;
    colSpan: number;
    rowSpan: number;
    width: number;
    height: number;
    padding: [number, number, number, number];
    borderFillID?: number;
  }

  export class ParagraphList<P = TableColumnOption> {
    attribute: P;
    items: Paragraph[];
  }

  export class TableControl {
    id: number;
    rowCount: number;
    columnCount: number;
    content: ParagraphList[][];
  }

  export interface FontFace {
    name: string;
    alternative: string;
    default: string;
    getFontFamily(): string;
  }

  export interface CharShape {
    fontId: number[];
    fontScale: number[];
    fontSpacing: number[];
    fontRatio: number[];
    fontLocation: number[];
    fontBaseSize: number;
    attr: number;
    color: [number, number, number];
  }

  export interface ParagraphShape {
    align: number;
  }

  export interface DocInfo {
    sectionSize: number;
    charShapes: CharShape[];
    fontFaces: FontFace[];
    paragraphShapes: ParagraphShape[];
    getCharShpe(index: number): CharShape | undefined;
  }

  export interface Section {
    width: number;
    height: number;
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
    headerPadding: number;
    footerPadding: number;
    content: Paragraph[];
  }

  export interface HWPDocument {
    header: { version: number[] };
    info: DocInfo;
    sections: Section[];
  }

  export function isTable(control: { id: number }): control is TableControl;

  export default function parse(data: Uint8Array, options?: { type?: string }): HWPDocument;
}