import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0c0d0e',
    frame: true, // Native Windows desktop frame
    title: 'Grandmaster OS — The Private Chess Academy',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Load production bundle or Vite dev server
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
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

// IPC handlers for native file dialogs
ipcMain.handle('dialog:openPgn', async () => {
  if (!mainWindow) return null;
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Chess PGN File',
    filters: [{ name: 'Chess PGN Files', extensions: ['pgn', 'txt'] }],
    properties: ['openFile'],
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  return fs.readFileSync(res.filePaths[0], 'utf-8');
});

ipcMain.handle('dialog:savePgn', async (_, defaultFilename: string, content: string) => {
  if (!mainWindow) return false;
  const res = await dialog.showSaveDialog(mainWindow, {
    title: 'Export PGN Game',
    defaultPath: defaultFilename,
    filters: [{ name: 'Chess PGN File', extensions: ['pgn'] }],
  });
  if (res.canceled || !res.filePath) return false;
  fs.writeFileSync(res.filePath, content, 'utf-8');
  return true;
});
