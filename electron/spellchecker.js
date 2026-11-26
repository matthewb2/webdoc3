"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSpellChecker = initSpellChecker;
exports.addUserWord = addUserWord;
exports.applyPersonalList = applyPersonalList;
exports.checkParagraphs = checkParagraphs;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const nspell_1 = __importDefault(require("nspell"));
let spellInstance = null;
const addedWords = new Set();
function getDictDir() {
    return electron_1.app.isPackaged
        ? path_1.default.join(process.resourcesPath, 'dict')
        : path_1.default.join(__dirname, '..', 'resources', 'dict');
}
function getUserDictPath() {
    return path_1.default.join(electron_1.app.getPath('userData'), 'custom-ko-words.json');
}
function loadUserWordsFromDisk() {
    const filePath = getUserDictPath();
    if (!fs_1.default.existsSync(filePath))
        return [];
    try {
        const raw = fs_1.default.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (err) {
        console.error('Failed to read user dictionary:', err);
        return [];
    }
}
function saveUserWordsToDisk() {
    const filePath = getUserDictPath();
    fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
    fs_1.default.writeFileSync(filePath, JSON.stringify([...addedWords], null, 2), 'utf8');
}
function initSpellChecker() {
    if (spellInstance)
        return spellInstance;
    const dictDir = getDictDir();
    const aff = fs_1.default.readFileSync(path_1.default.join(dictDir, 'ko.aff'));
    const dic = fs_1.default.readFileSync(path_1.default.join(dictDir, 'ko.dic'));
    spellInstance = (0, nspell_1.default)(aff, dic);
    const savedWords = loadUserWordsFromDisk();
    for (const item of savedWords) {
        if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed) {
                spellInstance.add(trimmed);
                addedWords.add(trimmed);
            }
        }
        else if (item && typeof item.word === 'string') {
            const trimmedWord = item.word.trim();
            if (trimmedWord) {
                if (item.model) {
                    spellInstance.add(trimmedWord, item.model);
                }
                else {
                    spellInstance.add(trimmedWord);
                }
                addedWords.add(trimmedWord);
            }
        }
    }
    return spellInstance;
}
function addUserWord(word, model) {
    const trimmed = (word || '').trim();
    if (!trimmed) {
        return { ok: false, reason: 'EMPTY_WORD' };
    }
    const spell = initSpellChecker();
    if (model) {
        spell.add(trimmed, model);
    }
    else {
        spell.add(trimmed);
    }
    addedWords.add(trimmed);
    saveUserWordsToDisk();
    return { ok: true, word: trimmed };
}
function applyPersonalList(words) {
    const spell = initSpellChecker();
    if (!Array.isArray(words) || words.length === 0)
        return;
    const normalized = words.map((w) => w.trim()).filter(Boolean);
    if (normalized.length === 0)
        return;
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
function findMissingSpaceErrors(spell, word, wordStart, maxSuggestions) {
    if (word.length < 3 || spell.correct(word)) {
        return [];
    }
    const splitCandidates = [];
    for (let i = 1; i <= word.length - 1; i++) {
        const left = word.slice(0, i);
        const right = word.slice(i);
        if (left.length < 2 && right.length < 2)
            continue;
        if (spell.correct(left) && spell.correct(right)) {
            splitCandidates.push(`${left} ${right}`);
        }
    }
    if (splitCandidates.length === 0)
        return [];
    return [{
            start: wordStart,
            end: wordStart + word.length,
            org: word,
            suggestions: splitCandidates.slice(0, maxSuggestions),
            rule: 'spacing',
        }];
}
/** 2) 불필요한 공백 검사: "사과 를" -> "사과를" */
function findExtraSpaceErrors(spell, text, maxSuggestions) {
    const errors = [];
    const pairRegex = /([가-힣]+)\s+([가-힣]+)/g;
    let match;
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
function findCommonSpacingPatternErrors(text) {
    const errors = [];
    const patterns = [
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
        let match;
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
function hasBatchim(ch) {
    const code = ch.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3)
        return false;
    return (code - 0xac00) % 28 !== 0;
}
function getBatchim(ch) {
    const code = ch.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3)
        return -1;
    return (code - 0xac00) % 28;
}
/** 4) 조사 호응 검사: "가을는" -> "가을은" */
function findJosaAgreementErrors(word, wordStart) {
    if (word.length < 2)
        return [];
    const pairs = [['은', '는'], ['이', '가'], ['을', '를'], ['과', '와']];
    for (const [withBatchim, withoutBatchim] of pairs) {
        if (word.endsWith(withBatchim)) {
            const stem = word.slice(0, -withBatchim.length);
            if (stem.length < 1)
                continue;
            const prev = stem[stem.length - 1];
            if (!hasBatchim(prev)) {
                return [{ start: wordStart, end: wordStart + word.length, org: word, suggestions: [stem + withoutBatchim], rule: 'grammar' }];
            }
            return [];
        }
        if (word.endsWith(withoutBatchim)) {
            const stem = word.slice(0, -withoutBatchim.length);
            if (stem.length < 1)
                continue;
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
function dedupeErrors(errors) {
    const seen = new Set();
    const out = [];
    for (const e of errors) {
        const k = `${e.start}:${e.end}:${e.org}`;
        if (seen.has(k))
            continue;
        seen.add(k);
        out.push(e);
    }
    return out;
}
function checkParagraphs(paragraphs, options = {}) {
    const spell = initSpellChecker();
    const maxSuggestions = options.maxSuggestions ?? 5;
    const minWordLength = options.minWordLength ?? 1;
    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
        return [];
    }
    return paragraphs.map(({ id, text }) => {
        const errors = [];
        const sourceText = typeof text === 'string' ? text : '';
        // 1) 고빈도 띄어쓰기 패턴 (명확한 규칙 우선)
        errors.push(...findCommonSpacingPatternErrors(sourceText));
        // 2) 불필요한 공백 (연속 어절 간)
        errors.push(...findExtraSpaceErrors(spell, sourceText, maxSuggestions));
        // 3) 단일 어절 검사: 조사 호응 -> 붙여쓰기 분할 -> 일반 철자 오류
        const wordRegex = /[가-힣]+/g;
        let match;
        while ((match = wordRegex.exec(sourceText)) !== null) {
            const word = match[0];
            if (word.length < minWordLength)
                continue;
            const start = match.index;
            const end = start + word.length;
            // 이미 상위 규칙에서 잡힌 범위와 겹치면 건너뜀
            if (errors.some((e) => !(end <= e.start || start >= e.end)))
                continue;
            const josaErrors = findJosaAgreementErrors(word, start);
            if (josaErrors.length > 0) {
                errors.push(...josaErrors);
                continue;
            }
            if (!spell.correct(word)) {
                const missingSpace = findMissingSpaceErrors(spell, word, start, maxSuggestions);
                if (missingSpace.length > 0) {
                    errors.push(...missingSpace);
                }
                else {
                    const suggestions = spell.suggest(word).slice(0, maxSuggestions);
                    errors.push({ start, end, org: word, suggestions, rule: 'spelling' });
                }
            }
        }
        const deduped = dedupeErrors(errors);
        if (deduped.length > 0 || sourceText.includes('가을')) {
            console.log('[spellcheck-debug]', JSON.stringify({ id, text: sourceText.slice(0, 80), errors: deduped }));
        }
        return { id, errors: deduped };
    });
}
