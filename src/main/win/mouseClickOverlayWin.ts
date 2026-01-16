import type { WinOptions } from '../types';

import { screen } from 'electron';

import BaseWin from './baseWin';

export default class MouseClickOverlayWin extends BaseWin {
  constructor(options?: WinOptions) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;

    super({
      width,
      height,
      x: 0,
      y: 0,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      hasShadow: false,
      focusable: false,
      html: 'mouseClickOverlay.html',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
      ...options,
    });

    this.init();

    // 设置窗口完全穿透，不阻止任何鼠标事件
    this.win?.setIgnoreMouseEvents(true, { forward: true });
  }

  show() {
    this.win?.show();
    this.win?.setAlwaysOnTop(true, 'screen-saver', 1);
  }
}
