import { app, BrowserWindow, Menu, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as os from 'os';

// 캐시/프로필 경로 권한 문제(0x5 등) 회피: 쓰기 가능한 temp 경로 사용
const userDataDir = path.join(os.tmpdir(), 'webdoc3-electron');
app.setPath('userData', userDataDir);
app.setPath('sessionData', userDataDir);

let recentFileNames: string[] = [];
let ribbonVisible = true;

function sendMenuCommand(win: BrowserWindow | undefined, command: string): void {
  if (!win) return;
  win.webContents.send('menu:command', command);
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
      label: '파일',
      submenu: [
        { label: '새 문서', accelerator: 'CmdOrCtrl+N', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'file:new') },
        { label: '파일 열기', accelerator: 'CmdOrCtrl+O', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'file:open') },
        { type: 'separator' },
        { label: '저장', accelerator: 'CmdOrCtrl+S', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'file:save') },
        { label: '다른 이름으로 저장', accelerator: 'CmdOrCtrl+Shift+S', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'file:saveAs') },
        { type: 'separator' },
        { label: '최근 파일', submenu: recentSubmenu },
        { type: 'separator' },
        { label: '파일 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:file') },
        { type: 'separator' },
        { role: 'quit', label: '종료' },
      ],
    },
    {
      label: '편집',
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
      label: '보기',
      submenu: [
        { label: '미리보기', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'view:preview') },
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
        { type: 'separator' },
        { label: '보기 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:view') },
        { type: 'separator' },
        { role: 'reload', label: '다시 로드' },
        { role: 'toggleDevTools', label: '개발자 도구' },
        { type: 'separator' },
        { role: 'resetZoom', label: '실제 크기' },
        { role: 'zoomIn', label: '확대' },
        { role: 'zoomOut', label: '축소' },
        { role: 'togglefullscreen', label: '전체 화면' },
      ],
    },
    {
      label: '입력',
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
      label: '서식',
      submenu: [
        { label: '본문 스타일', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:styleBody') },
        { label: '제목 스타일', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:styleTitle') },
        { type: 'separator' },
        { label: '굵게', accelerator: 'CmdOrCtrl+B', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:bold') },
        { label: '기울임', accelerator: 'CmdOrCtrl+I', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:italic') },
        { label: '밑줄', accelerator: 'CmdOrCtrl+U', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'format:underline') },
        { type: 'separator' },
        { label: '서식 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:format') },
      ],
    },
    {
      label: '쪽',
      submenu: [
        { label: '여백 적용', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'page:applyMargins') },
        { type: 'separator' },
        { label: '쪽 탭 표시', click: (_item, win) => sendMenuCommand(win as BrowserWindow | undefined, 'tab:page') },
      ],
    },
    {
      label: '도움말',
      submenu: [
        {
          label: '정보',
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


function createWindow(): void {
  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_START_URL;
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
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
