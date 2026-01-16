import type { Bounds } from './types';
import type BaseWin from './win/baseWin';
import type { WinName, ThemeColor } from '@/types';

import { BrowserWindow, desktopCapturer, ipcMain, screen } from 'electron';

import {
  startGlobalMouseListener,
  stopGlobalMouseListener,
} from './globalMouseListener';
import MainWin from './win/mainWin';
import MouseClickOverlayWin from './win/mouseClickOverlayWin';
import RecordFullScreenWin from './win/recorderFullScreenWin';
import RecorderScreenWin from './win/recorderScreenWin';
import RecorderShotWin from './win/recorderShotWin';
import RecorderSourceClipWin from './win/recorderSourceClipWin';
import SettingsWin from './win/settingsWin';

import { IPC_CHANNELS } from '@/types';

interface WinsMap {
  main: MainWin | null;
  recorderFullScreen: RecordFullScreenWin | null;
  recorderScreen: RecorderScreenWin | null;
  recorderShot: RecorderShotWin | null;
  recorderSourceClip: RecorderSourceClipWin | null;
  mouseClickOverlay: MouseClickOverlayWin | null;
  settings: SettingsWin | null;
}

const winsMap: Omit<WinsMap, 'main'> = {
  // main: null,
  recorderFullScreen: null,
  recorderScreen: null,
  recorderShot: null,
  recorderSourceClip: null,
  mouseClickOverlay: null,
  settings: null,
};

let currentTheme: 'light' | 'dark' | 'system' = 'system';
let currentThemeColor: ThemeColor = 'violet';

export default function initIpcMain() {
  //#region 通用基础功能
  ipcMain.on(IPC_CHANNELS.CLOSE_WIN, (_, winName: WinName) => {
    if (winName === 'main') {
      MainWin.getInstance().close();
    } else if (winsMap[winName]) {
      winsMap[winName].close();
    }
  });

  ipcMain.on(IPC_CHANNELS.MAX_WIN, (_, winName: WinName, isMax: boolean) => {
    let win: BaseWin | null;
    if (winName === 'main') {
      win = MainWin.getInstance();
    } else {
      win = winsMap[winName];
    }
    isMax ? win?.maximize() : win?.unmaximize();
  });

  ipcMain.on(IPC_CHANNELS.MIN_WIN, (_, winName: WinName) => {
    if (winName === 'main') {
      MainWin.getInstance().minimize();
    } else if (winsMap[winName]) {
      winsMap[winName].minimize();
    }
  });
  //#endregion

  //#region 全屏录制
  ipcMain.on(IPC_CHANNELS.RFS.OPEN_WIN, () => {
    // recorderFullScreenWin =
    winsMap.recorderFullScreen = new RecordFullScreenWin();
  });

  ipcMain.on(IPC_CHANNELS.RFS.CLOSE_WIN, () => {
    winsMap.recorderFullScreen?.close();
    winsMap.recorderFullScreen = null;
  });

  ipcMain.handle(IPC_CHANNELS.RFS.INVOKE_DESKTOP_CAPTURER_SOURCE, async () => {
    const displayInfo = screen.getPrimaryDisplay();
    console.log('ddd', displayInfo);
    const { id } = screen.getPrimaryDisplay();
    const sources = [
      ...(await desktopCapturer.getSources({ types: ['screen'] })),
    ];
    const source = sources.filter(
      (item) => parseInt(item.display_id, 10) == id,
    )[0];
    return {
      source,
      id: displayInfo.id,
      width: displayInfo.size.width,
      height: displayInfo.size.height,
      scaleFactor: displayInfo.scaleFactor,
      depthPerComponent: displayInfo.depthPerComponent,
    };
  });

  ipcMain.on(IPC_CHANNELS.RFS.DOWNLOAD, (_, file) => {
    winsMap.recorderFullScreen?.win!.webContents.downloadURL(file.url);
    winsMap.recorderFullScreen?.win!.webContents.session.once(
      'will-download',
      async (_, item) => {
        item.setSaveDialogOptions({
          defaultPath: file.filename,
        });
      },
    );
  });

  // 全屏录制状态变化
  ipcMain.on(
    IPC_CHANNELS.RFS.SET_RECORDING_STATE,
    (_, isRecording: boolean) => {
      // 录制开始时创建鼠标点击覆盖层并启动全局监听
      if (isRecording) {
        if (!winsMap.mouseClickOverlay) {
          winsMap.mouseClickOverlay = new MouseClickOverlayWin();
          winsMap.mouseClickOverlay.show();
          // 全屏录制不需要边界限制，传入 null
          startGlobalMouseListener(winsMap.mouseClickOverlay.win, null);
        }
      } else {
        // 录制结束时关闭覆盖层并停止监听
        if (winsMap.mouseClickOverlay) {
          stopGlobalMouseListener();
          winsMap.mouseClickOverlay.close();
          winsMap.mouseClickOverlay = null;
        }
      }
    },
  );
  //#endregion

  //#region 录屏区域选择
  ipcMain.on(IPC_CHANNELS.RS_SELECT_AREA.OPEN_WIN, () => {
    winsMap.recorderShot = new RecorderShotWin();
    winsMap.recorderShot.show();
  });
  ipcMain.on(IPC_CHANNELS.RS_SELECT_AREA.CLOSE_WIN, () => {
    winsMap.recorderShot?.close();
    winsMap.recorderShot = null;
  });
  //#endregion

  //#region 截屏录制
  ipcMain.on(IPC_CHANNELS.RS_SOURCE_CLIP.OPEN_WIN, (_, bounds: Bounds) => {
    winsMap.recorderSourceClip = new RecorderSourceClipWin({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    });

    winsMap.recorderScreen = new RecorderScreenWin({
      x: bounds.x,
      y: bounds.y + bounds.height + 8,
    } as Bounds);
  });
  ipcMain.handle(IPC_CHANNELS.RS_SOURCE_CLIP.INVOKE_BOUNDS_CLIP, async () => {
    return winsMap.recorderSourceClip?.getAreaBounds();
  });
  ipcMain.handle(
    IPC_CHANNELS.RS_SOURCE_CLIP.INVOKE_DESKTOP_CAPTURER_SOURCE,
    async () => {
      const displayInfo = screen.getPrimaryDisplay();
      console.log('ddd', displayInfo);
      const { id } = screen.getPrimaryDisplay();
      const sources = [
        ...(await desktopCapturer.getSources({ types: ['screen'] })),
      ];
      const source = sources.filter(
        (item) => parseInt(item.display_id, 10) == id,
      )[0];
      return {
        source,
        id: displayInfo.id,
        width: displayInfo.size.width,
        height: displayInfo.size.height,
        scaleFactor: displayInfo.scaleFactor,
        depthPerComponent: displayInfo.depthPerComponent,
      };
    },
  );
  ipcMain.on(
    IPC_CHANNELS.RS_SOURCE_CLIP.SET_IGNOGE_MOUSE_EVENT,
    (_, bol: boolean) => {
      winsMap.recorderSourceClip?.ignoreMouseEvents(bol);
    },
  );
  ipcMain.on(
    IPC_CHANNELS.RS_SOURCE_CLIP.SET_MOVABLE,
    (_, isRecording: boolean) => {
      winsMap.recorderSourceClip?.setMovable(!isRecording);
      winsMap.recorderSourceClip?.win?.webContents.send(
        IPC_CHANNELS.RS_SOURCE_CLIP.ON_RECORDING_STATE_CHANGE,
        isRecording,
      );

      // 录制开始时创建鼠标点击覆盖层并启动全局监听
      if (isRecording) {
        if (!winsMap.mouseClickOverlay) {
          winsMap.mouseClickOverlay = new MouseClickOverlayWin();
          winsMap.mouseClickOverlay.show();
          // 获取录制区域边界并启动全局鼠标监听
          const bounds = winsMap.recorderSourceClip?.getAreaBounds();
          startGlobalMouseListener(winsMap.mouseClickOverlay.win, bounds);
        }
      } else {
        // 录制结束时关闭覆盖层并停止监听
        if (winsMap.mouseClickOverlay) {
          stopGlobalMouseListener();
          winsMap.mouseClickOverlay.close();
          winsMap.mouseClickOverlay = null;
        }
      }
    },
  );
  ipcMain.on(IPC_CHANNELS.RS_SOURCE_CLIP.DOWNLOAD, (_, file) => {
    winsMap.recorderSourceClip?.win!.webContents.downloadURL(file.url);
    winsMap.recorderSourceClip?.win!.webContents.session.once(
      'will-download',
      async (_, item) => {
        item.setSaveDialogOptions({
          defaultPath: file.filename,
        });
      },
    );
  });
  //#endregion

  //#region 设置窗口
  ipcMain.on(IPC_CHANNELS.SETTINGS.OPEN_WIN, () => {
    if (!winsMap.settings || winsMap.settings.win?.isDestroyed()) {
      winsMap.settings = new SettingsWin();

      // 监听窗口关闭事件，清除引用
      winsMap.settings.win?.on('closed', () => {
        winsMap.settings = null;
      });
    } else {
      winsMap.settings.win?.show();
      winsMap.settings.win?.focus();
    }
  });

  ipcMain.on(IPC_CHANNELS.SETTINGS.CLOSE_WIN, () => {
    winsMap.settings?.close();
  });
  //#endregion

  //#region 主题
  ipcMain.on(
    IPC_CHANNELS.THEME.SET,
    (_, theme: 'light' | 'dark' | 'system') => {
      currentTheme = theme;
      // 通知所有窗口
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach((win) => {
        win.webContents.send(IPC_CHANNELS.THEME.ON_CHANGE, theme);
      });
    },
  );

  ipcMain.handle(IPC_CHANNELS.THEME.GET, () => {
    return currentTheme;
  });

  ipcMain.on(IPC_CHANNELS.THEME.COLOR_SET, (_, themeColor: ThemeColor) => {
    currentThemeColor = themeColor;
    // 通知所有窗口
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((win) => {
      win.webContents.send(IPC_CHANNELS.THEME.COLOR_ON_CHANGE, themeColor);
    });
  });

  ipcMain.handle(IPC_CHANNELS.THEME.COLOR_GET, () => {
    return currentThemeColor;
  });
  //#endregion
}
