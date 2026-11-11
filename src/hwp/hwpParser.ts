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
      const before = model.length;
      paragraphToModelItems(paragraph, doc.info, model, sIndex, pIndex);
      const added = model.slice(before).map((it) => {
        if (it.type === 'paragraph') return `p("${(it.children || []).map((r) => r.text || '').join('').slice(0, 20)}")`;
        if (it.type === 'table') return `table(${it.rows?.length || 0}x${it.rows?.[0]?.cells?.length || 0})`;
        return (it as any).type;
      });
      console.log(`[hwp-parse] S${sIndex} P${pIndex} -> added ${added.length}:`, added);
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
  const paraShapeAlign = paraShape?.align;
  const paraAlign = paraShapeAlign !== undefined ? PARAGRAPH_ALIGN_MAP[paraShapeAlign] : undefined;
  const spaceBefore = hwpUnitToPx(paraShape?.marginTop);
  const spaceAfter = hwpUnitToPx(paraShape?.marginBottom);
  // HWP 문단 모양의 줄 간격(퍼센트). 범위를 벗어난 값은 기본값을 사용한다.
  const lineSpacing = normalizeLineSpacing(paraShape?.lineSpacing);

  // 같은 HWP 문단 내에서 표 컨트롤이 텍스트보다 앞에 나오고 뒤에 텍스트가 이어지는 경우,
  // 시각적 읽기 순서상 텍스트(예: 제목)를 표보다 먼저 배치한다.
  const orderedSegments = (() => {
    const firstTable = segments.findIndex((s) => s.kind === 'table');
    const firstText = segments.findIndex((s) => s.kind === 'text');
    if (firstTable >= 0 && firstText > firstTable) {
      const textSegs = segments.filter((s) => s.kind === 'text');
      const otherSegs = segments.filter((s) => s.kind !== 'text');
      console.log(`[hwp-parse] S${sIndex} P${pIndex} reorder segments: text-before-table`, {
        before: segments.map((s) => s.kind),
        after: [...textSegs, ...otherSegs].map((s) => s.kind),
      });
      return [...textSegs, ...otherSegs];
    }
    return segments;
  })();

  // 수정: 내용이 없는 빈 문단(segments가 비어있는 경우) 처리
  if (orderedSegments.length === 0) {
    const node: ParagraphNode = {
      type: 'paragraph',
      children: [{ text: '' }] // 빈 텍스트 런을 넣어 주어야 레이아웃 엔진이 빈 줄 높이를 계산합니다.
    };
    if (paraAlign) node.align = paraAlign;
    if (lineSpacing) node.lineSpacing = lineSpacing;
    model.push(node);
  } else {
    orderedSegments.forEach((segment, segIndex) => {
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
        if (lineSpacing) node.lineSpacing = lineSpacing;
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

function normalizeLineSpacing(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !isFinite(value)) return undefined;
  if (value < 50 || value > 500) return undefined;
  return Math.round(value);
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
  // 1. HWP 규격: 글자 크기는 1/100 pt(HWPUNIT) 단위 (예: 1000 = 10pt)
  const rawBaseSize = (charShape as any).fontBaseSize ?? (charShape as any).height ?? (charShape as any).baseSize ?? 1000;
  let basePt: number;
  if (rawBaseSize >= 100) {
    basePt = rawBaseSize / 100;
  } else if (rawBaseSize > 0) {
    // 일부 파서/데이터에서 pt 단위로 들어오는 경우 보정
    basePt = rawBaseSize;
  } else {
    basePt = 10;
  }
  // 비정상 값 방어 (잘못된 배율 보정 제거)
  if (!Number.isFinite(basePt) || basePt <= 0) basePt = 10;
  if (basePt > 200) basePt = basePt / 100; // 단위 혼동 방어
  basePt = Math.max(1, Math.min(200, basePt));

  // 2. pt -> px (1pt = 4/3px)
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
  const rowCount = Math.max(0, Number((table as any).rowCount) || (table.content?.length || 0));
  const colCount = Math.max(0, Number((table as any).columnCount) || 0);
  console.log('[Debug] tableToNode 실행, rows:', table.content?.length, 'rowCount:', rowCount, 'columnCount:', colCount);

  // 병합 가림 셀 판정용 점유 맵 및 열 너비 수집
  const covered = new Set<string>();
  const colWidthHu: number[] = colCount > 0 ? Array(colCount).fill(0) : [];
  const byPos = new Map<string, any>();

  (table.content || []).forEach((cells, rowIdx) => {
    (cells || []).forEach((cell: any) => {
      const attr = cell.attribute || cell.attr || {};
      const row = Number.isFinite(attr.row) ? attr.row : rowIdx;
      const col = Number.isFinite(attr.column) ? attr.column : 0;
      const rowSpan = Math.max(1, attr.rowSpan ?? 1);
      const colSpan = Math.max(1, attr.colSpan ?? 1);
      const w = Number(attr.width) || 0;
      byPos.set(`${row},${col}`, cell);

      if (w > 0 && colCount > 0) {
        if (colSpan === 1 && col >= 0 && col < colCount) {
          if (!colWidthHu[col]) colWidthHu[col] = w;
        } else if (colSpan > 1) {
          const per = w / colSpan;
          for (let c = col; c < col + colSpan && c < colCount; c++) {
            if (c >= 0 && !colWidthHu[c]) colWidthHu[c] = per;
          }
        }
      }
      for (let r = row; r < row + rowSpan; r++) {
        for (let c = col; c < col + colSpan; c++) {
          if (r === row && c === col) continue;
          covered.add(`${r},${c}`);
        }
      }
    });
  });

  const effectiveColCount = colCount > 0 ? colCount : Math.max(1, ...Array.from(byPos.keys()).map((k) => parseInt(k.split(',')[1], 10) + 1), 1);
  const effectiveRowCount = rowCount > 0 ? rowCount : (table.content?.length || 0);

  const rows: TableRowNode[] = [];
  for (let r = 0; r < effectiveRowCount; r++) {
    const rowCells: TableCellNode[] = [];
    for (let c = 0; c < effectiveColCount; c++) {
      const key = `${r},${c}`;
      const cell = byPos.get(key);
      if (cell) {
        const children: TextRun[] = [];
        (cell.items || []).forEach((paragraph: any) => {
          children.push(...paragraphToRuns(paragraph, docInfo));
        });
        if (children.length === 0) children.push({ text: '' });
        const node: TableCellNode = { type: 'table-cell', children };
        const attr = cell.attribute || cell.attr || {};
        if (covered.has(key)) {
          node.merged = true;
        } else {
          if ((attr.colSpan ?? 1) > 1) node.colSpan = attr.colSpan;
          if ((attr.rowSpan ?? 1) > 1) node.rowSpan = attr.rowSpan;
        }
        rowCells.push(node);
      } else if (covered.has(key)) {
        rowCells.push({ type: 'table-cell', children: [], merged: true });
      } else {
        // missing cell placeholder
        rowCells.push({ type: 'table-cell', children: [{ text: '' }] });
      }
    }
    rows.push({ type: 'table-row', cells: rowCells });
  }

  const tableNode: TableNode = { type: 'table', rows };
  if (effectiveColCount > 0) {
    const px = (colWidthHu.length === effectiveColCount ? colWidthHu : Array(effectiveColCount).fill(0)).map((w) => (w > 0 ? Math.round(w * HWPUNIT_TO_PX * 100) / 100 : 0));
    const known = px.filter((w) => w > 0);
    if (known.length > 0) {
      const avg = known.reduce((a, b) => a + b, 0) / known.length;
      tableNode.colWidths = px.map((w) => (w > 0 ? w : avg));
    }
  }

  // 테두리: borderFill을 해석할 수 있을 때만 "테두리 없음"을 확정 (미해석/불명은 기본 실선 유지)
  try {
    const tableBfId = (table as any).borderFillId ?? (table as any).record?.borderFillId ?? 0;
    const tableBf = getBorderFill(docInfo, tableBfId);
    let hasVisible = tableBf ? borderFillHasVisibleBorder(tableBf) : false;
    let resolvedAny = !!tableBf;

    if (!hasVisible) {
      outer: for (const row of (table.content || [])) {
        for (const cell of (row || [])) {
          const cid = (cell as any).borderFillId ?? (cell as any).attribute?.borderFillId ?? 0;
          const cbf = cid ? getBorderFill(docInfo, cid) : null;
          if (cbf) {
            resolvedAny = true;
            if (borderFillHasVisibleBorder(cbf)) { hasVisible = true; break outer; }
          }
        }
      }
    }

    // 해석된 borderFill들이 모두 비가시일 때만 테두리 없음으로 판정
    if (resolvedAny && !hasVisible) tableNode.borderStyle = 'none';
  } catch (e) {
    console.warn('[hwp-parse] border style detect failed', e);
  }

  console.log('[Debug] tableToNode grid=', `${effectiveRowCount}x${effectiveColCount}`, 'colWidths(px)=', tableNode.colWidths, 'total=', tableNode.colWidths?.reduce((a, b) => a + b, 0), 'borderStyle=', tableNode.borderStyle);
  return tableNode;
}

function getBorderFill(docInfo: DocInfo, id: number): any | null {
  const list = (docInfo as any).borderFills as any[] | undefined;
  if (!Array.isArray(list) || !id || id <= 0) return null;
  return list[id - 1] ?? list[id] ?? null;
}

function borderFillHasVisibleBorder(bf: any): boolean {
  if (!bf) return false;
  const borders = bf.borders;
  if (Array.isArray(borders)) {
    if (borders.some((b: any) => b && typeof b.width === 'number' && b.width > 0)) return true;
  }
  return false;
}

function hwpCharToText(hwpChar: { type: number; value: number | string }): string {
  if (hwpChar.type !== CHAR_TYPE_CHAR) return '';

  if (typeof hwpChar.value === 'string') return hwpChar.value;

  // 0(빈 문자), 10(줄바꿈), 13(단락 끝)은 본문 텍스트로 담지 않음
  if (hwpChar.value === 13 || hwpChar.value === 10 || hwpChar.value === 0) return '';

  return String.fromCharCode(hwpChar.value);
}
