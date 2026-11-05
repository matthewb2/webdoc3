import parse, { isTable } from '@hwp.js/parser';
import type {
  CharShape,
  DocInfo,
  HWPDocument,
  Paragraph,
  TableControl,
} from '@hwp.js/parser';
import type {
  DocumentModel,
  ParagraphNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextRun,
} from '../types';

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

// HWPUNIT(1/7200 inch) -> px(96 DPI). 1pt(100 HWPUNIT) = 4/3 px
const HWPUNIT_TO_PX = 96 / 7200;

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
  const modelStart = model.length;
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

  // 정렬/간격은 문단 헤더의 shapeIndex가 가리키는 문단 모양(paragraphShapes)을 따른다
  const paraShape = docInfo.paragraphShapes[paragraph.shapeIndex];
  // [디버깅 추가] paraShape 객체 전체 구조와 속성 확인
  console.log(`[Debug] [S${sIndex}-P${pIndex}] paraShape 구조:`, paraShape);
  const paraShapeAlign = paraShape?.align;
  const paraAlign = paraShapeAlign !== undefined ? PARAGRAPH_ALIGN_MAP[paraShapeAlign] : undefined;
  const spaceBefore = hwpUnitToPx(paraShape?.marginTop);
  const spaceAfter = hwpUnitToPx(paraShape?.marginBottom);
  
  // [수정] HWP 문단 모양에서 줄간격(lineSpacing) 추출 
  // HWP 파일 포맷에 따라 lineSpacing 값은 백분율(예: 180) 혹은 상대 비율(예: 1.8)로 저장됩니다.
  // 보통 hwp.js 파서는 백분율 값(또는 퍼센트 단위 정수)을 제공하므로 그대로 가져오거나 조정합니다.
  const lineSpacing = paraShape?.lineSpacing;

  // 수정: 내용이 없는 빈 문단(segments가 비어있는 경우) 처리
  if (segments.length === 0) {
    const node: ParagraphNode = { 
      type: 'paragraph', 
      children: [{ text: '' }] // 빈 텍스트 런을 넣어 주어야 레이아웃 엔진이 빈 줄 높이를 계산합니다.
    };
    if (paraAlign) node.align = paraAlign;
    if (lineSpacing) node.lineSpacing = lineSpacing; // 추가
    model.push(node);
  } else {
    segments.forEach((segment, segIndex) => {
      if (segment.kind === 'text') {
        const runs = styledRuns(docInfo, segment.text, segment.shapeIndex);
        console.log(`[ParagraphStyleInfo] S${sIndex}-P${pIndex}-Seg${segIndex} 텍스트: "${segment.text.slice(0, 30)}..."`, {
          shapeIndex: segment.shapeIndex,
          runs
        });
        const node: ParagraphNode = { 
          type: 'paragraph', 
          children: runs.length > 0 ? runs : [{ text: '' }] 
        };
        if (paraAlign) node.align = paraAlign;
        if (lineSpacing !== undefined) node.lineSpacing = lineSpacing; // [추가]
        model.push(node);
      } else {
        console.log(`[Debug] [S${sIndex}-P${pIndex}] 세그먼트 #${segIndex}: 테이블 노드 변환 시작`);
        model.push(tableToNode(segment.table, docInfo));
      }
    });
  }

  applyParagraphSpacing(model, modelStart, spaceBefore, spaceAfter);
}

/**
 * 한 HWP 문단이 여러 모델 항목(텍스트/표)으로 나뉠 수 있으므로
 * 위 간격은 첫 문단에, 아래 간격은 마지막 문단에만 적용한다.
 */
function applyParagraphSpacing(
  model: DocumentModel,
  startIndex: number,
  spaceBefore: number,
  spaceAfter: number,
): void {
  if (spaceBefore > 0) {
    for (let i = startIndex; i < model.length; i++) {
      const item = model[i];
      if (item.type === 'paragraph') {
        item.spaceBefore = spaceBefore;
        break;
      }
    }
  }
  if (spaceAfter > 0) {
    for (let i = model.length - 1; i >= startIndex; i--) {
      const item = model[i];
      if (item.type === 'paragraph') {
        item.spaceAfter = spaceAfter;
        break;
      }
    }
  }
}

function hwpUnitToPx(value: number | undefined): number {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) return 0;
  return Math.round(value * HWPUNIT_TO_PX * 100) / 100;
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
  
  const charShape: CharShape | undefined = 
    (typeof (docInfo as any).getCharShape === 'function' ? (docInfo as any).getCharShape(shapeIndex) : undefined) ??
    (typeof (docInfo as any).getCharShpe === 'function' ? (docInfo as any).getCharShpe(shapeIndex) : undefined);

  if (!charShape) {
    console.warn(`[Debug] shapeIndex ${shapeIndex}에 해당하는 CharShape를 찾을 수 없습니다.`);
    return [run];
  }

  // 1. HWP 규격에 따른 폰트 기본 크기 추출 (1pt = 100 HWPUNIT)
  let rawBaseSize = charShape.fontBaseSize ?? 1000;
  let basePt = rawBaseSize >= 100 ? rawBaseSize / 100 : rawBaseSize;

  // 2. 예외적인 축소 케이스 방어 보정
  if (basePt < 10 && rawBaseSize < 100) {
    basePt = basePt * (100 / 30); 
  }

  // 3. 폰트 높이(Font Size)는 장평과 무관하게 순수 pt를 px로 변환 (1pt = 4/3px)
  run.fontSize = basePt * PT_TO_PX;

  console.log(`[CharShapeInfo] shapeIndex: ${shapeIndex}, rawBaseSize: ${rawBaseSize}, fontSizePt: ${basePt}, fontSizePx: ${run.fontSize}`);

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
  // 병합 가림 셀 판정용 점유 맵
  const covered = new Set<string>();
  table.content.forEach((cells) => {
    cells.forEach((cell: any) => {
      const attr = cell.attribute;
      if (!attr) return;
      const row = attr.row ?? 0;
      const col = attr.column ?? 0;
      const rowSpan = Math.max(1, attr.rowSpan ?? 1);
      const colSpan = Math.max(1, attr.colSpan ?? 1);
      for (let r = row; r < row + rowSpan; r++) {
        for (let c = col; c < col + colSpan; c++) {
          if (r === row && c === col) continue;
          covered.add(`${r},${c}`);
        }
      }
    });
  });
  const rows: TableRowNode[] = table.content.map((cells) => {
    const rowCells: TableCellNode[] = cells.map((cell: any) => {
      const children: TextRun[] = [];
      cell.items.forEach((paragraph: any) => {
        children.push(...paragraphToRuns(paragraph, docInfo));
      });
      const node: TableCellNode = { type: 'table-cell', children };
      const attr = cell.attribute;
      if (attr && covered.has(`${attr.row ?? 0},${attr.column ?? 0}`)) {
        node.merged = true;
      } else if (attr) {
        if ((attr.colSpan ?? 1) > 1) node.colSpan = attr.colSpan;
        if ((attr.rowSpan ?? 1) > 1) node.rowSpan = attr.rowSpan;
      }
      return node;
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
