"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    onMenuCommand: (callback) => {
        const handler = (_event, command) => callback(command);
        electron_1.ipcRenderer.on('menu:command', handler);
        return () => electron_1.ipcRenderer.removeListener('menu:command', handler);
    },
    updateRecentFiles: (names) => {
        electron_1.ipcRenderer.send('recent-files:update', names);
    },
    setRibbonCollapsed: (collapsed) => {
        electron_1.ipcRenderer.send('ribbon:set-collapsed', collapsed);
    },
    setAiChatVisible: (visible) => {
        electron_1.ipcRenderer.send('ai-chat:set-visible', visible);
    },
    showSaveDialog: (options) => {
        return electron_1.ipcRenderer.invoke('dialog:showSaveDialog', options);
    },
    writeFile: (filePath, data) => {
        return electron_1.ipcRenderer.invoke('fs:writeFile', filePath, data);
    },
    readFile: (filePath) => {
        return electron_1.ipcRenderer.invoke('fs:readFile', filePath);
    },
    getRecentFiles: () => {
        return electron_1.ipcRenderer.invoke('recent-files:get');
    },
    addRecentFile: (entry) => {
        return electron_1.ipcRenderer.invoke('recent-files:add', entry);
    },
    getSystemFonts: () => {
        return electron_1.ipcRenderer.invoke('fonts:getSystemFonts');
    },
    checkParagraphs: (paragraphs, options) => {
        return electron_1.ipcRenderer.invoke('spellcheck:checkParagraphs', { paragraphs, options });
    },
    addUserWord: (word, model) => {
        return electron_1.ipcRenderer.invoke('spellcheck:addUserWord', { word, model });
    },
});
