import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onMenuCommand: (callback: (command: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, command: string) => callback(command);
    ipcRenderer.on('menu:command', handler);
    return () => ipcRenderer.removeListener('menu:command', handler);
  },
  updateRecentFiles: (names: string[]) => {
    ipcRenderer.send('recent-files:update', names);
  },
  setRibbonCollapsed: (collapsed: boolean) => {
    ipcRenderer.send('ribbon:set-collapsed', collapsed);
  },
  setAiChatVisible: (visible: boolean) => {
    ipcRenderer.send('ai-chat:set-visible', visible);
  },
  showSaveDialog: (options: { defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => {
    return ipcRenderer.invoke('dialog:showSaveDialog', options);
  },
  writeFile: (filePath: string, data: Uint8Array) => {
    return ipcRenderer.invoke('fs:writeFile', filePath, data);
  },
  readFile: (filePath: string) => {
    return ipcRenderer.invoke('fs:readFile', filePath);
  },
  getRecentFiles: () => {
    return ipcRenderer.invoke('recent-files:get');
  },
  addRecentFile: (entry: { name: string; path: string }) => {
    return ipcRenderer.invoke('recent-files:add', entry);
  },
  getSystemFonts: () => {
    return ipcRenderer.invoke('fonts:getSystemFonts');
  },
});
