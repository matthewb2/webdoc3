import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import nspell from 'nspell';

export interface SavedUserWordEntry {
  word: string;
  model?: string;
}

export type SavedUserWordItem = string | SavedUserWordEntry;

export type AddUserWordResult =
  | { ok: true; word: string }
  | { ok: false; reason: 'EMPTY_WORD' };

export interface SpellParagraphInput {
  id: string;
  text: string;
}

export interface SpellErrorItem {
  start: number;
  end: number;
  org: string;
  suggestions: string[];
}

export interface SpellParagraphResult {
  id: string;
  errors: SpellErrorItem[];
}

export interface CheckParagraphsOptions {
  maxSuggestions?: number;
  minWordLength?: number;
}

export interface SpellCheckerInstance {
  correct(word: string): boolean;
  suggest(word: string): string[];
  add(word: string, model?: string): this;
  personal(value: string | Buffer): this;
  remove(word: string): this;
}

let spellInstance: SpellCheckerInstance | null = null;
const addedWords = new Set<string>();

function getDictDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'dict')
    : path.join(__dirname, '..', 'resources', 'dict');
}

function getUserDictPath(): string {
  return path.join(app.getPath('userData'), 'custom-ko-words.json');
}

function loadUserWordsFromDisk(): SavedUserWordItem[] {
  const filePath = getUserDictPath();
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedUserWordItem[]) : [];
  } catch (err) {
    console.error('Failed to read user dictionary:', err);
    return [];
  }
}

function saveUserWordsToDisk(): void {
  const filePath = getUserDictPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify([...addedWords], null, 2), 'utf8');
}

export function initSpellChecker(): SpellCheckerInstance {
  if (spellInstance) return spellInstance;

  const dictDir = getDictDir();
  const aff = fs.readFileSync(path.join(dictDir, 'ko.aff'));
  const dic = fs.readFileSync(path.join(dictDir, 'ko.dic'));

  spellInstance = nspell(aff, dic) as unknown as SpellCheckerInstance;

  const savedWords = loadUserWordsFromDisk();
  for (const item of savedWords) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed) {
        spellInstance.add(trimmed);
        addedWords.add(trimmed);
      }
    } else if (item && typeof item.word === 'string') {
      const trimmedWord = item.word.trim();
      if (trimmedWord) {
        if (item.model) {
          spellInstance.add(trimmedWord, item.model);
        } else {
          spellInstance.add(trimmedWord);
        }
        addedWords.add(trimmedWord);
      }
    }
  }

  return spellInstance;
}

export function addUserWord(word: string, model?: string): AddUserWordResult {
  const trimmed = (word || '').trim();
  if (!trimmed) {
    return { ok: false, reason: 'EMPTY_WORD' };
  }

  const spell = initSpellChecker();
  if (model) {
    spell.add(trimmed, model);
  } else {
    spell.add(trimmed);
  }

  addedWords.add(trimmed);
  saveUserWordsToDisk();

  return { ok: true, word: trimmed };
}

export function applyPersonalList(words: string[]): void {
  const spell = initSpellChecker();
  if (!Array.isArray(words) || words.length === 0) return;

  const normalized = words.map((w) => w.trim()).filter(Boolean);
  if (normalized.length === 0) return;

  spell.personal(normalized.join('\n'));
  for (const w of normalized) {
    addedWords.add(w);
  }
  saveUserWordsToDisk();
}

export function checkParagraphs(
  paragraphs: SpellParagraphInput[],
  options: CheckParagraphsOptions = {}
): SpellParagraphResult[] {
  const spell = initSpellChecker();
  const maxSuggestions = options.maxSuggestions ?? 5;
  const minWordLength = options.minWordLength ?? 1;

  if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
    return [];
  }

  return paragraphs.map(({ id, text }) => {
    const errors: SpellErrorItem[] = [];
    const sourceText = typeof text === 'string' ? text : '';
    const wordRegex = /[가-힣]+/g;
    let match: RegExpExecArray | null;

    while ((match = wordRegex.exec(sourceText)) !== null) {
      const word = match[0];
      if (word.length < minWordLength) continue;

      if (!spell.correct(word)) {
        const start = match.index;
        const end = start + word.length;
        const suggestions = spell.suggest(word).slice(0, maxSuggestions);
        errors.push({ start, end, org: word, suggestions });
      }
    }

    return { id, errors };
  });
}
