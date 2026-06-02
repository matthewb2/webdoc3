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

type DocumentModel = ParagraphNode[];
export default DocumentModel; // default로 내보냄

// 스레드 간 통신 메시지 타입
export type WorkerMessage =
  | { type: 'INIT_DOC'; payload: DocumentModel }
  | { type: 'EDIT_INSERT'; payload: { paragraphIndex: number; charIndex: number; text: string } }
  | { type: 'RENDER_READY'; payload: DocumentModel };