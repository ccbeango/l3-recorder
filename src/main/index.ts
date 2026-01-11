import { electronApp, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, Menu } from 'electron';

import initIpcMain from './ipcMain';
import MainWin from './win/mainWin';

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);

    // 禁用网页右键菜单
    window.webContents.on('context-menu', (e) => e.preventDefault());
    // 禁用系统右键菜单（针对拖拽区/标题栏）
    window.on('system-context-menu', (e) => e.preventDefault());
    // 禁用掉系统菜单栏
    Menu.setApplicationMenu(null);
  });

  MainWin.getInstance();

  // 初始化IPC
  initIpcMain();

  app.on('activate', function () {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
      allWindows[0].focus();
    } else {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      MainWin.resetInstance();
      MainWin.getInstance();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
