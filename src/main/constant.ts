import type { WinName, WinOptions } from './types';

import { join } from 'path';

import { is } from '@electron-toolkit/utils';

export const preloadPath = join(__dirname, '../preload/index.js');

export const LOAD_HTML_PATH = join(__dirname, '../renderer');

export function getIconPath() {
  if (is.dev) {
    return join(__dirname, '../../build/icon.png');
  } else {
    return join(process.resourcesPath, 'build/icon.png');
  }
}

export const WINDOW_CONFIG: Record<WinName, WinOptions> = {
  main: {
    title: '录屏',
    html: 'main.html',
    readyToShow: true,
    width: 400,
    height: 220,
    maximizable: true,
    resizable: false,
    frame: false,
  },
  recorderFullScreen: {
    html: 'recorderFullScreen.html',
    width: 340,
    height: 60,
    fullscreenable: false,
    alwaysOnTop: true,
    // skipTaskbar: true,
    maximizable: false,
    resizable: false,
    frame: true,
    hasShadow: false,
    transparent: true,
  },
  recorderScreen: {
    html: 'recorderScreen.html',
    width: 513,
    height: 116,
    maximizable: false,
    resizable: false,
    frame: false,
  },
  recorderShot: {
    html: 'recorderShot.html',
    useContentSize: true, // width 和 height 将设置为 web 页面的尺寸
    movable: false, // 是否可移动
    frame: false, // 无边框窗口
    resizable: false, // 窗口大小是否可调整
    hasShadow: false, // 窗口是否有阴影
    transparent: true, // 使窗口透明
    fullscreenable: true, // 窗口是否可以进入全屏状态
    fullscreen: true, // 窗口是否全屏
    simpleFullscreen: true, // 在 macOS 上使用 pre-Lion 全屏
    alwaysOnTop: true,
    skipTaskbar: false,

    // width: 800,
    // height: 600,
    // maximizable: false,
    // resizable: false,
    // frame: true,
  },
  recorderSourceClip: {
    html: 'recorderSourceClip.html',
    frame: false,
    resizable: false,
    transparent: true,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    readyToShow: true,
  },
};
