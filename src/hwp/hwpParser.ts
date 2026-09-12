import parse, { isTable } from '@hwp.js/parser';
import type { HWPDocument, Paragraph, TableControl } from '@hwp.js/parser';
import type {
  DocumentModel,
  ParagraphNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '../types';

// HWPChar.type 값은 hwp.js CharType enum 과 동일한 숫자입니다.
const CHAR_TYPE_CHAR = 0;
const CHAR_TYPE_EXTENDED = 2;

export function parseHwpToDocumentModel(data: Uint8Array): DocumentModel {
  const doc = parse(data, { type: 'array' }) as HWPDocument;
  const model: DocumentModel = [];

  doc.sections.forEach((section) => {
    section.content.forEach((paragraph) => {
      paragraphToModelItems(paragraph, model);
    });
  });

  return model;
}

function paragraphToModelItems(paragraph: Paragraph, model: DocumentModel): void {
  let text = '';
  let ctrlIndex = 0;

  paragraph.content.forEach((hwpChar) => {
    if (hwpChar.type === CHAR_TYPE_EXTENDED) {
      const control = paragraph.controls[ctrlIndex];
      ctrlIndex += 1;

      if (isTable(control)) {
        if (text.length > 0) {
          model.push(makeParagraphNode(text));
          text = '';
        }
        model.push(convertTable(control));
      }
      return;
    }

    text += hwpCharToText(hwpChar);
  });

  if (text.length > 0) {
    model.push(makeParagraphNode(text));
  }
}

function hwpCharToText(hwpChar: { type: number; value: number | string }): string {
  if (hwpChar.type !== CHAR_TYPE_CHAR) return '';

  if (typeof hwpChar.value === 'string') return hwpChar.value;

  // 0(빈 문자), 10(줄바꿈), 13(단락 끝)은 본문 텍스트로 담지 않음
  if (hwpChar.value === 13 || hwpChar.value === 10 || hwpChar.value === 0) return '';

  return String.fromCharCode(hwpChar.value);
}

function convertTable(table: TableControl): TableNode {
  const rows: TableRowNode[] = table.content.map((cells) => {
    const rowCells: TableCellNode[] = cells.map((cell) => {
      const cellText = cell.items.map((paragraph) => paragraphText(paragraph)).join('');
      return { type: 'table-cell', children: [{ text: cellText }] };
    });
    return { type: 'table-row', cells: rowCells };
  });

  return { type: 'table', rows };
}

function paragraphText(paragraph: Paragraph): string {
  return paragraph.content.map(hwpCharToText).join('');
}

function makeParagraphNode(text: string): ParagraphNode {
  return { type: 'paragraph', children: [{ text }] };
}