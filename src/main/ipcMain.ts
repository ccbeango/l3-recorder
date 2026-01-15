import type { Bounds } from './types';
import type BaseWin from './win/baseWin';
import type { WinName } from '@/types';

import { desktopCapturer, ipcMain, screen } from 'electron';

import MainWin from './win/mainWin';
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
  settings: SettingsWin | null;
}

const winsMap: Omit<WinsMap, 'main'> = {
  // main: null,
  recorderFullScreen: null,
  recorderScreen: null,
  recorderShot: null,
  recorderSourceClip: null,
  settings: null,
};

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
}
