// 문서의 최소 단위 (텍스트와 스타일)
export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
}

// 단락(Paragraph) 구조
export interface ParagraphNode {
  type: 'paragraph';
  children: TextRun[];
}

// 글자별 너비를 저장할 딕셔너리 타입 (예: { "가": 14, "a": 8.5 })
export interface FontMetrics {
  [char: string]: number;
}

export type DocumentModel = ParagraphNode[];

// 스레드 간 통신 메시지 타입
export type WorkerMessage =
  | { type: 'INIT_DOC'; payload: DocumentModel }
  | { type: 'EDIT_INSERT'; payload: { paragraphIndex: number; charIndex: number; text: string } }
  | { type: 'RENDER_READY'; payload: DocumentModel };