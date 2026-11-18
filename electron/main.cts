import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

// 캐시/프로필 경로 권한 문제(0x5 등) 회피: 쓰기 가능한 temp 경로 사용
const userDataDir = path.join(os.tmpdir(), 'webdoc3-electron');
app.setPath('userData', userDataDir);
app.setPath('sessionData', userDataDir);

let recentFileNames: string[] = [];
let ribbonVisible = true;
let aiChatVisible = true;

function sendMenuCommand(win: BrowserWindow | undefined, command: string): void {
  const targets = new Set<BrowserWindow>();
  if (win) targets.add(win);
  const focused = BrowserWindow.getFocusedWindow();
  if (focused) targets.add(focused);
  for (const w of BrowserWindow.getAllWindows()) targets.add(w);
  for (const target of targets) {
    if (!target.isDestroyed()) {
      target.webContents.send('menu:command', command);
    }
  }
}

function createApplicationMenu(): void {
  const recentSubmenu: Electron.MenuItemConstructorOptions[] =
    recentFileNames.length > 0
      ? recentFileNames.map((name) => ({
          label: name,
          click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, `file:openRecent:${encodeURIComponent(name)}`),
        }))
      : [{ label: '최근 사용한 파일 없음', enabled: false }];

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '파일(&F)',
      submenu: [
        { label: '새 문서', accelerator: 'CmdOrCtrl+N', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'file:new') },
        { label: '파일 열기', accelerator: 'CmdOrCtrl+O', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'file:open') },
        { type: 'separator' },
        { label: '저장', accelerator: 'CmdOrCtrl+S', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'file:save') },
        { label: '다른 이름으로 저장(&A)', accelerator: 'CmdOrCtrl+Shift+S', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'file:saveAs') },
        { type: 'separator' },
        { label: '최근 파일', submenu: recentSubmenu },
        { type: 'separator' },
        { label: '파일 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:file') },
        { type: 'separator' },
        { label: '닫기', accelerator: 'CmdOrCtrl+W', click: (_item, win) => (win ?? BrowserWindow.getFocusedWindow())?.close() },
        { role: 'quit', label: '종료' },
      ],
    },
    {
      label: '편집(&E)',
      submenu: [
        { role: 'undo', label: '실행 취소' },
        { role: 'redo', label: '다시 실행' },
        { type: 'separator' },
        { role: 'cut', label: '잘라내기' },
        { role: 'copy', label: '복사' },
        { role: 'paste', label: '붙여넣기' },
        { role: 'selectAll', label: '모두 선택' },
        { type: 'separator' },
        { label: '찾기/바꾸기 탭 표시', accelerator: 'CmdOrCtrl+F', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:edit') },
      ],
    },
    {
      label: '보기(&V)',
      submenu: [
        { label: '미리보기(&U)', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'view:preview') },
        { label: '문단부호 표시 전환', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'view:toggleParaMarks') },
        { type: 'separator' },
        {
          id: 'toggle-ribbon',
          label: '리본 메뉴 표시',
          type: 'checkbox',
          checked: ribbonVisible,
          click: (menuItem, win) => {
            ribbonVisible = menuItem.checked;
            sendMenuCommand(win as BrowserWindow | undefined, menuItem.checked ? 'view:showRibbon' : 'view:hideRibbon');
          },
        },
        {
          id: 'toggle-ai-chat',
          label: 'AI 대화창',
          type: 'checkbox',
          checked: aiChatVisible,
          click: (menuItem, win) => {
            aiChatVisible = menuItem.checked;
            sendMenuCommand(win as BrowserWindow | undefined, menuItem.checked ? 'view:showAiChat' : 'view:hideAiChat');
          },
        },
        { type: 'separator' },
        { label: '보기 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:view') },
        { type: 'separator' },
        { role: 'reload', label: '다시 로드' },
        { role: 'toggleDevTools', label: '개발자 도구' },
        { type: 'separator' },
        { label: '실제 크기', accelerator: 'CmdOrCtrl+0', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'view:zoomReset') },
        { label: '확대', accelerator: 'CmdOrCtrl+=', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'view:zoomIn') },
        { label: '축소', accelerator: 'CmdOrCtrl+-', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'view:zoomOut') },
        { role: 'togglefullscreen', label: '전체 화면' },
      ],
    },
    {
      label: '입력(&I)',
      submenu: [
        { label: '표 삽입', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'input:insertTable') },
        { type: 'separator' },
        { label: '사각형 삽입', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'input:insertRect') },
        { label: '타원 삽입', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'input:insertEllipse') },
        { label: '직선 삽입', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'input:insertLine') },
        { label: '화살표 삽입', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'input:insertArrow') },
        { type: 'separator' },
        { label: '입력 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:input') },
        { label: '표 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:table') },
      ],
    },
    {
      label: '서식(&O)',
      submenu: [
        { label: '본문 스타일', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:styleBody') },
        { label: '제목 스타일', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:styleTitle') },
        { type: 'separator' },
        { label: '글꼴', accelerator: 'CmdOrCtrl+L', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:bold') },
        { label: '단락', accelerator: 'CmdOrCtrl+I', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:italic') },
        { type: 'separator' },
        { label: '서식 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:format') },
      ],
    },
    {
      label: '쪽(&R)',
      submenu: [
        { label: '여백 적용', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'page:applyMargins') },
        { type: 'separator' },
        { label: '쪽 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:page') },
      ],
    },
    {
      label: '도움말(&H)',
      submenu: [
        {
          label: '정보(&A)',
          click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'help:about'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

ipcMain.on('recent-files:update', (_event, names: string[]) => {
  recentFileNames = Array.isArray(names) ? names.filter((n): n is string => typeof n === 'string') : [];
  if (app.isReady()) createApplicationMenu();
});

ipcMain.on('ribbon:set-collapsed', (_event, collapsed: boolean) => {
  ribbonVisible = !collapsed;
  const item = Menu.getApplicationMenu()?.getMenuItemById('toggle-ribbon');
  if (item) item.checked = ribbonVisible;
});

ipcMain.on('ai-chat:set-visible', (_event, visible: boolean) => {
  aiChatVisible = !!visible;
  const item = Menu.getApplicationMenu()?.getMenuItemById('toggle-ai-chat');
  if (item) item.checked = aiChatVisible;
});

ipcMain.handle('dialog:showSaveDialog', async (event, options: { defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => {
  const win = BrowserWindow.fromWebContents(event.sender) || BrowserWindow.getFocusedWindow() || undefined;
  const result = await dialog.showSaveDialog(win as any, {
    defaultPath: options?.defaultPath,
    filters: options?.filters,
  });
  return result; // { canceled, filePath }
});

ipcMain.handle('fs:writeFile', async (_event, filePath: string, data: Uint8Array | number[]) => {
  const buf = Buffer.from(data instanceof Uint8Array ? data : Uint8Array.from(data));
  await fs.writeFile(filePath, buf);
  return { ok: true };
});

const recentFilesPath = () => path.join(app.getPath('userData'), 'recent-files.json');

type RecentFileEntry = { name: string; path: string };

async function readRecentFiles(): Promise<RecentFileEntry[]> {
  try {
    const raw = await fs.readFile(recentFilesPath(), 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.name === 'string' && typeof x.path === 'string' && x.name && x.path)
      .slice(0, 10);
  } catch {
    return [];
  }
}

async function writeRecentFiles(entries: RecentFileEntry[]): Promise<void> {
  const clean = entries
    .filter((x) => x && typeof x.name === 'string' && typeof x.path === 'string' && x.name && x.path)
    .slice(0, 10);
  await fs.mkdir(path.dirname(recentFilesPath()), { recursive: true });
  await fs.writeFile(recentFilesPath(), JSON.stringify(clean, null, 2), 'utf8');
}

ipcMain.handle('recent-files:get', async () => {
  const entries = await readRecentFiles();
  recentFileNames = entries.map((e) => e.name);
  if (app.isReady()) createApplicationMenu();
  return entries;
});

ipcMain.handle('recent-files:add', async (_event, entry: RecentFileEntry) => {
  if (!entry || typeof entry.name !== 'string' || typeof entry.path !== 'string') {
    return await readRecentFiles();
  }
  const cur = await readRecentFiles();
  const next = [{ name: entry.name, path: entry.path }, ...cur.filter((e) => e.path !== entry.path && e.name !== entry.name)].slice(0, 10);
  await writeRecentFiles(next);
  recentFileNames = next.map((e) => e.name);
  if (app.isReady()) createApplicationMenu();
  return next;
});

ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
  const data = await fs.readFile(filePath);
  return data;
});


function createWindow(): void {
  const iconPath = path.join(__dirname, '..', 'src', 'assets', 'icon.ico');
  const preloadPath = path.join(__dirname, 'preload.cjs');
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 1280,
        height: 900,
        icon: iconPath,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          preload: preloadPath,
        },
      },
    };
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_START_URL;
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  const iconPath = path.join(__dirname, '..', 'src', 'assets', 'icon.ico');
  const preloadPath = path.join(__dirname, 'preload.cjs');
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(() => ({
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 1280,
        height: 900,
        icon: iconPath,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          preload: preloadPath,
        },
      },
    }));
  });

  createApplicationMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
