import parse, { isTable } from './lib/hwp.js/packages/parser/src/index.ts';
import type {
  CharShape,
  DocInfo,
  HWPDocument,
  Paragraph,
  TableControl,
} from './lib/hwp.js/packages/parser/src/index.ts';
import type {
  DocumentModel,
  ParagraphNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextRun,
} from './src/types';

// HWPChar.type 값은 hwp.js CharType enum 과 동일한 숫자입니다.
const CHAR_TYPE_CHAR = 0;
const CHAR_TYPE_EXTENDED = 2;

// 글자모양 속성 bit (한/글 5.0 문서 포맷 표 35)
const FONT_ATTR_ITALIC = 1 << 0;
const FONT_ATTR_BOLD = 1 << 1;
const FONT_ATTR_UNDERLINE_MASK = 0b11 << 2;
const FONT_ATTR_STRIKE_MASK = 0b111 << 18;

// 1pt = 96/72 px = 4/3 px
const PT_TO_PX = 4 / 3;

// HWP 5.0 문단 모양 정렬값: 0 양쪽정렬, 1 왼쪽, 2 오른쪽, 3 가운데 (4 배분·5 나눔은 양쪽으로 처리)
const PARAGRAPH_ALIGN_MAP: Record<number, 'left' | 'center' | 'right' | 'justify'> = {
  0: 'justify',
  1: 'left',
  2: 'right',
  3: 'center',
  4: 'justify',
  5: 'justify',
};

type ParagraphSegment =
  | { kind: 'text'; text: string; shapeIndex: number }
  | { kind: 'table'; table: TableControl };

export function parseHwpToDocumentModel(data: Uint8Array): DocumentModel {
  console.log('[Debug] parseHwpToDocumentModel 시작, 데이터 크기:', data.byteLength);
  const doc = parse(data, { type: 'array' }) as HWPDocument;
  console.log('[Debug] 파싱된 HWPDocument:', doc);
  const model: DocumentModel = [];

  doc.sections.forEach((section, sIndex) => {
    console.log(`[Debug] 섹션 ${sIndex} 처리 중, 단락 수:`, section.content.length);
    section.content.forEach((paragraph, pIndex) => {
      paragraphToModelItems(paragraph, doc.info, model, sIndex, pIndex);
    });
  });

  console.log('[Debug] 최종 생성된 DocumentModel:', model);
  return model;
}

function paragraphToModelItems(
  paragraph: Paragraph, 
  docInfo: DocInfo, 
  model: DocumentModel, 
  sIndex: number, 
  pIndex: number
): void {
  const segments: ParagraphSegment[] = [];

  let text = '';
  let pointerIndex = 0;
  let segmentShapeIndex = paragraph.shapeBuffer[0]?.shapeIndex ?? 0;
  let ctrlIndex = 0;

  const flushText = () => {
    if (text.length > 0) {
      segments.push({ kind: 'text', text, shapeIndex: segmentShapeIndex });
      text = '';
    }
  };

  paragraph.content.forEach((hwpChar, index) => {
    while (pointerIndex + 1 < paragraph.shapeBuffer.length && paragraph.shapeBuffer[pointerIndex + 1].pos <= index) {
      pointerIndex += 1;
    }

    const currentShapeIndex = paragraph.shapeBuffer[pointerIndex]?.shapeIndex ?? segmentShapeIndex;
    if (currentShapeIndex !== segmentShapeIndex) {
      flushText();
      segmentShapeIndex = currentShapeIndex;
    }

    if (hwpChar.type === CHAR_TYPE_EXTENDED) {
      const control = paragraph.controls[ctrlIndex];
      ctrlIndex += 1;
      console.log(`[Debug] [S${sIndex}-P${pIndex}] 확장 컨트롤 발견 (ctrlIndex: ${ctrlIndex - 1}):`, control);

      if (isTable(control)) {
        flushText();
        segments.push({ kind: 'table', table: control });
        console.log(`[Debug] [S${sIndex}-P${pIndex}] 테이블 컨트롤 세그먼트 추가됨`);
      }
      return;
    }

    text += hwpCharToText(hwpChar);
  });

  flushText();

  // 정렬은 문단 헤더의 shapeIndex가 가리키는 문단 모양(paragraphShapes)의 align을 따른다
  const paraShapeAlign = docInfo.paragraphShapes[paragraph.shapeIndex]?.align;
  const paraAlign = paraShapeAlign !== undefined ? PARAGRAPH_ALIGN_MAP[paraShapeAlign] : undefined;

  segments.forEach((segment, segIndex) => {
    if (segment.kind === 'text') {
      const runs = styledRuns(docInfo, segment.text, segment.shapeIndex);
      if (runs.length > 0) {
        const node: ParagraphNode = { type: 'paragraph', children: runs };
        if (paraAlign) node.align = paraAlign;
        model.push(node);
      }
    } else {
      console.log(`[Debug] [S${sIndex}-P${pIndex}] 세그먼트 #${segIndex}: 테이블 노드 변환 시작`);
      model.push(tableToNode(segment.table, docInfo));
    }
  });
}

function paragraphToRuns(paragraph: Paragraph, docInfo: DocInfo): TextRun[] {
  const runs: TextRun[] = [];

  let text = '';
  let pointerIndex = 0;
  let currentShapeIndex = paragraph.shapeBuffer[0]?.shapeIndex ?? 0;
  let ctrlIndex = 0;

  const flush = () => {
    if (text.length > 0) {
      runs.push(...styledRuns(docInfo, text, currentShapeIndex));
      text = '';
    }
  };

  paragraph.content.forEach((hwpChar, index) => {
    while (pointerIndex + 1 < paragraph.shapeBuffer.length && paragraph.shapeBuffer[pointerIndex + 1].pos <= index) {
      pointerIndex += 1;
    }

    const shapeIndex = paragraph.shapeBuffer[pointerIndex]?.shapeIndex ?? currentShapeIndex;
    if (shapeIndex !== currentShapeIndex) {
      flush();
      currentShapeIndex = shapeIndex;
    }

    if (hwpChar.type === CHAR_TYPE_EXTENDED) {
      ctrlIndex += 1;
      return;
    }

    text += hwpCharToText(hwpChar);
  });

  flush();

  return runs;
}

function styledRuns(docInfo: DocInfo, text: string, shapeIndex: number): TextRun[] {
  const run: TextRun = { text };
  
  // [오류 수정 및 방어 코드] getCharShape / getCharShpe 오타 대응
  const charShape: CharShape | undefined = 
    (typeof (docInfo as any).getCharShape === 'function' ? (docInfo as any).getCharShape(shapeIndex) : undefined) ??
    (typeof (docInfo as any).getCharShpe === 'function' ? (docInfo as any).getCharShpe(shapeIndex) : undefined);

  if (!charShape) {
    console.warn(`[Debug] shapeIndex ${shapeIndex}에 해당하는 CharShape를 찾을 수 없습니다.`);
    return [run];
  }

  const fontSizePt = charShape.fontBaseSize * (charShape.fontRatio[0] / 100);
  run.fontSize = fontSizePt * PT_TO_PX;

  const fontFace = docInfo.fontFaces[charShape.fontId[0]];
  if (fontFace && fontFace.name) {
    run.fontFamily = typeof (fontFace as any).getFontFamily === 'function' 
      ? (fontFace as any).getFontFamily() 
      : fontFace.name;
  }

  const attr = charShape.attr;
  run.italic = (attr & FONT_ATTR_ITALIC) !== 0;
  run.bold = (attr & FONT_ATTR_BOLD) !== 0;
  run.underline = (attr & FONT_ATTR_UNDERLINE_MASK) !== 0;
  run.strike = (attr & FONT_ATTR_STRIKE_MASK) !== 0;

  const [r, g, b] = charShape.color;
  run.color = `rgb(${r}, ${g}, ${b})`;

  return [run];
}

function tableToNode(table: TableControl, docInfo: DocInfo): TableNode {
  console.log('[Debug] tableToNode 실행, 행 개수:', table.content?.length);
  const rows: TableRowNode[] = table.content.map((cells) => {
    const rowCells: TableCellNode[] = cells.map((cell) => {
      const children: TextRun[] = [];
      cell.items.forEach((paragraph) => {
        children.push(...paragraphToRuns(paragraph, docInfo));
      });
      return { type: 'table-cell', children };
    });
    return { type: 'table-row', cells: rowCells };
  });

  return { type: 'table', rows };
}

function hwpCharToText(hwpChar: { type: number; value: number | string }): string {
  if (hwpChar.type !== CHAR_TYPE_CHAR) return '';

  if (typeof hwpChar.value === 'string') return hwpChar.value;

  // 0(빈 문자), 10(줄바꿈), 13(단락 끝)은 본문 텍스트로 담지 않음
  if (hwpChar.value === 13 || hwpChar.value === 10 || hwpChar.value === 0) return '';

  return String.fromCharCode(hwpChar.value);
}