export type WinName =
  | 'main'
  | 'recorderFullScreen'
  | 'recorderScreen'
  | 'recorderShot'
  | 'recorderSourceClip'
  | 'mouseClickOverlay'
  | 'keyboardOverlay'
  | 'settings';

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
    SET_RECORDING_STATE: 'rfs:set-recording-state',
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
    ON_RECORDING_STATE_CHANGE: 'rs:on-recording-state-change',
    SET_MOVABLE: 'rs:set-movable',
  },

  /** 设置窗口 */
  SETTINGS: {
    OPEN_WIN: 'settings:open-win',
    CLOSE_WIN: 'settings:close-win',
  },

  /** 鼠标点击覆盖层 */
  MOUSE_CLICK_OVERLAY: {
    ON_MOUSE_CLICK: 'mouse-click-overlay:on-mouse-click',
  },

  /** 键盘按键覆盖层 */
  KEYBOARD_OVERLAY: {
    ON_KEY_PRESS: 'keyboard-overlay:on-key-press',
  },
  /** 主题 */
  THEME: {
    SET: 'theme:set',
    GET: 'theme:get',
    ON_CHANGE: 'theme:on-change',
    COLOR_SET: 'theme-color:set',
    COLOR_GET: 'theme-color:get',
    COLOR_ON_CHANGE: 'theme-color:on-change',
  },
} as const;

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ThemeColor =
  | 'violet'
  | 'pink'
  | 'rose'
  | 'sky-blue'
  | 'deep-blue'
  | 'green'
  | 'deep-green'
  | 'orange'
  | 'yellow'
  | 'zinc'
  | 'neutral'
  | 'slate'
  | 'gray';

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
  sendRfsNotifyRecordingState: (isRecording: boolean) => void;

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
  sendRsNotifyRecordingState: (isRecording: boolean) => void;
  onRsRecordingStateChange: (callback: (isRecording: boolean) => void) => void;

  // 设置窗口相关
  sendSettingsOpenWin: () => void;
  sendSettingsClose: () => void;

  // 鼠标点击覆盖层相关
  onMouseClick: (callback: (x: number, y: number) => void) => void;

  // 键盘按键覆盖层相关
  onKeyPress: (callback: (keyName: string) => void) => void;

  // 主题相关
  sendThemeSet: (theme: 'light' | 'dark' | 'system') => void;
  invokeThemeGet: () => Promise<'light' | 'dark' | 'system'>;
  onThemeChange: (
    callback: (theme: 'light' | 'dark' | 'system') => void,
  ) => void;
  sendThemeColorSet: (themeColor: ThemeColor) => void;
  invokeThemeColorGet: () => Promise<ThemeColor>;
  onThemeColorChange: (callback: (themeColor: ThemeColor) => void) => void;
}
