import type { DocumentModel, ParagraphNode, TableNode, TextRun } from '../types';

export interface DocBlockOutline {
  id: string; // item_<docIdx>
  index: number;
  type: 'paragraph' | 'table' | 'shape';
  preview: string;
}

function runText(runs: TextRun[] | undefined): string {
  return (runs || []).map((r) => r.text || '').join('');
}

export function getDocumentOutline(model: DocumentModel): DocBlockOutline[] {
  return model.map((item, index) => {
    const id = `item_${index}`;
    if (item.type === 'paragraph') {
      const text = runText((item as ParagraphNode).children);
      return { id, index, type: 'paragraph', preview: text.slice(0, 120) };
    }
    if (item.type === 'table') {
      const t = item as TableNode;
      const firstCell = t.rows?.[0]?.cells?.[0];
      const text = runText(firstCell?.children);
      return { id, index, type: 'table', preview: `[표 ${t.rows?.length || 0}행] ${text}`.slice(0, 120) };
    }
    return { id, index, type: 'shape', preview: `[도형 ${(item as any).shape || ''}]` };
  });
}

export function parseBlockId(blockId: string): number {
  const m = /^item_(\d+)$/.exec(blockId || '');
  if (!m) throw new Error(`잘못된 blockId: ${blockId}`);
  return parseInt(m[1], 10);
}

export function patchParagraphText(model: DocumentModel, blockId: string, newText: string): DocumentModel {
  const idx = parseBlockId(blockId);
  const item = model[idx];
  if (!item || item.type !== 'paragraph') throw new Error(`문단 블록을 찾을 수 없습니다: ${blockId}`);
  const p = { ...(item as ParagraphNode) };
  const first = p.children?.[0] ? { ...p.children[0] } : ({ text: '' } as TextRun);
  // 스타일은 첫 run 유지, 텍스트 교체
  p.children = [{ ...first, text: newText }];
  const next = model.slice();
  next[idx] = p;
  return next;
}

export function insertParagraph(model: DocumentModel, targetId: string, newText: string, position: 'before' | 'after' = 'after'): { model: DocumentModel; newBlockId: string } {
  const idx = parseBlockId(targetId);
  if (idx < 0 || idx >= model.length) throw new Error(`대상 블록을 찾을 수 없습니다: ${targetId}`);
  const at = position === 'before' ? idx : idx + 1;
  const para: ParagraphNode = { type: 'paragraph', children: [{ text: newText }] };
  const next = model.slice();
  next.splice(at, 0, para);
  return { model: next, newBlockId: `item_${at}` };
}

export function deleteBlock(model: DocumentModel, blockId: string): DocumentModel {
  const idx = parseBlockId(blockId);
  if (idx < 0 || idx >= model.length) throw new Error(`블록을 찾을 수 없습니다: ${blockId}`);
  if (model.length <= 1) throw new Error('마지막 블록은 삭제할 수 없습니다.');
  const next = model.slice();
  next.splice(idx, 1);
  return next;
}

export function updateTableCell(model: DocumentModel, tableId: string, rowIndex: number, colIndex: number, newText: string): DocumentModel {
  const idx = parseBlockId(tableId);
  const item = model[idx];
  if (!item || item.type !== 'table') throw new Error(`표 블록을 찾을 수 없습니다: ${tableId}`);
  const table = item as TableNode;
  const row = table.rows?.[rowIndex];
  const cell = row?.cells?.[colIndex];
  if (!row || !cell) throw new Error(`셀을 찾을 수 없습니다: ${tableId} [${rowIndex},${colIndex}]`);
  const next = model.slice();
  const nextTable: TableNode = { ...table, rows: table.rows.map((r, ri) => ri !== rowIndex ? r : ({
    ...r,
    cells: r.cells.map((c, ci) => {
      if (ci !== colIndex) return c;
      const first = c.children?.[0] ? { ...c.children[0] } : ({ text: '' } as TextRun);
      return { ...c, children: [{ ...first, text: newText }] };
    }),
  })) };
  next[idx] = nextTable;
  return next;
}

export type ToolCall =
  | { name: 'patch_paragraph'; args: { blockId: string; newText: string } }
  | { name: 'insert_paragraph'; args: { targetId: string; newText: string; position?: 'before' | 'after' } }
  | { name: 'delete_block'; args: { blockId: string } }
  | { name: 'update_table_cell'; args: { tableId: string; rowIndex: number; colIndex: number; newText: string } };

export function applyToolCall(model: DocumentModel, call: ToolCall): { model: DocumentModel; result: any } {
  switch (call.name) {
    case 'patch_paragraph':
      return { model: patchParagraphText(model, call.args.blockId, call.args.newText), result: { ok: true, blockId: call.args.blockId } };
    case 'insert_paragraph': {
      const r = insertParagraph(model, call.args.targetId, call.args.newText, call.args.position || 'after');
      return { model: r.model, result: { ok: true, newBlockId: r.newBlockId } };
    }
    case 'delete_block':
      return { model: deleteBlock(model, call.args.blockId), result: { ok: true, blockId: call.args.blockId } };
    case 'update_table_cell':
      return { model: updateTableCell(model, call.args.tableId, call.args.rowIndex, call.args.colIndex, call.args.newText), result: { ok: true } };
    default:
      throw new Error(`지원하지 않는 tool: ${(call as any).name}`);
  }
}
