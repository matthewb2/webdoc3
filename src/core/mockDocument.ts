import type { DocumentModel, ParagraphNode, TableNode, TableRowNode } from '../types';

// 기본 문서 로드 실패 시 폴백용 목업 문서 (순수 데이터)
export function buildTableTest(): { title: ParagraphNode; table: TableNode; trailing: ParagraphNode } {
  const sent = (n: number) => `표 분할 검증 문장 ${n}번입니다. 행 높이에 따라 페이지 나눔이 달라집니다.`;
  const longCell = (count: number) => {
    const parts: string[] = [];
    for (let i = 1; i <= count; i++) parts.push(sent(i));
    return parts.join(' ');
  };
  const drow = (a: string, b: string, c: string, bold = false): TableRowNode => ({
    type: 'table-row',
    cells: [
      { type: 'table-cell', children: [{ text: a, ...(bold ? { bold: true } : {}) }] },
      { type: 'table-cell', children: [{ text: b, ...(bold ? { bold: true } : {}) }] },
      { type: 'table-cell', children: [{ text: c, ...(bold ? { bold: true } : {}) }] },
    ],
  });
  const rows: TableRowNode[] = [
    drow('분류', '상세 내용 명세', '비고', true),
  ];
  for (let i = 1; i <= 6; i++) rows.push(drow(`항목 ${i}`, `내용 ${i}번 행입니다.`, '일반'));
  rows.push(drow('항목 7(장문)', longCell(12), '중요'));
  rows.push(drow('항목 8', '내용 8번 행입니다.', '일반'));
  rows.push(drow('항목 9', '내용 9번 행입니다.', '일반'));
  rows.push(drow('항목 10(거대)', longCell(30), '중요'));
  rows.push(drow('항목 11', '내용 11번 행입니다.', '일반'));
  rows.push(drow('항목 12', '내용 12번 행입니다.', '일반'));
  return {
    title: { type: 'paragraph', align: 'center', children: [{ text: 'cell split test' }] },
    table: { type: 'table', rows },
    trailing: { type: 'paragraph', children: [{ text: 'after split paragraph' }] },
  };
}

export function buildMockDocument(): DocumentModel {
  const mockDocument: DocumentModel = [
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    },
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    },
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    },
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    },
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    },
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.", bold: false }]
    }
  ];

  const tableTest = buildTableTest();
  return [tableTest.title, tableTest.table, tableTest.trailing, ...mockDocument];
}
