import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import * as os from 'os';

// 캐시/프로필 경로 권한 문제(0x5 등) 회피: 쓰기 가능한 temp 경로 사용
const userDataDir = path.join(os.tmpdir(), 'webdoc3-electron');
app.setPath('userData', userDataDir);
app.setPath('sessionData', userDataDir);

function createWindow(): void {
  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
  const mainWindow = new BrowserWindow({
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
  } else {
    void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
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
