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
});
