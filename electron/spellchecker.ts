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
  rule?: 'spelling' | 'spacing' | 'grammar';
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

const ATTACHED_JOSA_TOKENS = new Set([
  '은', '는', '이', '가', '을', '를', '과', '와',
  '에', '에서', '에게', '께', '한테', '로', '으로',
  '의', '도', '만', '까지', '부터', '조차', '마저', '처럼', '보다'
]);

/** 1) 붙여 쓴 어절 분할 검사: "학교에간다" -> "학교에 간다" */
function findMissingSpaceErrors(
  spell: SpellCheckerInstance,
  word: string,
  wordStart: number,
  maxSuggestions: number
): SpellErrorItem[] {
  if (word.length < 3 || spell.correct(word)) {
    return [];
  }

  const splitCandidates: string[] = [];
  for (let i = 1; i <= word.length - 1; i++) {
    const left = word.slice(0, i);
    const right = word.slice(i);
    if (left.length < 2 && right.length < 2) continue;
    if (spell.correct(left) && spell.correct(right)) {
      splitCandidates.push(`${left} ${right}`);
    }
  }

  if (splitCandidates.length === 0) return [];
  return [{
    start: wordStart,
    end: wordStart + word.length,
    org: word,
    suggestions: splitCandidates.slice(0, maxSuggestions),
    rule: 'spacing',
  }];
}

/** 2) 불필요한 공백 검사: "사과 를" -> "사과를" */
function findExtraSpaceErrors(
  spell: SpellCheckerInstance,
  text: string,
  maxSuggestions: number
): SpellErrorItem[] {
  const errors: SpellErrorItem[] = [];
  const pairRegex = /([가-힣]+)\s+([가-힣]+)/g;
  let match: RegExpExecArray | null;

  while ((match = pairRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const firstWord = match[1];
    const secondWord = match[2];
    const start = match.index;
    const end = start + fullMatch.length;
    const merged = `${firstWord}${secondWord}`;

    if (ATTACHED_JOSA_TOKENS.has(secondWord)) {
      errors.push({ start, end, org: fullMatch, suggestions: [merged], rule: 'spacing' });
      continue;
    }

    const firstValid = spell.correct(firstWord);
    const secondValid = spell.correct(secondWord);
    if ((!firstValid || !secondValid) && spell.correct(merged)) {
      errors.push({
        start, end, org: fullMatch,
        suggestions: [merged].slice(0, maxSuggestions),
        rule: 'spacing',
      });
    }
  }

  return errors;
}

/** 3) 고빈도 띄어쓰기 패턴 규칙 (의존명사/보조용언) */
function findCommonSpacingPatternErrors(text: string): SpellErrorItem[] {
  const errors: SpellErrorItem[] = [];
  const patterns: Array<{ regex: RegExp; replace: (m: RegExpExecArray) => string }> = [
    {
      // 의존명사: "할수" -> "할 수"
      regex: /([가-힣]+(?:할|될|갈|올|볼|줄|쓸|만들|먹을|있을|없을|하는|되는|가는|오는|있는|없는|한|된|간|온|본))(수|것|때|뿐|중)(?=[가-힣\s.,!?]|$)/g,
      replace: (m) => `${m[1]} ${m[2]}`,
    },
    {
      // "테스트 해봅니다" -> "테스트해 봅니다"류 보조용언 붙여쓰기 오탐 완화
      regex: /([가-힣]{2,})\s+(해\s*봅니다|합니다|했다|해요|하고|하면|해서)/g,
      replace: (m) => `${m[1]}${m[2]}`,
    },
  ];

  for (const { regex, replace } of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      errors.push({
        start: match.index,
        end: match.index + match[0].length,
        org: match[0],
        suggestions: [replace(match)],
        rule: 'spacing',
      });
    }
  }

  return errors;
}

function hasBatchim(ch: string): boolean {
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function getBatchim(ch: string): number {
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return -1;
  return (code - 0xac00) % 28;
}

/** 4) 조사 호응 검사: "가을는" -> "가을은" */
function findJosaAgreementErrors(word: string, wordStart: number): SpellErrorItem[] {
  if (word.length < 2) return [];
  const pairs: Array<[string, string]> = [['은', '는'], ['이', '가'], ['을', '를'], ['과', '와']];
  for (const [withBatchim, withoutBatchim] of pairs) {
    if (word.endsWith(withBatchim)) {
      const stem = word.slice(0, -withBatchim.length);
      if (stem.length < 1) continue;
      const prev = stem[stem.length - 1];
      if (!hasBatchim(prev)) {
        return [{ start: wordStart, end: wordStart + word.length, org: word, suggestions: [stem + withoutBatchim], rule: 'grammar' }];
      }
      return [];
    }
    if (word.endsWith(withoutBatchim)) {
      const stem = word.slice(0, -withoutBatchim.length);
      if (stem.length < 1) continue;
      const prev = stem[stem.length - 1];
      if (hasBatchim(prev)) {
        return [{ start: wordStart, end: wordStart + word.length, org: word, suggestions: [stem + withBatchim], rule: 'grammar' }];
      }
      return [];
    }
  }

  // 으로/로: ㄹ받침(8) 또는 받침 없음 -> 로, 그 외 받침 -> 으로
  if (word.endsWith('으로')) {
    const stem = word.slice(0, -2);
    if (stem.length >= 1) {
      const prev = stem[stem.length - 1];
      const jong = getBatchim(prev);
      if (jong === 0 || jong === 8) {
        return [{ start: wordStart, end: wordStart + word.length, org: word, suggestions: [stem + '로'], rule: 'grammar' }];
      }
    }
    return [];
  }
  if (word.endsWith('로') && !word.endsWith('으로')) {
    const stem = word.slice(0, -1);
    if (stem.length >= 1) {
      const prev = stem[stem.length - 1];
      const jong = getBatchim(prev);
      if (jong > 0 && jong !== 8) {
        return [{ start: wordStart, end: wordStart + word.length, org: word, suggestions: [stem + '으로'], rule: 'grammar' }];
      }
    }
    return [];
  }

  return [];
}

function dedupeErrors(errors: SpellErrorItem[]): SpellErrorItem[] {
  const seen = new Set<string>();
  const out: SpellErrorItem[] = [];
  for (const e of errors) {
    const k = `${e.start}:${e.end}:${e.org}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
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

    // 1) 고빈도 띄어쓰기 패턴 (명확한 규칙 우선)
    errors.push(...findCommonSpacingPatternErrors(sourceText));

    // 2) 불필요한 공백 (연속 어절 간)
    errors.push(...findExtraSpaceErrors(spell, sourceText, maxSuggestions));

    // 3) 단일 어절 검사: 조사 호응 -> 붙여쓰기 분할 -> 일반 철자 오류
    const wordRegex = /[가-힣]+/g;
    let match: RegExpExecArray | null;
    while ((match = wordRegex.exec(sourceText)) !== null) {
      const word = match[0];
      if (word.length < minWordLength) continue;
      const start = match.index;
      const end = start + word.length;

      // 이미 상위 규칙에서 잡힌 범위와 겹치면 건너뜀
      if (errors.some((e) => !(end <= e.start || start >= e.end))) continue;

      const josaErrors = findJosaAgreementErrors(word, start);
      if (josaErrors.length > 0) {
        errors.push(...josaErrors);
        continue;
      }

      if (!spell.correct(word)) {
        const missingSpace = findMissingSpaceErrors(spell, word, start, maxSuggestions);
        if (missingSpace.length > 0) {
          errors.push(...missingSpace);
        } else {
          const suggestions = spell.suggest(word).slice(0, maxSuggestions);
          errors.push({ start, end, org: word, suggestions, rule: 'spelling' });
        }
      }
    }

    const deduped = dedupeErrors(errors);
    if (deduped.length > 0 || sourceText.includes('가을')) {
      console.log('[spellcheck-debug]', JSON.stringify({ id, text: sourceText.slice(0,80), errors: deduped }));
    }
    return { id, errors: deduped };
  });
}
