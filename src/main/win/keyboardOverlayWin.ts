import type { WinOptions } from '../types';

import { screen } from 'electron';

import BaseWin from './baseWin';

export default class KeyboardOverlayWin extends BaseWin {
  constructor(options?: WinOptions) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.bounds;

    // 窗口尺寸 - 增大以适应更大的按键显示和长组合键
    const width = Math.min(600, screenWidth * 0.4); // 最大600px或屏幕宽度的40%
    const height = 200; // 增加高度以避免按键被遮挡

    // 左下角位置（留出一些边距）
    const x = 20;
    const y = screenHeight - height - 100; // 增加底部边距

    super({
      width,
      height,
      x,
      y,
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
      html: 'keyboardOverlay.html',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
      ...options,
    });

    this.init();

    // 设置窗口完全穿透，不阻止任何鼠标事件
    this.win?.setIgnoreMouseEvents(true, { forward: true });

    this.win?.webContents.openDevTools({ mode: 'detach' });
  }

  show() {
    this.win?.show();
    this.win?.setAlwaysOnTop(true, 'screen-saver', 1);
  }
}
