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
function sendMenuCommand(win, command) {
    if (!win)
        return;
    win.webContents.send('menu:command', command);
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
            label: '파일',
            submenu: [
                { label: '새 문서', accelerator: 'CmdOrCtrl+N', click: (_item, win) => sendMenuCommand(win, 'file:new') },
                { label: '파일 열기', accelerator: 'CmdOrCtrl+O', click: (_item, win) => sendMenuCommand(win, 'file:open') },
                { type: 'separator' },
                { label: '저장', accelerator: 'CmdOrCtrl+S', click: (_item, win) => sendMenuCommand(win, 'file:save') },
                { label: '다른 이름으로 저장', accelerator: 'CmdOrCtrl+Shift+S', click: (_item, win) => sendMenuCommand(win, 'file:saveAs') },
                { type: 'separator' },
                { label: '최근 파일', submenu: recentSubmenu },
                { type: 'separator' },
                { label: '파일 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:file') },
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
                { label: '찾기/바꾸기 탭 표시', accelerator: 'CmdOrCtrl+F', click: (_item, win) => sendMenuCommand(win, 'tab:edit') },
            ],
        },
        {
            label: '보기',
            submenu: [
                { label: '미리보기', click: (_item, win) => sendMenuCommand(win, 'view:preview') },
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
                { type: 'separator' },
                { label: '보기 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:view') },
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
            label: '서식',
            submenu: [
                { label: '본문 스타일', click: (_item, win) => sendMenuCommand(win, 'format:styleBody') },
                { label: '제목 스타일', click: (_item, win) => sendMenuCommand(win, 'format:styleTitle') },
                { type: 'separator' },
                { label: '굵게', accelerator: 'CmdOrCtrl+B', click: (_item, win) => sendMenuCommand(win, 'format:bold') },
                { label: '기울임', accelerator: 'CmdOrCtrl+I', click: (_item, win) => sendMenuCommand(win, 'format:italic') },
                { label: '밑줄', accelerator: 'CmdOrCtrl+U', click: (_item, win) => sendMenuCommand(win, 'format:underline') },
                { type: 'separator' },
                { label: '서식 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:format') },
            ],
        },
        {
            label: '쪽',
            submenu: [
                { label: '여백 적용', click: (_item, win) => sendMenuCommand(win, 'page:applyMargins') },
                { type: 'separator' },
                { label: '쪽 탭 표시', click: (_item, win) => sendMenuCommand(win, 'tab:page') },
            ],
        },
        {
            label: '도움말',
            submenu: [
                {
                    label: '정보',
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
function createWindow() {
    const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
    const mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }
}
electron_1.app.whenReady().then(() => {
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
