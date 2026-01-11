import type { WinOptions } from '../types';

import { is } from '@electron-toolkit/utils';
import { BrowserWindow, shell } from 'electron';

import { preloadPath, getIconPath, LOAD_HTML_PATH } from '../constant';

export default class BaseWin {
  win: BrowserWindow | null = null;

  eleOptions: Electron.BrowserWindowConstructorOptions | null = null;
  readyToShow?: boolean;
  html: string = '';

  constructor(options?: WinOptions) {
    this.setOptions(options);
  }

  setOptions(options?: WinOptions) {
    if (!options) return;
    const { html, readyToShow, ...eleOptions } = options;
    this.eleOptions = eleOptions;
    this.readyToShow = readyToShow;
    this.html = html;
  }

  init() {
    const win = this.create();

    this.win = win;

    if (this.readyToShow) {
      win.on('ready-to-show', () => {
        win.show();
      });
    }

    win.webContents.setWindowOpenHandler((details) => {
      // 拦截新窗口的打开请求，并用系统默认浏览器打开链接
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/${this.html}`);
    } else {
      win.loadFile(`${LOAD_HTML_PATH}/${this.html}`);
    }
  }

  create() {
    return new BrowserWindow({
      icon: getIconPath(),
      ...this.eleOptions,
      webPreferences: {
        preload: preloadPath,
        sandbox: false,
        ...this.eleOptions?.webPreferences,
      },
    });
  }

  hide() {
    this.win?.hide();
  }

  minimize() {
    this.win?.minimize();
  }

  maximize() {
    this.win?.maximize();
  }

  unmaximize() {
    this.win?.unmaximize();
  }

  focus() {
    if (this.win?.isMinimized()) {
      this.win.restore();
    }
    if (!this.win?.isVisible()) {
      this.win?.show();
    }
    this.win?.focus();
  }

  close() {
    if (this.win && !this.win.isDestroyed()) {
      this.win.close();
    }
    this.win = null;
  }
}
