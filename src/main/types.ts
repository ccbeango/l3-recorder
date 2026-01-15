export type WinName =
  | 'main'
  | 'recorderFullScreen'
  | 'recorderScreen'
  | 'recorderShot'
  | 'recorderSourceClip'
  | 'settings';

export interface WinOptions extends Electron.BrowserWindowConstructorOptions {
  // width: number;
  // height: number;
  /**
   * 是否设置readyToShow监听事件
   * - default: false
   */
  readyToShow?: boolean;
  /**
   * 加载页面的html名称
   */
  html: string;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
