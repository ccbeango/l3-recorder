import type { ElectronIpcApi, WinName } from '@types';

import { electronAPI } from '@electron-toolkit/preload';
import { IPC_CHANNELS } from '@types';
import { contextBridge } from 'electron';

// 预加载到渲染进程的API
const api = {};

// electron IPC API
const electronIpcApi: ElectronIpcApi = {
  sendCloseWin: (winName?: WinName) =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.CLOSE_WIN, winName),
  sendMaxWin: (winName: WinName, isMax: boolean) =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.MAX_WIN, winName, isMax),
  sendMinWin: (winName?: WinName) =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.MIN_WIN, winName),

  // 全屏录制
  sendRfsOpenWin: () => electronAPI.ipcRenderer.send(IPC_CHANNELS.RFS.OPEN_WIN),
  sendRfsClose: () => electronAPI.ipcRenderer.send(IPC_CHANNELS.RFS.CLOSE_WIN),
  invokeRfsGetDesktopCapturerSource: () =>
    electronAPI.ipcRenderer.invoke(
      IPC_CHANNELS.RFS.INVOKE_DESKTOP_CAPTURER_SOURCE,
    ),
  sendRfsDownloadVideo: (req) =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.RFS.DOWNLOAD, req),
  sendRfsMouseEnter: () =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.RFS.MOUSE_ENTER),
  sendRfsMouseLeave: () =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.RFS.MOUSE_LEAVE),

  // 录屏区域选择
  sendRsSelectAreaOpenWin: () =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.RS_SELECT_AREA.OPEN_WIN),
  sendRsSelectAreaClose: () =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.RS_SELECT_AREA.CLOSE_WIN),
  onRsSelectAreaShowWin: (callback) =>
    electronAPI.ipcRenderer.on(
      IPC_CHANNELS.RS_SELECT_AREA.ON_SHOW_WIN,
      (_, img) => {
        callback(img);
      },
    ),

  // 截屏录制源区域窗口
  sendRsOpenWin: (bounds) =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.RS_SOURCE_CLIP.OPEN_WIN, bounds),
  invokeRsGetBoundsClip: () =>
    electronAPI.ipcRenderer.invoke(
      IPC_CHANNELS.RS_SOURCE_CLIP.INVOKE_BOUNDS_CLIP,
    ),
  invokeRsGetDesktopCapturerSource: () =>
    electronAPI.ipcRenderer.invoke(
      IPC_CHANNELS.RS_SOURCE_CLIP.INVOKE_DESKTOP_CAPTURER_SOURCE,
    ),
  sendRsDownloadVideo: (req) =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.RS_SOURCE_CLIP.DOWNLOAD, req),
  sendRsIgnoreMouseEvent: (val: boolean) =>
    electronAPI.ipcRenderer.send(
      IPC_CHANNELS.RS_SOURCE_CLIP.SET_IGNOGE_MOUSE_EVENT,
      val,
    ),
  sendRsNotifyRecordingState: (isRecording: boolean) =>
    electronAPI.ipcRenderer.send(
      IPC_CHANNELS.RS_SOURCE_CLIP.SET_MOVABLE,
      isRecording,
    ),
  onRsRecordingStateChange: (callback) =>
    electronAPI.ipcRenderer.on(
      IPC_CHANNELS.RS_SOURCE_CLIP.ON_RECORDING_STATE_CHANGE,
      (_, isRecording) => {
        callback(isRecording);
      },
    ),

  // 设置窗口
  sendSettingsOpenWin: () =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.SETTINGS.OPEN_WIN),
  sendSettingsClose: () =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.SETTINGS.CLOSE_WIN),

  // 主题
  sendThemeSet: (theme) =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.THEME.SET, theme),
  invokeThemeGet: () => electronAPI.ipcRenderer.invoke(IPC_CHANNELS.THEME.GET),
  onThemeChange: (callback) =>
    electronAPI.ipcRenderer.on(IPC_CHANNELS.THEME.ON_CHANGE, (_, theme) => {
      callback(theme);
    }),
  sendThemeColorSet: (themeColor) =>
    electronAPI.ipcRenderer.send(IPC_CHANNELS.THEME.COLOR_SET, themeColor),
  invokeThemeColorGet: () =>
    electronAPI.ipcRenderer.invoke(IPC_CHANNELS.THEME.COLOR_GET),
  onThemeColorChange: (callback) =>
    electronAPI.ipcRenderer.on(
      IPC_CHANNELS.THEME.COLOR_ON_CHANGE,
      (_, themeColor) => {
        callback(themeColor);
      },
    ),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronIpcApi);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronIpcApi;
  // @ts-ignore (define in dts)
  window.api = api;
}
