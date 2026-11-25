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
        const wordRegex = /[가-힣]+/g;
        let match;
        while ((match = wordRegex.exec(sourceText)) !== null) {
            const word = match[0];
            if (word.length < minWordLength)
                continue;
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
