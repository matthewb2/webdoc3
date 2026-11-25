export {};

declare global {
  interface SpellParagraphInput {
    id: string;
    text: string;
  }
  interface SpellErrorItem {
    start: number;
    end: number;
    org: string;
    suggestions: string[];
  }
  interface SpellParagraphResult {
    id: string;
    errors: SpellErrorItem[];
  }
  interface AddUserWordResultOk { ok: true; word: string }
  interface AddUserWordResultFail { ok: false; reason: 'EMPTY_WORD' }
  type AddUserWordResult = AddUserWordResultOk | AddUserWordResultFail;

  interface ElectronAPI {
    onMenuCommand?: (callback: (command: string) => void) => () => void;
    updateRecentFiles?: (names: string[]) => void;
    setRibbonCollapsed?: (collapsed: boolean) => void;
    setAiChatVisible?: (visible: boolean) => void;
    showSaveDialog?: (options: { defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<{ canceled: boolean; filePath?: string }>;
    writeFile?: (filePath: string, data: Uint8Array) => Promise<{ ok: boolean }>;
    readFile?: (filePath: string) => Promise<Uint8Array>;
    getRecentFiles?: () => Promise<Array<{ name: string; path: string }>>;
    addRecentFile?: (entry: { name: string; path: string }) => Promise<Array<{ name: string; path: string }>>;
    getSystemFonts?: () => Promise<string[]>;
    checkParagraphs?: (paragraphs: SpellParagraphInput[], options?: { maxSuggestions?: number; minWordLength?: number }) => Promise<SpellParagraphResult[]>;
    addUserWord?: (word: string, model?: string) => Promise<AddUserWordResult>;
  }

  interface Window {
    electronAPI?: ElectronAPI;
  }
}
