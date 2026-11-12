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
function createWindow() {
    const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
    const mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 900,
        icon: iconPath,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
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
    electron_1.Menu.setApplicationMenu(null);
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
