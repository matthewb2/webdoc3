"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
// 캐시/프로필 경로 권한 문제(0x5 등) 회피: 쓰기 가능한 temp 경로 사용
const userDataDir = path.join(os.tmpdir(), 'webdoc3-electron');
electron_1.app.setPath('userData', userDataDir);
electron_1.app.setPath('sessionData', userDataDir);
let recentFileNames = [];
let ribbonVisible = true;
let aiChatVisible = true;
function sendMenuCommand(win, command) {
    const targets = new Set();
    if (win)
        targets.add(win);
    const focused = electron_1.BrowserWindow.getFocusedWindow();
    if (focused)
        targets.add(focused);
    for (const w of electron_1.BrowserWindow.getAllWindows())
        targets.add(w);
    for (const target of targets) {
        if (!target.isDestroyed()) {
            target.webContents.send('menu:command', command);
        }
    }
}
function createApplicationMenu() {
    const recentSubmenu = recentFileNames.length > 0
        ? recentFileNames.map((name) => ({
            label: name,
            click: (_item, win) => sendMenuCommand(win, `file:openRecent:${encodeURIComponent(name)}`),
        }))
        : [{ label: '최근 사용한 파일 없음', enabled: false }];
    const template = [
        {
            label: '파일(&F)',
            submenu: [
                { label: '새 문서', accelerator: 'CmdOrCtrl+N', click: (_item, win) => sendMenuCommand(win, 'file:new') },
                { label: '파일 열기', accelerator: 'CmdOrCtrl+O', click: (_item, win) => sendMenuCommand(win, 'file:open') },
                { type: 'separator' },
                { label: '저장', accelerator: 'CmdOrCtrl+S', click: (_item, win) => sendMenuCommand(win, 'file:save') },
                { label: '다른 이름으로 저장(&A)', accelerator: 'CmdOrCtrl+Shift+S', click: (_item, win) => sendMenuCommand(win, 'file:saveAs') },
                { type: 'separator' },
                { label: '최근 파일', submenu: recentSubmenu },
                { type: 'separator' },
                { label: '파일 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:file') },
                { type: 'separator' },
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
                { label: '찾기/바꾸기 탭 표시', accelerator: 'CmdOrCtrl+F', click: (_item, win) => sendMenuCommand(win, 'tab:edit') },
            ],
        },
        {
            label: '보기(&V)',
            submenu: [
                { label: '미리보기(&U)', click: (_item, win) => sendMenuCommand(win, 'view:preview') },
                { label: '문단부호 표시 전환', click: (_item, win) => sendMenuCommand(win, 'view:toggleParaMarks') },
                { type: 'separator' },
                {
                    id: 'toggle-ribbon',
                    label: '리본 메뉴 표시',
                    type: 'checkbox',
                    checked: ribbonVisible,
                    click: (menuItem, win) => {
                        ribbonVisible = menuItem.checked;
                        sendMenuCommand(win, menuItem.checked ? 'view:showRibbon' : 'view:hideRibbon');
                    },
                },
                {
                    id: 'toggle-ai-chat',
                    label: 'AI 대화창',
                    type: 'checkbox',
                    checked: aiChatVisible,
                    click: (menuItem, win) => {
                        aiChatVisible = menuItem.checked;
                        sendMenuCommand(win, menuItem.checked ? 'view:showAiChat' : 'view:hideAiChat');
                    },
                },
                { type: 'separator' },
                { label: '보기 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:view') },
                { type: 'separator' },
                { role: 'reload', label: '다시 로드' },
                { role: 'toggleDevTools', label: '개발자 도구' },
                { type: 'separator' },
                { label: '실제 크기', accelerator: 'CmdOrCtrl+0', click: (_item, win) => sendMenuCommand(win, 'view:zoomReset') },
                { label: '확대', accelerator: 'CmdOrCtrl+=', click: (_item, win) => sendMenuCommand(win, 'view:zoomIn') },
                { label: '축소', accelerator: 'CmdOrCtrl+-', click: (_item, win) => sendMenuCommand(win, 'view:zoomOut') },
                { role: 'togglefullscreen', label: '전체 화면' },
            ],
        },
        {
            label: '입력(&I)',
            submenu: [
                { label: '표 삽입', click: (_item, win) => sendMenuCommand(win, 'input:insertTable') },
                { type: 'separator' },
                { label: '사각형 삽입', click: (_item, win) => sendMenuCommand(win, 'input:insertRect') },
                { label: '타원 삽입', click: (_item, win) => sendMenuCommand(win, 'input:insertEllipse') },
                { label: '직선 삽입', click: (_item, win) => sendMenuCommand(win, 'input:insertLine') },
                { label: '화살표 삽입', click: (_item, win) => sendMenuCommand(win, 'input:insertArrow') },
                { type: 'separator' },
                { label: '입력 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:input') },
                { label: '표 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:table') },
            ],
        },
        {
            label: '서식(&O)',
            submenu: [
                { label: '본문 스타일', click: (_item, win) => sendMenuCommand(win, 'format:styleBody') },
                { label: '제목 스타일', click: (_item, win) => sendMenuCommand(win, 'format:styleTitle') },
                { type: 'separator' },
                { label: '글꼴', accelerator: 'CmdOrCtrl+L', click: (_item, win) => sendMenuCommand(win, 'format:bold') },
                { label: '단락', accelerator: 'CmdOrCtrl+I', click: (_item, win) => sendMenuCommand(win, 'format:italic') },
                { type: 'separator' },
                { label: '서식 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:format') },
            ],
        },
        {
            label: '쪽(&R)',
            submenu: [
                { label: '여백 적용', click: (_item, win) => sendMenuCommand(win, 'page:applyMargins') },
                { type: 'separator' },
                { label: '쪽 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:page') },
            ],
        },
        {
            label: '도움말(&H)',
            submenu: [
                {
                    label: '정보(&A)',
                    click: (_item, win) => sendMenuCommand(win, 'help:about'),
                },
            ],
        },
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
electron_1.ipcMain.on('recent-files:update', (_event, names) => {
    recentFileNames = Array.isArray(names) ? names.filter((n) => typeof n === 'string') : [];
    if (electron_1.app.isReady())
        createApplicationMenu();
});
electron_1.ipcMain.on('ribbon:set-collapsed', (_event, collapsed) => {
    ribbonVisible = !collapsed;
    const item = electron_1.Menu.getApplicationMenu()?.getMenuItemById('toggle-ribbon');
    if (item)
        item.checked = ribbonVisible;
});
electron_1.ipcMain.on('ai-chat:set-visible', (_event, visible) => {
    aiChatVisible = !!visible;
    const item = electron_1.Menu.getApplicationMenu()?.getMenuItemById('toggle-ai-chat');
    if (item)
        item.checked = aiChatVisible;
});
function createWindow() {
    const iconPath = path.join(__dirname, '..', 'src', 'assets', 'icon.ico');
    const preloadPath = path.join(__dirname, 'preload.cjs');
    const mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }
}
electron_1.app.whenReady().then(() => {
    const iconPath = path.join(__dirname, '..', 'src', 'assets', 'icon.ico');
    const preloadPath = path.join(__dirname, 'preload.cjs');
    electron_1.app.on('web-contents-created', (_event, contents) => {
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
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
