export type WinName =
  | 'main'
  | 'recorderFullScreen'
  | 'recorderScreen'
  | 'recorderShot'
  | 'recorderSourceClip';

export const IPC_CHANNELS = {
  Ping: 'ping',

  CLOSE_WIN: 'close-win',
  MIN_WIN: 'min-win',
  MAX_WIN: 'max-win',
  UNMAX_WIN: 'unmax-win',

  /**全屏录制 */
  RFS: {
    OPEN_WIN: 'rfs:open-win',
    CLOSE_WIN: 'rfs:close-win',
    INVOKE_DESKTOP_CAPTURER_SOURCE: 'rfs:invoke-desktop-capturer-source',
    DOWNLOAD: 'rfs:download',
    MOUSE_ENTER: 'rfs:win-mouse-enter',
    MOUSE_LEAVE: 'rfs:win-mouse-leave',
  },

  /** 截屏录制 -> 屏幕区域选择 */
  RS_SELECT_AREA: {
    OPEN_WIN: 'rs-select-area:open-win',
    CLOSE_WIN: 'rs-select-area:close-win',
    ON_SHOW_WIN: 'rs-select-area:on-show-win',
  },

  /** 截屏录制 -> 已选的录制源窗口 */
  RS_SOURCE_CLIP: {
    OPEN_WIN: 'rs:open-win',
    INVOKE_BOUNDS_CLIP: 'rs:get-bounds-clip',
    INVOKE_DESKTOP_CAPTURER_SOURCE: 'rs:invoke-desktop-capturer-source',
    DOWNLOAD: 'rs:download',
    SET_IGNOGE_MOUSE_EVENT: 'rs:set-ignore-mouse-event',
  },
} as const;

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElectronIpcApi {
  // 基础功能
  sendCloseWin: (winName?: WinName) => void;
  sendMaxWin: (winName: WinName, isMax: boolean) => void;
  sendMinWin: (winName?: WinName) => void;

  // 全屏录制相关
  sendRfsOpenWin: () => void;
  sendRfsClose: () => void;
  invokeRfsGetDesktopCapturerSource: () => Promise<any>;
  sendRfsDownloadVideo: (req: { url: string; filename: string }) => void;
  sendRfsMouseEnter: () => void;
  sendRfsMouseLeave: () => void;

  // 录屏区域选择相关
  sendRsSelectAreaOpenWin: () => void;
  sendRsSelectAreaClose: () => void;
  onRsSelectAreaShowWin: (callback: (base64Img: string) => void) => void;

  // 截屏录制源区域窗口相关
  sendRsOpenWin: (bounds: Bounds) => void;
  invokeRsGetBoundsClip: () => Promise<any>;
  invokeRsGetDesktopCapturerSource: () => Promise<any>;
  sendRsDownloadVideo: (req: { url: string; filename: string }) => void;
  sendRsIgnoreMouseEvent: (val: boolean) => void;
}
